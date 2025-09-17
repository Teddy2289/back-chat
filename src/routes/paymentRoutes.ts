import express from "express";
import {
  createCheckoutSession,
  handleWebhook,
} from "../controllers/paymentController";
import {
  getPaymentPlans,
  getPaymentPlanById,
  createPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
} from "../controllers/paymentPlanController";
import { authenticateToken } from "../middleware/auth";
import prisma from "../config/prisma";
import { paymentService } from "../services/paymentService";

const router = express.Router();

// Middleware d'authentification pour les routes protégées
router.use(authenticateToken);

// Routes pour les plans de paiement (Admin)
router.get("/plans", getPaymentPlans);
router.get("/plans/:id", getPaymentPlanById);
router.post("/plans", createPaymentPlan);
router.put("/plans/:id", updatePaymentPlan);
router.delete("/plans/:id", deletePaymentPlan);

// Créer une session de checkout Stripe
router.post("/create-checkout-session", createCheckoutSession);

// Webhook Stripe (sans authentification, traitement brut)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Récupérer les plans actifs (public)
router.get("/active-plans", async (req, res) => {
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

// Vérifier le statut d'un paiement
router.post("/verify-payment", async (req, res) => {
  try {
    const { sessionId, conversationId } = req.body;
    const userId = (req as any).user?.id;

    if (!sessionId || !conversationId) {
      return res
        .status(400)
        .json({ error: "Session ID and Conversation ID are required" });
    }

    // Vérifier que l'utilisateur a accès à cette conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
    });

    if (!conversation || conversation.clientId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const isPaid = await paymentService.verifyPayment(sessionId);

    if (isPaid) {
      return res.json({
        success: true,
        message: "Payment verified and conversation upgraded to premium",
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
