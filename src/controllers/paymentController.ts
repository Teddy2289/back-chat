import { Request, Response } from "express";
import Stripe from "stripe";
import { paymentService } from "../services/paymentService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { planId, conversationId, userId } = req.body;
    const session = await paymentService.createCheckoutSession(
      planId,
      conversationId,
      userId
    );
    res.json({ id: session.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    // Vérifier que le secret webhook est défini
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
    }

    // Construire l'événement Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Traiter l'événement
    await paymentService.handleWebhookEvent(event);

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
