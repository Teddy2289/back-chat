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
}

class ConversationService {
  async createConversation(data: CreateConversationData) {
    return await prisma.conversation.create({
      data: {
        clientId: data.clientId,
        modelId: data.modelId,
      },
    });
  }

  async checkConversationAccess(
    conversationId: number,
    userId: number
  ): Promise<ConversationCheckResult> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        payment: {
          include: { plan: true },
        },
        model: true,
        client: true,
      },
    });

    if (!conversation) {
      return {
        canChat: false,
        isPremium: false,
        error: "Conversation not found",
      };
    }

    // Vérifier que l'utilisateur a accès à cette conversation
    if (conversation.clientId !== userId) {
      return {
        canChat: false,
        isPremium: false,
        error: "Access denied",
      };
    }

    // Vérifier l'accès premium
    if (conversation.is_premium && conversation.payment) {
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
          conversation,
        };
      } else if (conversation.payment.status === "PENDING") {
        // Si le paiement est en attente, vérifier avec Stripe
        try {
          const isPaid = await paymentService.verifyPayment(
            conversation.payment.stripeId
          );
          if (isPaid) {
            return this.checkConversationAccess(conversationId, userId);
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      }
    }

    // Vérifier les messages gratuits
    const remainingFreeMessages = Math.max(0, 2 - conversation.message_count);
    if (remainingFreeMessages > 0) {
      return {
        canChat: true,
        isPremium: false,
        remainingFreeMessages,
        conversation,
      };
    }

    return {
      canChat: false,
      isPremium: false,
      error: "Payment required",
      conversation,
    };
  }

  async incrementMessageCount(conversationId: number) {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data: { message_count: { increment: 1 } },
    });
  }

  async incrementPremiumCreditsUsed(paymentId: number) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { credits_used: { increment: 1 } },
    });
  }
  async getConversationById(id: number) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        payment: true,
        model: true,
        client: true,
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
