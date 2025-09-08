import nodemailer from "nodemailer";
import { User } from "../types";
import dotenv from "dotenv";
dotenv.config();

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.MAIL_PORT || "465", 10),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  static async sendVerificationEmail(
    user: User,
    verificationToken: string
  ): Promise<void> {
    if (!this.transporter) {
      this.initializeTransporter();
    }
    console.log("BASE_URL", process.env.BASE_URL);
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?userId=${user.id}&token=${verificationToken}`;

    const mailOptions = {
      from: process.env.MAIL_USERNAME || process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Vérification de votre compte",
      html: `
        <h1>Bienvenue ${user.first_name} !</h1>
        <p>Cliquez sur le lien suivant pour vérifier votre compte :</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Email de vérification envoyé à:", user.email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw new Error("Erreur lors de l'envoi de l'email de vérification");
    }
  }

  // Méthode pour vérifier la configuration
  static async verifyConfiguration(): Promise<boolean> {
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
      console.warn(
        "⚠️  Configuration email manquante - les emails ne seront pas envoyés"
      );
      return false;
    }

    if (!this.transporter) {
      this.initializeTransporter();
    }

    try {
      await this.transporter.verify();
      console.log("✅ Configuration email vérifiée avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur de configuration email:", error);
      return false;
    }
  }
}
