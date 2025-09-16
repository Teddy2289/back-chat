import { Request, Response } from "express";
import { ClientService } from "../services/ClientService";

export class ClientController {
  /**
   * Récupère tous les clients d'un modèle spécifique
   */
  static async getModelClients(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const { includeMessages } = req.query; // Option pour inclure les messages

      const id = parseInt(modelId);

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID modèle invalide",
        });
      }

      const includeMessagesBool = includeMessages === "true";
      const clients = await ClientService.getClientsByModelId(
        id,
        includeMessagesBool
      );

      res.status(200).json({
        success: true,
        message: "Clients récupérés avec succès",
        data: clients,
        count: clients.length,
      });
    } catch (error) {
      console.error("Get model clients error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des clients",
      });
    }
  }

  /**
   * Récupère les messages d'une conversation spécifique
   */
  static async getConversationMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const id = parseInt(conversationId);
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID conversation invalide",
        });
      }

      const messages = await ClientService.getConversationMessages(
        id,
        pageNum,
        limitNum
      );

      res.status(200).json({
        success: true,
        message: "Messages récupérés avec succès",
        data: messages,
        count: messages.length,
      });
    } catch (error) {
      console.error("Get conversation messages error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des messages",
      });
    }
  }

  /**
   * Récupère les clients avec des statistiques détaillées
   */
  static async getModelClientsWithStats(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const id = parseInt(modelId);

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID modèle invalide",
        });
      }

      const clients = await ClientService.getClientsWithStats(id);

      res.status(200).json({
        success: true,
        message: "Clients et statistiques récupérés avec succès",
        data: clients,
        count: clients.length,
      });
    } catch (error) {
      console.error("Get model clients with stats error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques clients",
      });
    }
  }
}
