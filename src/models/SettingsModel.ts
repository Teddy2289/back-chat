// models/SettingsModel.ts
import prisma from "../config/prisma";
import { SiteSettings, SettingsSection } from "../types";

export class SettingsModel {
  static async findAll(): Promise<SiteSettings[]> {
    return await prisma.siteSettings.findMany({
      orderBy: { section: "asc" },
    });
  }

  static async findBySection(
    section: SettingsSection
  ): Promise<SiteSettings | null> {
    return await prisma.siteSettings.findUnique({
      where: { section },
    });
  }

  static async upsert(
    section: SettingsSection,
    settingsData: Record<string, any>,
    isActive: boolean = true
  ): Promise<SiteSettings> {
    return await prisma.siteSettings.upsert({
      where: { section },
      update: {
        settings: settingsData,
        is_active: isActive,
      },
      create: {
        section,
        settings: settingsData,
        is_active: isActive,
      },
    });
  }

  static async toggleSection(
    section: SettingsSection,
    isActive: boolean
  ): Promise<boolean> {
    const result = await prisma.siteSettings.update({
      where: { section },
      data: { is_active: isActive },
    });
    return result !== null;
  }

  static async deleteSection(section: SettingsSection): Promise<boolean> {
    const result = await prisma.siteSettings.delete({
      where: { section },
    });
    return result !== null;
  }

  static async initializeDefaultSettings(): Promise<void> {
    const count = await prisma.siteSettings.count();

    if (count === 0) {
      const defaultSettings = [
        {
          section: "general",
          settings: {
            site_title: "Mon Site",
            site_subtitle: "Sous-titre du site",
            social_title: "Suivez-nous",
            facebook_url: "",
            twitter_url: "",
            instagram_url: "",
            linkedin_url: "",
            youtube_url: "",
          },
          is_active: true,
        },
        {
          section: "appearance",
          settings: {
            logo_type: "image",
            logo_image_url: "",
            logo_text: "Mon Site",
            logo_slogan: "Sous-titre du site",
          },
          is_active: true,
        },
      ];

      for (const setting of defaultSettings) {
        await prisma.siteSettings.create({
          data: setting,
        });
      }
    }
  }

  static async sectionExists(section: SettingsSection): Promise<boolean> {
    const count = await prisma.siteSettings.count({
      where: { section },
    });
    return count > 0;
  }

  static async findActiveSections(): Promise<SiteSettings[]> {
    return await prisma.siteSettings.findMany({
      where: { is_active: true },
      orderBy: { section: "asc" },
    });
  }
}
