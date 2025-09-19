// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { UserModel } from "../models/userModel";
import { UserType } from "../generated/prisma";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'accès requis",
      });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // CORRECTION ICI : Assurez-vous que le type est correctement converti
    (req as any).user = {
      id: user.id,
      email: user.email,
      type: user.type as UserType, // Conversion explicite en UserType
      is_verified: user.is_verified,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res.status(403).json({
      success: false,
      message: "Token invalide ou expiré",
    });
  }
};
