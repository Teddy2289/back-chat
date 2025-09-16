// services/conversationService.ts
import prisma from "../config/prisma";

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
    conversationId: number
  ): Promise<ConversationCheckResult> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        payment: {
          include: { plan: true },
        },
        model: true,
      },
    });

    if (!conversation) {
      return {
        canChat: false,
        isPremium: false,
        error: "Conversation not found",
      };
    }

    // Vérifier l'accès premium
    if (conversation.is_premium && conversation.payment) {
      const canChatPremium =
        conversation.payment.status === "completed" &&
        conversation.payment.credits_used < conversation.payment.credits &&
        new Date() < (conversation.payment.expires_at || new Date());

      if (canChatPremium) {
        return {
          canChat: true,
          isPremium: true,
          conversation,
        };
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
