import { PrismaClient } from "@prisma/client";
import { territories } from "@/lib/ivds-data";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set. Seed skipped.");
    return;
  }

  const municipality = await prisma.municipality.upsert({
    where: { name: "Guarulhos" },
    update: { state: "SP", referenceYear: 2026 },
    create: {
      name: "Guarulhos",
      state: "SP",
      referenceYear: 2026,
    },
  });

  for (const territory of territories) {
    const record = await prisma.neighborhood.upsert({
      where: {
        id: territory.id,
      },
      update: {
        name: territory.name,
        region: territory.region,
        macroRegion: territory.macroRegion,
        crasUnit: territory.crasUnit,
        latitude: territory.center[0],
        longitude: territory.center[1],
        population: territory.population,
        households: territory.households,
        cadunicoFamilies: territory.cadunicoFamilies,
        elderlyPopulation: territory.elderlyPopulation,
        ivdsScore: territory.ivds,
        level: territory.level.toUpperCase() as
          | "CRITICAL"
          | "HIGH"
          | "MEDIUM"
          | "LOW",
        dominantDimension: territory.dominantDimension.toUpperCase(),
        recommendation: territory.recommendation.title,
        municipalityId: municipality.id,
      },
      create: {
        id: territory.id,
        name: territory.name,
        region: territory.region,
        macroRegion: territory.macroRegion,
        crasUnit: territory.crasUnit,
        latitude: territory.center[0],
        longitude: territory.center[1],
        population: territory.population,
        households: territory.households,
        cadunicoFamilies: territory.cadunicoFamilies,
        elderlyPopulation: territory.elderlyPopulation,
        ivdsScore: territory.ivds,
        level: territory.level.toUpperCase() as
          | "CRITICAL"
          | "HIGH"
          | "MEDIUM"
          | "LOW",
        dominantDimension: territory.dominantDimension.toUpperCase(),
        recommendation: territory.recommendation.title,
        municipalityId: municipality.id,
      },
    });

    await prisma.indicatorMeasure.deleteMany({
      where: { neighborhoodId: record.id },
    });

    const measures = Object.entries(territory.dimensionScores).map(
      ([dimension, value]) => ({
        neighborhoodId: record.id,
        code: `${record.id}-${dimension}`,
        dimension,
        label: dimension.toUpperCase(),
        weight: dimension === "d1" || dimension === "d2" ? 0.2 : 0.15,
        rawValue: value * 100,
        normalizedValue: value,
      }),
    );

    await prisma.indicatorMeasure.createMany({ data: measures });
  }

  await prisma.territorySnapshot.create({
    data: {
      municipalityId: municipality.id,
      referenceDate: new Date("2026-05-23T00:00:00.000Z"),
      source: "Mock hackathon dataset",
      note: "Snapshot gerado a partir da base simulada de bairros de Guarulhos",
      payload: {
        totalTerritories: territories.length,
        averageIvds:
          territories.reduce((sum, territory) => sum + territory.ivds, 0) /
          territories.length,
      },
    },
  });

  console.log("Seed concluída para Guarulhos.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
