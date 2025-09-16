// services/messageService.ts
import prisma from "../config/prisma";

export interface CreateMessageData {
  conversationId: number;
  senderId: number;
  isFromModel: boolean;
  content: string;
}

class MessageService {
  async createMessage(data: CreateMessageData) {
    return await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        isFromModel: data.isFromModel,
        content: data.content,
      },
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
    });
  }

  async getMessagesByConversation(conversationId: number) {
    return await prisma.message.findMany({
      where: { conversationId },
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
    });
  }

  async getLastMessage(conversationId: number) {
    return await prisma.message.findFirst({
      where: { conversationId },
      orderBy: { created_at: "desc" },
    });
  }
}

export const messageService = new MessageService();
