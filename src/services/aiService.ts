// services/aiService.ts
import {
  ConversationCheckResult,
  conversationService,
} from "./conversationService";
import { messageService } from "./messageService";

// Configuration Gemini (gratuit)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationId: number;
  userId: number;
}

class AIService {
  async processChatMessage(request: ChatRequest) {
    const { conversationId, message, userId } = request;

    // Vérifier l'accès à la conversation
    const accessCheck = await conversationService.checkConversationAccess(
      conversationId,
      userId
    );

    if (!accessCheck.canChat) {
      throw new Error(accessCheck.error || "Access denied");
    }

    // Sauvegarder le message de l'utilisateur
    const userMessage = await messageService.createMessage({
      conversationId,
      senderId: userId,
      isFromModel: false,
      content: message,
    });

    // Mettre à jour les compteurs
    await conversationService.incrementMessageCount(conversationId, userId);

    // Générer une réponse IA seulement pour les messages gratuits
    if (accessCheck.shouldUseAI) {
      const aiResponse = await this.generateAIResponse(
        message,
        accessCheck.conversation.model
      );

      // Sauvegarder la réponse IA
      const aiMessage = await messageService.createMessage({
        conversationId,
        senderId: accessCheck.conversation.modelId,
        isFromModel: true,
        content: aiResponse,
      });

      return aiMessage;
    }

    // Pour les conversations premium, ne pas générer de réponse automatique
    // Les modérateurs répondront manuellement
    return null;
  }

  private async generateAIResponse(
    message: string,
    modelData: any
  ): Promise<string> {
    try {
      // Utiliser le modèle Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        Tu es ${modelData.prenom}, un modèle avec les caractéristiques suivantes:
        - Âge: ${modelData.age}
        - Nationalité: ${modelData.nationalite}
        - Passe-temps: ${modelData.passe_temps}
        - Citation favorite: ${modelData.citation}
        - Domicile: ${modelData.domicile}
        
        Réponds à ce message de manière naturelle et engageante: "${message}"
        
        Ta réponse doit être courte (max 2 phrases) et correspondre à ta personnalité.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Erreur avec Gemini:", error);
      // Réponse de fallback
      return `Merci pour ton message! ${modelData.prenom} te répondra bientôt.`;
    }
  }
}

export const aiService = new AIService();
