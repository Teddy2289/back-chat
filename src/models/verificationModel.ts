// models/VerificationModel.ts
import prisma from "../config/prisma";
import { VerificationToken } from "../types";

export class VerificationModel {
  static async createToken(
    userId: number,
    token: string,
    expiresInHours: number = 24
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    await prisma.verificationToken.create({
      data: {
        user_id: userId,
        token,
        expires_at: expiresAt,
      },
    });
  }

  static async findValidToken(
    userId: number,
    token: string
  ): Promise<VerificationToken | null> {
    return await prisma.verificationToken.findFirst({
      where: {
        user_id: userId,
        token,
        expires_at: {
          gt: new Date(),
        },
      },
    });
  }

  static async deleteToken(tokenId: number): Promise<void> {
    await prisma.verificationToken.delete({
      where: { id: tokenId },
    });
  }

  static async deleteUserTokens(userId: number): Promise<void> {
    await prisma.verificationToken.deleteMany({
      where: { user_id: userId },
    });
  }
}
