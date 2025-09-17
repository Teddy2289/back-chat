// scripts/seedPaymentPlans.ts
import prisma from "../config/prisma";

async function seedPaymentPlans() {
  try {
    console.log("🌱 Création des plans de paiement de test...");

    const plans = [
      {
        name: "Plan Starter",
        description: "Parfait pour commencer et découvrir le service",
        price: 9.99,
        duration: 30,
        credits: 50,
        is_active: true,
      },
      {
        name: "Plan Premium",
        description: "Pour une expérience complète sans limites",
        price: 24.99,
        duration: 30,
        credits: 200,
        is_active: true,
      },
      {
        name: "Plan VIP",
        description: "Expérience ultime avec avantages exclusifs",
        price: 49.99,
        duration: 30,
        credits: 500,
        is_active: true,
      },
    ];

    for (const planData of plans) {
      const existingPlan = await prisma.paymentPlan.findFirst({
        where: { name: planData.name },
      });

      if (!existingPlan) {
        await prisma.paymentPlan.create({
          data: planData,
        });
        console.log(`✅ Plan créé: ${planData.name}`);
      } else {
        console.log(`⚠️ Plan déjà existant: ${planData.name}`);
      }
    }

    console.log("✅ Plans de paiement créés avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors de la création des plans:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  seedPaymentPlans();
}

export { seedPaymentPlans };
