// routes/paymentRoutes.ts
import express from "express";
import {
  createCheckoutSession,
  handleWebhook,
} from "../controllers/paymentController";
import prisma from "../config/prisma";

const router = express.Router();

// ✅ Créer une session de checkout Stripe
router.post("/create-checkout-session", createCheckoutSession);

// ✅ Webhook Stripe (⚠️ express.raw pour le body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// ✅ Récupérer les plans actifs
router.get("/plans", async (req, res) => {
  try {
    const plans = await prisma.paymentPlan.findMany({
      where: { is_active: true },
      orderBy: { price: "asc" },
    });
    res.json(plans);
  } catch (error) {
    console.error("Error fetching payment plans:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Vérifier le statut d’un paiement
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, conversationId } = req.body;

    if (!sessionId || !conversationId) {
      return res
        .status(400)
        .json({ error: "Session ID and Conversation ID are required" });
    }

    const payment = await prisma.payment.findUnique({
      where: { stripeId: sessionId },
      include: { plan: true },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status === "completed") {
      await prisma.conversation.update({
        where: { id: parseInt(conversationId) },
        data: {
          is_premium: true,
          paymentId: payment.id,
        },
      });

      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(402).json({
        success: false,
        error: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
