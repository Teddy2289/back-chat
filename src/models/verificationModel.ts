import pool from "../config/database";
import { VerificationToken } from "../types";

export class VerificationModel {
  static async createToken(
    userId: number,
    token: string,
    expiresInHours: number = 24
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    await pool.execute(
      "INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );
  }

  static async findValidToken(
    userId: number,
    token: string
  ): Promise<VerificationToken | null> {
    const [rows]: any = await pool.execute(
      "SELECT * FROM verification_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()",
      [userId, token]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  static async deleteToken(tokenId: number): Promise<void> {
    await pool.execute("DELETE FROM verification_tokens WHERE id = ?", [
      tokenId,
    ]);
  }

  static async deleteUserTokens(userId: number): Promise<void> {
    await pool.execute("DELETE FROM verification_tokens WHERE user_id = ?", [
      userId,
    ]);
  }
}
