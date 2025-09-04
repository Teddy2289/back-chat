import pool from "../config/database";
import { User, UserType } from "../types";

export class UserModel {
  static async create(
    user: Omit<User, "id" | "created_at" | "updated_at">
  ): Promise<User> {
    const userType = user.type || UserType.USER; // Valeur par défaut

    const [result] = await pool.execute(
      `INSERT INTO users (email, password, first_name, last_name, type, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.email,
        user.password,
        user.first_name,
        user.last_name,
        userType,
        false,
      ]
    );

    const insertResult = result as mysql.ResultSetHeader;
    return this.findById(insertResult.insertId);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  static async updateVerificationStatus(
    id: number,
    isVerified: boolean
  ): Promise<void> {
    await pool.execute("UPDATE users SET is_verified = ? WHERE id = ?", [
      isVerified,
      id,
    ]);
  }
}
