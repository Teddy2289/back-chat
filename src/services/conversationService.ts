// services/conversationService.ts
import prisma from "../config/prisma";
import { paymentService } from "./paymentService";

export interface CreateConversationData {
  clientId: number;
  modelId: number;
}

export interface ConversationCheckResult {
  canChat: boolean;
  isPremium: boolean;
  remainingFreeMessages?: number;
  error?: string;
  conversation?: any;
  shouldUseAI?: boolean;
}

class ConversationService {
  async createConversation(data: CreateConversationData) {
    const conversation = await prisma.conversation.create({
      data: {
        clientId: data.clientId,
        modelId: data.modelId,
        status: "FREE_TRIAL", // Statut initial
      },
    });

    // Créer une allocation de messages gratuits
    await prisma.freeMessageAllowance.create({
      data: {
        userId: data.clientId,
        conversationId: conversation.id,
        messagesUsed: 0,
        maxMessages: 2,
      },
    });

    return conversation;
  }

  async checkConversationAccess(
    conversationId: number,
    userId: number
  ): Promise<ConversationCheckResult> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        payment: { include: { plan: true } },
        model: true,
        client: true,
        FreeMessageAllowance: true,
        messages: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
      },
    });

    if (!conversation) {
      return {
        canChat: false,
        isPremium: false,
        error: "Conversation not found",
      };
    }

    if (conversation.clientId !== userId) {
      return {
        canChat: false,
        isPremium: false,
        error: "Access denied: You are not the client of this conversation",
      };
    }

    // Vérifier l'accès premium
    if (conversation.status === "PREMIUM" && conversation.payment) {
      const now = new Date();
      const isPaymentValid =
        conversation.payment.status === "COMPLETED" &&
        conversation.payment.credits_used < conversation.payment.credits &&
        (!conversation.payment.expires_at ||
          now < conversation.payment.expires_at);

      if (isPaymentValid) {
        return {
          canChat: true,
          isPremium: true,
          shouldUseAI: false,
          conversation,
        };
      } else {
        // Si le paiement n'est plus valide, mettre à jour le statut
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { status: "PAYMENT_REQUIRED" },
        });
      }
    }

    // Vérifier les messages gratuits
    const freeAllowance = conversation.FreeMessageAllowance[0];
    if (freeAllowance && conversation.status === "FREE_TRIAL") {
      const now = new Date();
      if (freeAllowance.expiresAt < now) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { status: "PAYMENT_REQUIRED" },
        });

        return {
          canChat: false,
          isPremium: false,
          error: "Free messages expired",
          conversation,
        };
      }

      const remainingFreeMessages = Math.max(
        0,
        freeAllowance.maxMessages - freeAllowance.messagesUsed
      );

      if (remainingFreeMessages > 0) {
        return {
          canChat: true,
          isPremium: false,
          shouldUseAI: true, // Utiliser Gemini pour les réponses gratuites
          remainingFreeMessages,
          conversation,
        };
      } else {
        // Passer en mode paiement requis
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { status: "PAYMENT_REQUIRED" },
        });
      }
    }

    // Si on arrive ici, c'est que le paiement est requis
    return {
      canChat: false,
      isPremium: false,
      error: "Payment required to continue chatting",
      conversation,
    };
  }
  async incrementMessageCount(conversationId: number, userId: number) {
    // Vérifier si on doit utiliser un message gratuit ou premium
    const accessCheck = await this.checkConversationAccess(
      conversationId,
      userId
    );

    if (accessCheck.isPremium && accessCheck.conversation?.paymentId) {
      // Utiliser un crédit premium
      await prisma.payment.update({
        where: { id: accessCheck.conversation.paymentId },
        data: { credits_used: { increment: 1 } },
      });
    } else if (accessCheck.remainingFreeMessages !== undefined) {
      // Utiliser un message gratuit
      await prisma.freeMessageAllowance.update({
        where: {
          userId_conversationId: {
            userId,
            conversationId,
          },
        },
        data: { messagesUsed: { increment: 1 } },
      });
    }

    return await prisma.conversation.update({
      where: { id: conversationId },
      data: { message_count: { increment: 1 } },
    });
  }

  async getConversationById(id: number) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        payment: true,
        model: true,
        client: true,
        FreeMessageAllowance: true,
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                type: true,
              },
            },
          },
          orderBy: { created_at: "asc" },
        },
      },
    });
  }
}

export const conversationService = new ConversationService();
