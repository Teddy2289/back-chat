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

  // models/SettingsModel.ts
  static async initializeDefaultSettings(): Promise<void> {
    const sections: SettingsSection[] = [
      "general",
      "logo",
      "home",
      "gallery",
      "about",
    ];

    for (const section of sections) {
      const exists = await this.sectionExists(section);

      if (!exists) {
        console.log(
          `Création des paramètres par défaut pour la section: ${section}`
        );

        let defaultSettings: any;

        switch (section) {
          case "general":
            defaultSettings = {
              site_title: "Mon Site",
              site_subtitle: "Sous-titre du site",
              associated_model_id: null,
              show_navbar: true,
              social_title: "Suivez-nous",
              social_links: [
                {
                  platform: "facebook",
                  url: "",
                  icon: "fa-facebook",
                  is_active: false,
                },
                {
                  platform: "twitter",
                  url: "",
                  icon: "fa-twitter",
                  is_active: false,
                },
                {
                  platform: "instagram",
                  url: "",
                  icon: "fa-instagram",
                  is_active: false,
                },
                {
                  platform: "linkedin",
                  url: "",
                  icon: "fa-linkedin",
                  is_active: false,
                },
                {
                  platform: "youtube",
                  url: "",
                  icon: "fa-youtube",
                  is_active: false,
                },
              ],
            };
            break;

          case "logo":
            defaultSettings = {
              logo_type: "image",
              logo_image: "",
              logo_text: "Mon Site",
              logo_slogan: "Sous-titre du site",
            };
            break;

          case "home":
            defaultSettings = {
              main_title: "Bienvenue sur notre site",
              main_subtitle: "Découvrez notre univers",
              show_social_in_hero: true,
              slides: [],
            };
            break;

          case "gallery":
            defaultSettings = {
              gallery_title: "Notre Galerie",
              gallery_subtitle: "Découvrez nos photos",
              show_gallery: true,
              items_per_page: 12,
            };
            break;

          case "about":
            defaultSettings = {
              about_title: "À propos de nous",
              selected_model_id: null,
              show_custom_content: false,
              custom_content: "",
            };
            break;
        }

        await prisma.siteSettings.create({
          data: {
            section,
            settings: defaultSettings,
            is_active: true,
          },
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
