// services/paymentService.ts
import prisma from "../config/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

class PaymentService {
  async createCheckoutSession(
    planId: number,
    conversationId: number,
    userId: number
  ) {
    // Récupérer le plan
    const plan = await prisma.paymentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/chat/success?session_id={CHECKOUT_SESSION_ID}&conversation_id=${conversationId}`,
      cancel_url: `${process.env.FRONTEND_URL}/chat/cancel`,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
        conversationId: conversationId.toString(),
      },
    });

    // Enregistrer le paiement en DB
    await prisma.payment.create({
      data: {
        userId,
        planId,
        stripeId: session.id,
        amount: plan.price,
        credits: plan.credits,
        status: "pending",
        expires_at: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      },
    });

    return session;
  }

  async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await prisma.payment.update({
        where: { stripeId: session.id },
        data: { status: "completed" },
        include: { plan: true },
      });

      await prisma.conversation.update({
        where: { id: parseInt(session.metadata!.conversationId) },
        data: {
          is_premium: true,
          paymentId: payment.id,
        },
      });

      return payment;
    }

    return null;
  }
}

export const paymentService = new PaymentService();
