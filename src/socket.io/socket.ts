// socket.io/socket.ts - CORRIGÉ
import { Server } from "socket.io";
import http from "http";
import { conversationService } from "../services/conversationService";
import { messageService } from "../services/messageService";

export const configureSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true, // AJOUT IMPORTANT
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"], // AJOUT des transports
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Rejoindre une room de conversation
    socket.on(
      "join_conversation",
      async (data: { conversationId: number; userId: number }) => {
        try {
          const { conversationId, userId } = data;
          console.log("Join conversation request:", data);

          // Vérifier l'accès à la conversation
          const accessCheck = await conversationService.checkConversationAccess(
            conversationId,
            userId
          );

          if (accessCheck.canChat) {
            socket.join(`conversation_${conversationId}`);
            console.log(
              `✅ User ${userId} joined conversation ${conversationId}`
            );

            // Envoyer l'historique des messages
            const messages = await messageService.getMessagesByConversation(
              conversationId
            );
            socket.emit("conversation_history", messages);
            console.log(
              `📨 Sent ${messages.length} messages to user ${userId}`
            );
          } else {
            console.log("❌ Access denied for user:", userId);
            socket.emit("access_denied", {
              error: accessCheck.error || "Access denied",
            });
          }
        } catch (error) {
          console.error("Error joining conversation:", error);
          socket.emit("join_error", { error: "Failed to join conversation" });
        }
      }
    );

    // Quitter une conversation
    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User left conversation ${conversationId}`);
    });

    // Recevoir un nouveau message
    socket.on(
      "send_message",
      async (data: {
        conversationId: number;
        senderId: number;
        content: string;
        isFromModel: boolean;
      }) => {
        try {
          const { conversationId, senderId, content, isFromModel } = data;
          console.log("New message received:", data);

          // Sauvegarder le message
          const message = await messageService.createMessage({
            conversationId,
            senderId,
            isFromModel,
            content,
          });

          // Mettre à jour le compteur de messages
          await conversationService.incrementMessageCount(
            conversationId,
            senderId
          );

          // Diffuser le message à tous les participants de la conversation
          io.to(`conversation_${conversationId}`).emit("new_message", message);
          console.log(
            `📤 Message broadcasted to conversation ${conversationId}`
          );
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("message_error", { error: "Failed to send message" });
        }
      }
    );

    // Gérer la déconnexion
    socket.on("disconnect", (reason) => {
      console.log("User disconnected:", socket.id, "Reason:", reason);
    });

    // Gestion des erreurs de connexion
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  });

  return io;
};
