import { Request, Response } from "express";
import prisma from "../config/prisma";

// ✅ Récupérer tous les plans de paiement
export const getPaymentPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.paymentPlan.findMany({
      orderBy: { price: "asc" },
    });
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ✅ Récupérer un plan de paiement par ID
export const getPaymentPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await prisma.paymentPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan de paiement non trouvé" });
    }

    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ✅ Créer un nouveau plan de paiement
export const createPaymentPlan = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration, credits, is_active } = req.body;

    const plan = await prisma.paymentPlan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        credits: parseInt(credits),
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ✅ Mettre à jour un plan de paiement
export const updatePaymentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, credits, is_active } = req.body;

    const plan = await prisma.paymentPlan.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(credits && { credits: parseInt(credits) }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    res.json(plan);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Plan de paiement non trouvé" });
    }
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ✅ Supprimer un plan de paiement
export const deletePaymentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.paymentPlan.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Plan de paiement non trouvé" });
    }
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
