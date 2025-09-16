// services/ClientService.ts (Version optimisée)
import prisma from "../config/prisma";

export class ClientService {
  /**
   * Récupère tous les clients d'un modèle spécifique avec conversations et derniers messages
   */
  static async getClientsByModelId(
    modelId: number,
    includeMessages: boolean = true
  ) {
    return await prisma.user.findMany({
      where: {
        type: "Client",
        Conversation: {
          some: {
            modelId: modelId,
          },
        },
      },
      include: {
        Conversation: {
          where: {
            modelId: modelId,
          },
          include: {
            messages: includeMessages
              ? {
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
                  orderBy: {
                    created_at: "asc",
                  },
                  take: includeMessages ? undefined : 10, // Limiter à 10 messages si besoin
                }
              : false,
            model: {
              select: {
                id: true,
                prenom: true,
              },
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
          orderBy: {
            updated_at: "desc",
          },
        },
      },
      orderBy: {
        first_name: "asc",
      },
    });
  }

  /**
   * Récupère les messages d'une conversation spécifique
   */
  static async getConversationMessages(
    conversationId: number,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;

    return await prisma.message.findMany({
      where: {
        conversationId: conversationId,
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
      orderBy: {
        created_at: "asc",
      },
      skip,
      take: limit,
    });
  }

  /**
   * Récupère les clients avec statistiques (sans tous les messages pour optimiser)
   */
  static async getClientsWithStats(modelId: number) {
    const clients = await prisma.user.findMany({
      where: {
        type: "Client",
        Conversation: {
          some: {
            modelId: modelId,
          },
        },
      },
      include: {
        Conversation: {
          where: {
            modelId: modelId,
          },
          include: {
            messages: {
              orderBy: {
                created_at: "desc",
              },
              take: 1, // Seulement le dernier message
              include: {
                sender: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
            model: {
              select: {
                id: true,
                prenom: true,
              },
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
        },
      },
    });

    return clients.map((client) => ({
      id: client.id,
      email: client.email,
      first_name: client.first_name,
      last_name: client.last_name,
      type: client.type,
      is_verified: client.is_verified,
      created_at: client.created_at,
      updated_at: client.updated_at,
      Conversation: client.Conversation.map((conv) => ({
        id: conv.id,
        modelId: conv.modelId,
        clientId: conv.clientId,
        status: conv.status,
        is_premium: conv.is_premium,
        paymentId: conv.paymentId,
        message_count: conv._count.messages,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message: conv.messages[0] || null,
        model: conv.model,
      })),
    }));
  }
}
