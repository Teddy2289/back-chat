import pool from "../config/database";
import { Photo } from "../types";

export class PhotoModel {
  static async findAll(): Promise<Photo[]> {
    const [rows] = await pool.execute(
      "SELECT * FROM photos ORDER BY created_at DESC"
    );
    return rows as Photo[];
  }

  static async findById(id: number): Promise<Photo | null> {
    const [rows] = await pool.execute("SELECT * FROM photos WHERE id = ?", [
      id,
    ]);
    const photos = rows as Photo[];
    return photos.length > 0 ? photos[0] : null;
  }

  static async create(
    photo: Omit<Photo, "id" | "created_at" | "updated_at" | "likes">
  ): Promise<Photo> {
    const [result] = await pool.execute(
      `INSERT INTO photos (url, alt, tags) VALUES (?, ?, ?)`,
      [photo.url, photo.alt, JSON.stringify(photo.tags)]
    );

    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  static async update(
    id: number,
    photoData: Partial<Photo>
  ): Promise<Photo | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (photoData.url) {
      updates.push("url = ?");
      values.push(photoData.url);
    }

    if (photoData.alt) {
      updates.push("alt = ?");
      values.push(photoData.alt);
    }

    if (photoData.tags) {
      updates.push("tags = ?");
      values.push(JSON.stringify(photoData.tags));
    }

    if (updates.length > 0) {
      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE photos SET ${updates.join(", ")} WHERE id = ?`;
      await pool.execute(query, values);
    }

    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute("DELETE FROM photos WHERE id = ?", [
      id,
    ]);
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  static async incrementLikes(id: number): Promise<Photo | null> {
    await pool.execute("UPDATE photos SET likes = likes + 1 WHERE id = ?", [
      id,
    ]);
    return this.findById(id);
  }

  static async findByTag(tag: string): Promise<Photo[]> {
    const [rows] = await pool.execute(
      "SELECT * FROM photos WHERE JSON_CONTAINS(tags, JSON_QUOTE(?)) ORDER BY created_at DESC",
      [tag]
    );
    return rows as Photo[];
  }
}
