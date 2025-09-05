import pool from "../config/database";
import { Model, CreateModelRequest, UpdateModelRequest } from "../types";

export class ModelModel {
    /**
     * Crée un nouveau modèle
     */
    static async create(
        modelData: Omit<Model, "id" | "created_at" | "updated_at">
    ): Promise<Model> {
        const [result] = await pool.execute(
            `INSERT INTO models (prenom, age, nationalite, passe_temps, citation, domicile, localisation, photo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                modelData.prenom,
                modelData.age,
                modelData.nationalite,
                modelData.passe_temps,
                modelData.citation,
                modelData.domicile,
                modelData.localisation,
                modelData.photo || null, // Gestion de la photo optionnelle
            ]
        );

        const insertResult = result as any;
        return this.findById(insertResult.insertId) as Promise<Model>;
    }

    /**
     * Trouve un modèle par son ID
     */
    static async findById(id: number): Promise<Model | null> {
        const [rows] = await pool.execute("SELECT * FROM models WHERE id = ?", [id]);
        const models = rows as Model[];
        return models.length > 0 ? models[0] : null;
    }

    /**
     * Récupère tous les modèles
     */
    static async findAll(): Promise<Model[]> {
        const [rows] = await pool.execute("SELECT * FROM models ORDER BY created_at DESC");
        return rows as Model[];
    }
    /**
     * Supprime un modèle
     */
    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute("DELETE FROM models WHERE id = ?", [id]);
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    /**
     * Recherche des modèles par critères
     */
    static async search(criteria: {
        prenom?: string;
        nationalite?: string;
        localisation?: string;
        age_min?: number;
        age_max?: number;
    }): Promise<Model[]> {
        let query = "SELECT * FROM models WHERE 1=1";
        const values: any[] = [];

        if (criteria.prenom) {
            query += " AND prenom LIKE ?";
            values.push(`%${criteria.prenom}%`);
        }

        if (criteria.nationalite) {
            query += " AND nationalite LIKE ?";
            values.push(`%${criteria.nationalite}%`);
        }

        if (criteria.localisation) {
            query += " AND localisation LIKE ?";
            values.push(`%${criteria.localisation}%`);
        }

        if (criteria.age_min !== undefined) {
            query += " AND age >= ?";
            values.push(criteria.age_min);
        }

        if (criteria.age_max !== undefined) {
            query += " AND age <= ?";
            values.push(criteria.age_max);
        }

        query += " ORDER BY created_at DESC";

        const [rows] = await pool.execute(query, values);
        return rows as Model[];
    }

    /**
     * Met à jour un modèle
     */
    static async update(id: number, modelData: UpdateModelRequest): Promise<Model | null> {
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (modelData.prenom !== undefined) {
            updateFields.push("prenom = ?");
            updateValues.push(modelData.prenom);
        }

        if (modelData.age !== undefined) {
            updateFields.push("age = ?");
            updateValues.push(modelData.age);
        }

        if (modelData.nationalite !== undefined) {
            updateFields.push("nationalite = ?");
            updateValues.push(modelData.nationalite);
        }

        if (modelData.passe_temps !== undefined) {
            updateFields.push("passe_temps = ?");
            updateValues.push(modelData.passe_temps);
        }

        if (modelData.citation !== undefined) {
            updateFields.push("citation = ?");
            updateValues.push(modelData.citation);
        }

        if (modelData.domicile !== undefined) {
            updateFields.push("domicile = ?");
            updateValues.push(modelData.domicile);
        }

        if (modelData.localisation !== undefined) {
            updateFields.push("localisation = ?");
            updateValues.push(modelData.localisation);
        }

        if (modelData.photo !== undefined) {
            updateFields.push("photo = ?");
            updateValues.push(modelData.photo);
        }

        if (updateFields.length === 0) {
            return this.findById(id);
        }

        updateFields.push("updated_at = CURRENT_TIMESTAMP");
        updateValues.push(id);

        await pool.execute(
            `UPDATE models SET ${updateFields.join(", ")} WHERE id = ?`,
            updateValues
        );

        return this.findById(id);
    }
}