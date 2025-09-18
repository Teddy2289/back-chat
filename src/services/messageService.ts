// services/messageService.ts
import { MessageType } from "../generated/prisma";
import prisma from "../config/prisma";
import { uploadFileLocal, deleteFileLocal } from "./fileUploadService";
import path from "path";

export interface CreateMessageData {
  conversationId: number;
  senderId: number;
  isFromModel: boolean;
  content: string;
  type?: MessageType;
  file?: Express.Multer.File;
}

class MessageService {
  async createMessage(data: CreateMessageData) {
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let filePath = null;

    // Upload du fichier si présent
    if (data.file) {
      try {
        const uploadResult = await uploadFileLocal(data.file);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        filePath = uploadResult.filePath;
        fileSize = data.file.size;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("File upload failed");
      }
    }

    return await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        isFromModel: data.isFromModel,
        content: data.content,
        type: data.type || MessageType.TEXT,
        fileUrl,
        fileName,
        fileSize,
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

  async deleteMessage(messageId: number, userId: number) {
    // Vérifier que l'utilisateur est bien l'auteur du message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Unauthorized: You can only delete your own messages");
    }

    // Supprimer le fichier associé s'il existe
    if (message.fileUrl) {
      try {
        // Extraire le chemin du fichier (vous devriez stocker filePath dans la base)
        const urlParts = message.fileUrl.split("/");
        const storedFileName = urlParts[urlParts.length - 1];
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "chat",
          storedFileName
        );

        await deleteFileLocal(filePath);
      } catch (error) {
        console.error("Error deleting file:", error);
        // On continue quand même à supprimer le message même si le fichier n'a pas pu être supprimé
      }
    }

    return await prisma.message.delete({
      where: { id: messageId },
    });
  }

  async getMessageById(messageId: number) {
    return await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            type: true,
          },
        },
        conversation: {
          include: {
            model: true,
            client: true,
          },
        },
      },
    });
  }

  // Méthode pour déterminer le type de message basé sur le fichier
  determineMessageType(file?: Express.Multer.File): MessageType {
    if (!file) return MessageType.TEXT;

    const ext = file.originalname.split(".").pop()?.toLowerCase() || "";
    const mimeType = file.mimetype;

    if (
      mimeType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    ) {
      return MessageType.IMAGE;
    } else if (
      mimeType.startsWith("video/") ||
      ["mp4", "mov", "avi", "webm"].includes(ext)
    ) {
      return MessageType.VIDEO;
    } else if (
      mimeType.startsWith("audio/") ||
      ["mp3", "wav", "ogg"].includes(ext)
    ) {
      return MessageType.AUDIO;
    } else {
      return MessageType.FILE;
    }
  }

  // Méthode pour compter les messages d'une conversation
  async countMessages(conversationId: number) {
    return await prisma.message.count({
      where: { conversationId },
    });
  }

  // Méthode pour récupérer les messages avec pagination
  async getMessagesWithPagination(
    conversationId: number,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;

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
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    });
  }
}

export const messageService = new MessageService();
