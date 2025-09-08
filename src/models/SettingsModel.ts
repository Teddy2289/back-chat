// models/SettingsModel.ts
import prisma from "../config/prisma";
import { SiteSettings, SettingsSection } from "../types";

export class SettingsModel {
  static async findAll(): Promise<SiteSettings[]> {
    const results = await prisma.siteSettings.findMany({
      orderBy: { section: "asc" },
    });
    return results.map((item) => ({
      ...item,
      section: item.section as SettingsSection,
      settings: item.settings as unknown as
        | import("../types").GeneralSettings
        | import("../types").LogoSettings
        | import("../types").HomeSettings
        | import("../types").GallerySettings
        | import("../types").AboutSettings,
    }));
  }

  static async findBySection(
    section: SettingsSection
  ): Promise<SiteSettings | null> {
    const result = await prisma.siteSettings.findUnique({
      where: { section },
    });
    if (!result) return null;
    return {
      ...result,
      section: result.section as SettingsSection,
      settings: result.settings as unknown as
        | import("../types").GeneralSettings
        | import("../types").LogoSettings
        | import("../types").HomeSettings
        | import("../types").GallerySettings
        | import("../types").AboutSettings,
    };
  }

  static async upsert(
    section: SettingsSection,
    settingsData: Record<string, any>,
    isActive: boolean = true
  ): Promise<SiteSettings> {
    return (await prisma.siteSettings.upsert({
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
    })) as unknown as SiteSettings;
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
          section: "general" as SettingsSection,
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
          section: "logo" as SettingsSection,
          settings: {
            logo_type: "image",
            logo_image: "",
            logo_text: "Mon Site",
            logo_slogan: "Sous-titre du site",
          },
          is_active: true,
        },
        {
          section: "home" as SettingsSection, // ✅ Corrigé
          settings: {
            main_title: "Bienvenue sur notre site",
            main_subtitle: "Découvrez notre univers",
            show_social_in_hero: true,
            slides: [],
          },
          is_active: true,
        },
        {
          section: "gallery" as SettingsSection, // ✅ Corrigé
          settings: {
            gallery_title: "Notre Galerie",
            gallery_subtitle: "Découvrez nos photos",
            show_gallery: true,
            items_per_page: 12,
          },
          is_active: true,
        },
        {
          section: "about" as SettingsSection, // ✅ Corrigé
          settings: {
            about_title: "À propos de nous",
            selected_model_id: null,
            show_custom_content: false,
            custom_content: "",
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
    const results = await prisma.siteSettings.findMany({
      where: { is_active: true },
      orderBy: { section: "asc" },
    });
    return results.map((item) => ({
      ...item,
      section: item.section as SettingsSection,
      settings: item.settings as unknown as
        | import("../types").GeneralSettings
        | import("../types").LogoSettings
        | import("../types").HomeSettings
        | import("../types").GallerySettings
        | import("../types").AboutSettings,
    }));
  }
}
