// scripts/initializeMissingSections.ts
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function initializeMissingSections() {
  try {
    console.log("Vérification des sections manquantes...");

    const sections = ["general", "logo", "home", "gallery", "about"];

    for (const section of sections) {
      const exists = await prisma.siteSettings.findUnique({
        where: { section },
      });

      if (!exists) {
        console.log(`✅ Création de la section manquante: ${section}`);

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
      } else {
        console.log(`✅ Section déjà existante: ${section}`);
      }
    }

    console.log("✅ Vérification terminée!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeMissingSections();
