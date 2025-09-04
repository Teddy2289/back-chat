import pool from "../config/database";
import { User, UserType, UpdateUserRequest, CreateUserRequest } from "../types";
import { PasswordUtils } from "../utils/passwordUtils";

export class UserService {
  /**
   * Récupère tous les utilisateurs
   */
  static async findAll(): Promise<User[]> {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM users ORDER BY created_at DESC"
      );
      const users = rows as User[];

      // Retirer les mots de passe de la réponse
      return users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Erreur lors de la récupération des utilisateurs");
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [
        id,
      ]);
      const users = rows as User[];

      if (users.length === 0) {
        return null;
      }

      // Retirer le mot de passe de la réponse
      const { password, ...userWithoutPassword } = users[0];
      return userWithoutPassword as User;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async create(userData: CreateUserRequest): Promise<User> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      const hashedPassword = await PasswordUtils.hashPassword(
        userData.password
      );

      const userType = userData.type || UserType.USER; // Valeur par défaut
      const isVerified =
        userData.is_verified !== undefined ? userData.is_verified : true;

      const [result] = await pool.execute(
        `INSERT INTO users (email, password, first_name, last_name, type, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userData.email,
          hashedPassword,
          userData.first_name,
          userData.last_name,
          userType,
          isVerified,
        ]
      );

      const insertResult = result as any;
      const newUser = await this.findById(insertResult.insertId);

      if (!newUser) {
        throw new Error("Erreur lors de la création de l'utilisateur");
      }

      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la création de l'utilisateur");
    }
  }

  /**
   * Met à jour un utilisateur existant
   */
  static async update(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await this.findByEmail(userData.email);
        if (userWithEmail && userWithEmail.id !== id) {
          throw new Error("Un autre utilisateur utilise déjà cet email");
        }
      }

      // Préparer les champs à mettre à jour
      let updateFields: string[] = [];
      let updateValues: any[] = [];

      if (userData.first_name !== undefined) {
        updateFields.push("first_name = ?");
        updateValues.push(userData.first_name);
      }

      if (userData.last_name !== undefined) {
        updateFields.push("last_name = ?");
        updateValues.push(userData.last_name);
      }

      if (userData.email !== undefined) {
        updateFields.push("email = ?");
        updateValues.push(userData.email);
      }

      if (userData.type !== undefined) {
        updateFields.push("type = ?");
        updateValues.push(userData.type);
      }

      if (userData.is_verified !== undefined) {
        updateFields.push("is_verified = ?");
        updateValues.push(userData.is_verified);
      }

      // Si un nouveau mot de passe est fourni, le hacher
      if (userData.password) {
        const hashedPassword = await PasswordUtils.hashPassword(
          userData.password
        );
        updateFields.push("password = ?");
        updateValues.push(hashedPassword);
      }

      // Ajouter la date de mise à jour
      updateFields.push("updated_at = CURRENT_TIMESTAMP");

      // Exécuter la mise à jour
      if (updateFields.length > 0) {
        const query = `UPDATE users SET ${updateFields.join(
          ", "
        )} WHERE id = ?`;
        updateValues.push(id);

        await pool.execute(query, updateValues);
      }

      // Récupérer l'utilisateur mis à jour
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new Error("Erreur lors de la mise à jour de l'utilisateur");
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  /**
   * Supprime un utilisateur
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error("Utilisateur non trouvé");
      }

      // Supprimer l'utilisateur
      await pool.execute("DELETE FROM users WHERE id = ?", [id]);

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    }
  }

  /**
   * Recherche des utilisateurs par critères
   */
  static async search(criteria: {
    email?: string;
    first_name?: string;
    last_name?: string;
    type?: UserType;
    is_verified?: boolean;
  }): Promise<User[]> {
    try {
      let query = "SELECT * FROM users WHERE 1=1";
      const values: any[] = [];

      if (criteria.email) {
        query += " AND email LIKE ?";
        values.push(`%${criteria.email}%`);
      }

      if (criteria.first_name) {
        query += " AND first_name LIKE ?";
        values.push(`%${criteria.first_name}%`);
      }

      if (criteria.last_name) {
        query += " AND last_name LIKE ?";
        values.push(`%${criteria.last_name}%`);
      }

      if (criteria.type) {
        query += " AND type = ?";
        values.push(criteria.type);
      }

      if (criteria.is_verified !== undefined) {
        query += " AND is_verified = ?";
        values.push(criteria.is_verified);
      }

      query += " ORDER BY created_at DESC";

      const [rows] = await pool.execute(query, values);
      const users = rows as User[];

      // Retirer les mots de passe de la réponse
      return users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      });
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error("Erreur lors de la recherche des utilisateurs");
    }
  }

  /**
   * Trouve un utilisateur par email (méthode utilitaire interne)
   */
  private static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
}
