// controllers/moderatorController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";

export class ModeratorController {
  // Récupérer les conversations assignées à un modérateur
  static async getModeratorConversations(req: Request, res: Response) {
    try {
      const { moderatorId } = req.params;
      const userId = (req as any).user?.id;
      const userType = (req as any).user?.type;

      // Vérifier que l'utilisateur est un modérateur
      if (userType !== "Agent") {
        return res.status(403).json({
          success: false,
          message: "Accès réservé aux modérateurs",
        });
      }

      // Vérifier que l'utilisateur accède à ses propres conversations
      if (parseInt(moderatorId) !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      // Récupérer les conversations assignées à ce modérateur
      const conversations = await prisma.conversation.findMany({
        where: {
          modelId: parseInt(moderatorId),
          status: "ACTIVE",
          is_premium: true,
        },
        include: {
          client: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          model: {
            select: {
              id: true,
              prenom: true,
            },
          },
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
          },
          FreeMessageAllowance: true,
        },
        orderBy: { updated_at: "desc" },
      });

      // Formater la réponse
      const formattedConversations = conversations.map((conv) => ({
        id: conv.id,
        client: conv.client,
        model: conv.model,
        lastMessage: conv.messages[0] || null,
        message_count: conv.message_count,
        status: conv.status,
        is_premium: conv.is_premium,
      }));

      res.json({
        success: true,
        data: formattedConversations,
      });
    } catch (error) {
      console.error("Error fetching moderator conversations:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des conversations",
      });
    }
  }

  // Récupérer les messages envoyés par un modérateur
  static async getModeratorMessages(req: Request, res: Response) {
    try {
      const { moderatorId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = (req as any).user?.id;
      const userType = (req as any).user?.type;

      // Vérifier que l'utilisateur est un modérateur
      if (userType !== "model") {
        return res.status(403).json({
          success: false,
          message: "Accès réservé aux modérateurs",
        });
      }

      // Vérifier l'accès
      if (parseInt(moderatorId) !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Récupérer les messages envoyés par ce modérateur
      const messages = await prisma.message.findMany({
        where: {
          senderId: parseInt(moderatorId),
          isFromModel: true,
        },
        include: {
          conversation: {
            include: {
              client: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: parseInt(limit as string),
      });

      const total = await prisma.message.count({
        where: {
          senderId: parseInt(moderatorId),
          isFromModel: true,
        },
      });

      res.json({
        success: true,
        data: messages,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error("Error fetching moderator messages:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des messages",
      });
    }
  }

  // Mettre à jour le statut d'une conversation
  static async updateConversationStatus(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id;
      const userType = (req as any).user?.type;

      // Vérifier que l'utilisateur est un modérateur
      if (userType !== "model") {
        return res.status(403).json({
          success: false,
          message: "Accès réservé aux modérateurs",
        });
      }

      // Vérifier que la conversation existe et appartient à ce modérateur
      const conversation = await prisma.conversation.findUnique({
        where: { id: parseInt(conversationId) },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation non trouvée",
        });
      }

      if (conversation.modelId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à cette conversation",
        });
      }

      // Mettre à jour le statut
      const updatedConversation = await prisma.conversation.update({
        where: { id: parseInt(conversationId) },
        data: { status },
      });

      res.json({
        success: true,
        data: updatedConversation,
      });
    } catch (error) {
      console.error("Error updating conversation status:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour du statut",
      });
    }
  }

  // Récupérer les statistiques du modérateur
  static async getModeratorStats(req: Request, res: Response) {
    try {
      const { moderatorId } = req.params;
      const userId = (req as any).user?.id;
      const userType = (req as any).user?.type;

      // Vérifier que l'utilisateur est un modérateur
      if (userType !== "model") {
        return res.status(403).json({
          success: false,
          message: "Accès réservé aux modérateurs",
        });
      }

      // Vérifier l'accès
      if (parseInt(moderatorId) !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      // Statistiques des conversations
      const totalConversations = await prisma.conversation.count({
        where: { modelId: parseInt(moderatorId) },
      });

      const activeConversations = await prisma.conversation.count({
        where: {
          modelId: parseInt(moderatorId),
          status: "ACTIVE",
        },
      });

      // Statistiques des messages
      const totalMessages = await prisma.message.count({
        where: {
          senderId: parseInt(moderatorId),
          isFromModel: true,
        },
      });

      // Messages des dernières 24 heures
      const last24hMessages = await prisma.message.count({
        where: {
          senderId: parseInt(moderatorId),
          isFromModel: true,
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      res.json({
        success: true,
        data: {
          totalConversations,
          activeConversations,
          totalMessages,
          last24hMessages,
        },
      });
    } catch (error) {
      console.error("Error fetching moderator stats:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des statistiques",
      });
    }
  }
}
