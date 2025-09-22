// controllers/messageController.ts
import { Request, Response } from "express";
import { messageService } from "../services/messageService";
import { conversationService } from "../services/conversationService";

class MessageController {
  // Envoyer un message en tant que client
  async sendClientMessage(req: Request, res: Response) {
    try {
      const { conversationId, content } = req.body;
      const userId = (req as any).user?.id;

      if (!conversationId || !content) {
        return res
          .status(400)
          .json({ error: "conversationId and content are required" });
      }

      const message = await messageService.createClientMessage({
        conversationId: parseInt(conversationId),
        clientId: userId,
        content,
      });

      // Émettre l'événement socket.io
      const io = req.app.get("socketio");
      io.to(`conversation_${conversationId}`).emit("new_message", message);

      // Incrémenter le compteur de messages
      await conversationService.incrementMessageCount(
        parseInt(conversationId),
        userId
      );

      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error sending client message:", error);
      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Envoyer un message en tant que modèle
  async sendModelMessage(req: Request, res: Response) {
    try {
      const { conversationId, content } = req.body;
      const userId = (req as any).user?.id;

      if (!conversationId || !content) {
        return res
          .status(400)
          .json({ error: "conversationId and content are required" });
      }

      const message = await messageService.createModelMessage({
        conversationId: parseInt(conversationId),
        modelId: userId,
        content,
      });

      // Émettre l'événement socket.io
      const io = req.app.get("socketio");
      io.to(`conversation_${conversationId}`).emit("new_message", message);

      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error sending model message:", error);
      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const messageController = new MessageController();
