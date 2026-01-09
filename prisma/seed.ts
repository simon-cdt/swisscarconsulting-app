import { db } from "@/lib/db";

async function main() {
  const insurances = [
    {
      name: "AXA Assurances",
      email: "contact@axa.ch",
      phone: "+41 58 215 21 21",
    },
    {
      name: "Allianz Suisse",
      email: "info@allianz.ch",
      phone: "+41 58 358 58 58",
    },
    {
      name: "Helvetia Assurances",
      email: "contact@helvetia.ch",
      phone: "+41 58 280 10 00",
    },
    {
      name: "Baloise Assurance",
      email: "info@baloise.ch",
      phone: "+41 58 285 85 85",
    },
    {
      name: "Generali Assurances",
      email: "service@generali.ch",
      phone: "+41 58 472 47 47",
    },
    {
      name: "Mobilière Suisse",
      email: "contact@mobiliere.ch",
      phone: "+41 31 389 61 11",
    },
    {
      name: "Zurich Assurances",
      email: "info@zurich.ch",
      phone: "+41 44 628 28 28",
    },
    {
      name: "Vaudoise Assurances",
      email: "info@vaudoise.ch",
      phone: "+41 21 618 80 80",
    },
    {
      name: "CSS Assurance",
      email: "contact@css.ch",
      phone: "+41 58 277 11 11",
    },
    {
      name: "ELVIA Assurances",
      email: "service@elvia.ch",
      phone: "+41 44 283 33 33",
    },
  ];

  for (const insurance of insurances) {
    await db.insurance.create({
      data: insurance,
    });
  }

  console.log("10 assurances créées avec succès");
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
