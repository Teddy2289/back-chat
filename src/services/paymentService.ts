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
    const plan = await prisma.paymentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.is_active) {
      throw new Error("Plan not found or inactive");
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Vérifier si la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { client: true },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.clientId !== userId) {
      throw new Error("Unauthorized access to conversation");
    }

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
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
        conversationId: conversationId.toString(),
      },
    });

    await prisma.payment.create({
      data: {
        userId,
        planId,
        stripeId: session.id,
        amount: plan.price,
        credits: plan.credits,
        status: "PENDING",
        expires_at: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      },
    });

    return session;
  }

  async handleWebhookEvent(event: Stripe.Event) {
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === "paid") {
          // Mettre à jour le statut du paiement
          const payment = await prisma.payment.update({
            where: { stripeId: session.id },
            data: { status: "COMPLETED" },
          });

          // Mettre à jour la conversation
          if (session.metadata?.conversationId) {
            await prisma.conversation.update({
              where: { id: parseInt(session.metadata.conversationId) },
              data: {
                is_premium: true,
                paymentId: payment.id,
              },
            });
          }

          console.log(`Payment ${payment.id} completed successfully`);
        }
      } else if (event.type === "checkout.session.expired") {
        const session = event.data.object as Stripe.Checkout.Session;

        await prisma.payment.update({
          where: { stripeId: session.id },
          data: { status: "EXPIRED" },
        });

        console.log(`Payment session ${session.id} expired`);
      }
    } catch (error) {
      console.error("Error in webhook handler:", error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const payment = await prisma.payment.update({
          where: { stripeId: sessionId },
          data: { status: "COMPLETED" },
        });

        if (session.metadata?.conversationId) {
          await prisma.conversation.update({
            where: { id: parseInt(session.metadata.conversationId) },
            data: {
              is_premium: true,
              paymentId: payment.id,
            },
          });
        }

        return true;
      } else if (session.payment_status === "expired") {
        await prisma.payment.update({
          where: { stripeId: sessionId },
          data: { status: "EXPIRED" },
        });
      }

      return false;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
