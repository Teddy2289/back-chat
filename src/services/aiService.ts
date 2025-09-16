// services/aiService.ts
import {
  ConversationCheckResult,
  conversationService,
} from "./conversationService";
import { messageService } from "./messageService";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationId: number;
  history: ChatMessage[];
  modelData?: any;
  userId: number; // Ajout de l'userId
}

class AIService {
  async processChatMessage(request: ChatRequest) {
    const { conversationId, message, userId } = request;

    // Vérifier l'accès à la conversation et récupérer les données du modèle
    const accessCheck = await conversationService.checkConversationAccess(
      conversationId
    );

    if (!accessCheck.canChat) {
      throw new Error(accessCheck.error || "Access denied");
    }

    // Utiliser le modèle de la conversation si modelData n'est pas fourni
    const modelData = request.modelData || accessCheck.conversation?.model;

    if (!modelData) {
      throw new Error("Model data not available");
    }

    // Sauvegarder le message de l'utilisateur
    const userMessage = await messageService.createMessage({
      conversationId,
      senderId: userId,
      isFromModel: false,
      content: message,
    });

    // Mettre à jour les compteurs
    if (accessCheck.isPremium && accessCheck.conversation?.paymentId) {
      await conversationService.incrementPremiumCreditsUsed(
        accessCheck.conversation.paymentId
      );
    }

    await conversationService.incrementMessageCount(conversationId);

    // Générer la réponse IA
    const aiResponse = await this.generateAIResponse(
      message,
      request.history,
      modelData
    );

    // Sauvegarder la réponse de l'IA
    const modelMessage = await messageService.createMessage({
      conversationId,
      senderId: modelData.id, // Utiliser l'ID du modèle comme sender
      isFromModel: true,
      content: aiResponse,
    });

    return aiResponse;
  }

  private async generateAIResponse(
    message: string,
    history: ChatMessage[],
    modelData: any
  ): Promise<string> {
    // Implémentez votre logique de génération de réponse IA ici
    console.log("Generating AI response for model:", modelData);

    // Exemple de réponse basique
    return `Réponse du modèle ${
      modelData.prenom || modelData.name
    }: Merci pour votre message "${message}" !`;
  }
}

export const aiService = new AIService();
