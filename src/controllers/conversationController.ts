import { Request, Response } from "express";
import { conversationService } from "../services/conversationService";
import prisma from "../config/prisma";
import { messageService } from "../services/messageService";

class ConversationController {
  // Créer une conversation
  async createConversation(req: Request, res: Response) {
    try {
      const { clientId, modelId } = req.body;

      if (!clientId || !modelId) {
        return res
          .status(400)
          .json({ error: "clientId and modelId are required" });
      }

      const conversation = await conversationService.createConversation({
        clientId: parseInt(clientId),
        modelId: parseInt(modelId),
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Vérifier l'accès à une conversation
  async checkAccess(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id; // Récupérer l'ID utilisateur

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: User ID missing" });
      }

      const result = await conversationService.checkConversationAccess(
        parseInt(id),
        userId // Ajouter le userId
      );

      if (!result.canChat) {
        return res.status(403).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Error checking conversation access:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // controllers/chatController.ts - AJOUTER
  static async sendModelMessage(req: Request, res: Response) {
    try {
      const { conversationId, content } = req.body;
      const userId = (req as any).user?.id;

      if (!conversationId || !content) {
        return res
          .status(400)
          .json({ error: "conversationId and content are required" });
      }

      // Vérifier que l'utilisateur est bien un modèle
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { type: true },
      });

      if (user?.type !== "model") {
        return res
          .status(403)
          .json({ error: "Only models can send model messages" });
      }

      // Vérifier que la conversation appartient à ce modèle
      const conversation = await prisma.conversation.findUnique({
        where: { id: parseInt(conversationId) },
        include: { model: true },
      });

      if (!conversation || conversation.modelId !== userId) {
        return res
          .status(403)
          .json({ error: "You don't have access to this conversation" });
      }

      // Créer le message du modèle
      const modelMessage = await messageService.createMessage({
        conversationId: parseInt(conversationId),
        senderId: userId,
        isFromModel: true,
        content,
      });

      // Mettre à jour le compteur de messages
      await conversationService.incrementMessageCount(
        parseInt(conversationId),
        userId
      );

      // Émettre l'événement socket pour le nouveau message
      // (vous devrez passer l'instance socket.io à ce contrôleur)

      res.json({
        success: true,
        message: "Message sent successfully",
        data: modelMessage,
      });
    } catch (error: any) {
      console.error("Error sending model message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Récupérer une conversation
  async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const conversation = await conversationService.getConversationById(
        parseInt(id)
      );

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Incrémenter le nombre de messages
  async incrementMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updated = await conversationService.incrementMessageCount(
        (req as any).user?.id,
        parseInt(id)
      );

      res.json(updated);
    } catch (error) {
      console.error("Error incrementing message count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Incrémenter les crédits premium utilisés
  async incrementPremiumCredits(req: Request, res: Response) {
    try {
      const { paymentId } = req.body;

      if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
      }

      // const updated = await conversationService.incrementPremiumCreditsUsed(
      //   (req as any).user?.id,
      //   parseInt(paymentId)
      // );

      res.json(updated);
    } catch (error) {
      console.error("Error incrementing premium credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const conversationController = new ConversationController();
