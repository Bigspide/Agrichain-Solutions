import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const iterations = 210_000;
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return `pbkdf2:${iterations}:${salt}:${hash}`;
}

const passwordHash = hashPassword("AgriChain2026!");

const users = [
  { email: "producer@agrichain.ci", name: "Kouamé Yao", role: "producer", phone: "+225 07 08 09 10", location: "Daloa, Côte d'Ivoire", subscription: "pro" },
  { email: "cooperative@agrichain.ci", name: "Coopérative COOPAGA", role: "cooperative", phone: "+225 05 06 07 08", location: "Abidjan, Côte d'Ivoire", subscription: "enterprise" },
  { email: "logistics@agrichain.ci", name: "TransAfrica Logistics", role: "logistics", phone: "+225 01 02 03 04", location: "Abidjan, Côte d'Ivoire", subscription: "pro" },
  { email: "industry@agrichain.ci", name: "Cémoi Chocolat", role: "industry", phone: "+225 09 10 11 12", location: "Abidjan, Côte d'Ivoire", subscription: "enterprise" },
  { email: "consumer@agrichain.ci", name: "Aminata Diallo", role: "consumer", phone: "+225 03 04 05 06", location: "Yamoussoukro, Côte d'Ivoire", subscription: "starter" },
  { email: "admin@agrichain.ci", name: "Admin AgriChain", role: "admin", phone: "+225 00 00 00 01", location: "Abidjan, Côte d'Ivoire", subscription: "enterprise" },
];

const productImages = {
  cocoa: ["https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=85"],
  coffee: ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=85"],
  cashew: ["https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=1200&q=85"],
  palm_oil: ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=85"],
  rice: ["https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=1200&q=85"],
  fruits: ["https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=85"],
};

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.voiceCommand.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.blockchainAnchor.deleteMany();
  await prisma.gpsEvent.deleteMany();
  await prisma.logisticsTrip.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.traceEvent.deleteMany();
  await prisma.qRTag.deleteMany();
  await prisma.traceRecord.deleteMany();
  await prisma.sensorData.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.field.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.localeCatalog.deleteMany();
  await prisma.course.deleteMany();

  const createdUsers = {};
  for (const user of users) {
    createdUsers[user.role] = await prisma.user.create({
      data: {
        ...user,
        email: user.email.toLowerCase(),
        passwordHash,
        language: "fr",
        country: "CI",
        isVerified: true,
      },
    });
  }

  const farm = await prisma.farm.create({
    data: {
      name: "Plantation Yao Premium",
      ownerId: createdUsers.producer.id,
      region: "Haut-Sassandra",
      country: "CI",
      latitude: 6.877,
      longitude: -6.451,
      fields: {
        create: [
          {
            name: "Parcelle Cacao B12",
            ownerId: createdUsers.producer.id,
            areaHa: 12.4,
            latitude: 6.877,
            longitude: -6.451,
            crop: { create: { name: "Cacao", variety: "Mercedes", plantedAt: new Date("2024-03-15") } },
            sensors: {
              create: [
                { type: "humidity", value: 72, unit: "%" },
                { type: "temperature", value: 28, unit: "°C" },
                { type: "rainfall", value: 15, unit: "mm" },
              ],
            },
          },
        ],
      },
    },
    include: { fields: true },
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Cacao Premium Grade A",
        description: "Fèves de cacao premium de Daloa, fermentation contrôlée, traçabilité blockchain et certification biologique.",
        category: "cocoa",
        price: 2850,
        unit: "kg",
        quantity: 5000,
        minOrder: 100,
        images: productImages.cocoa,
        sellerId: createdUsers.producer.id,
        farmId: farm.id,
        origin: "Daloa, Côte d'Ivoire",
        certifications: ["Bio", "Fair Trade", "UTZ"],
        isOrganic: true,
        harvestDate: new Date("2024-10-15"),
        traceCode: "AGR-CI-2026-CAC-001",
        rating: 4.9,
        reviewCount: 124,
      },
    }),
    prisma.product.create({
      data: {
        name: "Café Robusta Lavé",
        description: "Café robusta lavé de Man, séchage naturel, profil aromatique chocolat noir.",
        category: "coffee",
        price: 3200,
        unit: "kg",
        quantity: 3000,
        minOrder: 50,
        images: productImages.coffee,
        sellerId: createdUsers.cooperative.id,
        origin: "Man, Côte d'Ivoire",
        certifications: ["Rainforest Alliance"],
        isOrganic: false,
        harvestDate: new Date("2024-09-20"),
        traceCode: "AGR-CI-2026-CAF-001",
        rating: 4.7,
        reviewCount: 89,
      },
    }),
    prisma.product.create({
      data: {
        name: "Noix de Cajou WW320",
        description: "Noix de cajou entières calibre WW320, qualité export, transformées localement.",
        category: "cashew",
        price: 4500,
        unit: "kg",
        quantity: 8000,
        minOrder: 200,
        images: productImages.cashew,
        sellerId: createdUsers.producer.id,
        farmId: farm.id,
        origin: "Bondoukou, Côte d'Ivoire",
        certifications: ["HACCP", "ISO 22000"],
        traceCode: "AGR-CI-2026-CAJ-001",
        rating: 4.8,
        reviewCount: 67,
      },
    }),
  ]);

  const order = await prisma.order.create({
    data: {
      orderNumber: "AGR-2026-001",
      buyerId: createdUsers.industry.id,
      sellerId: createdUsers.producer.id,
      totalAmount: 1425000,
      paymentStatus: "paid",
      status: "in_transit",
      paymentMethod: "mobile_money",
      shippingAddress: { street: "Zone Industrielle", city: "Abidjan", region: "Lagunes", country: "CI", coordinates: { lat: 5.316, lng: -4.012 } },
      trackingNumber: "TRK-2026-001",
      estimatedDelivery: new Date("2026-06-02"),
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            quantity: 500,
            unitPrice: products[0].price,
            totalPrice: 1425000,
            unit: "kg",
          },
        ],
      },
    },
  });

  await prisma.walletTransaction.createMany({
    data: [
      { userId: createdUsers.producer.id, farmId: farm.id, type: "credit", amount: 1425000, description: "Paiement commande AGR-2026-001", category: "order_payment", reference: "WAL-AGR-2026-001", status: "completed" },
      { userId: createdUsers.producer.id, farmId: farm.id, type: "debit", amount: 125000, description: "Frais logistiques TransAfrica", category: "logistics", reference: "WAL-AGR-2026-002", status: "completed" },
      { userId: createdUsers.producer.id, farmId: farm.id, type: "credit", amount: 900000, description: "Avance cacao premium", category: "advance", reference: "WAL-AGR-2026-003", status: "pending" },
    ],
  });

  const trace = await prisma.traceRecord.create({
    data: {
      traceCode: "AGR-CI-2026-CAC-001",
      productName: products[0].name,
      productCategory: products[0].category,
      blockchainHash: "0xpending-anchor-seed",
      qrCode: "AGR-CI-2026-CAC-001",
      origin: {
        farm: farm.name,
        farmer: createdUsers.producer.name,
        cooperative: "COOPAGA",
        region: "Haut-Sassandra",
        country: "Côte d'Ivoire",
        coordinates: { lat: 6.877, lng: -6.451 },
      },
      currentHolder: "TransAfrica Logistics",
      status: "active",
      events: {
        create: [
          { type: "planted", title: "Plantation", description: "Cacaoyers plantés dans la parcelle B12", location: "Daloa", latitude: 6.877, longitude: -6.451, actor: createdUsers.producer.name, actorRole: "producer", verified: true, timestamp: new Date("2024-03-15T08:00:00Z") },
          { type: "harvested", title: "Récolte", description: "Récolte des cabosses à maturité optimale", location: "Daloa", latitude: 6.877, longitude: -6.451, actor: createdUsers.producer.name, actorRole: "producer", verified: true, timestamp: new Date("2024-10-15T06:30:00Z") },
          { type: "shipped", title: "Expédition", description: "Transport vers Abidjan par TransAfrica", location: "Daloa → Abidjan", actor: "TransAfrica Logistics", actorRole: "logistics", verified: true, timestamp: new Date("2026-05-21T07:00:00Z") },
        ],
      },
      certificates: {
        create: [
          { type: "organic", name: "Certification Bio", issuer: "Ecocert", issuedDate: new Date("2026-01-15"), expiryDate: new Date("2027-01-14"), verified: true },
          { type: "fairtrade", name: "Commerce Équitable", issuer: "Fairtrade International", issuedDate: new Date("2026-02-01"), expiryDate: new Date("2027-01-31"), verified: true },
        ],
      },
    },
  });

  await prisma.qRTag.create({ data: { tag: trace.traceCode, fieldId: farm.fields[0].id, traceRecordId: trace.id } });
  await prisma.blockchainAnchor.create({ data: { traceRecordId: trace.id, chainId: 11155111, payloadHash: "seed-payload-hash", status: "pending" } });

  const trip = await prisma.logisticsTrip.create({
    data: {
      orderId: order.id,
      driverName: "Koné Seydou",
      driverPhone: "+225 01 23 45 67",
      vehiclePlate: "CI-4521-AB",
      status: "in_transit",
      originLabel: "Daloa",
      originLat: 6.877,
      originLng: -6.451,
      destinationLabel: "Abidjan",
      destinationLat: 5.316,
      destinationLng: -4.012,
      currentLat: 6.1,
      currentLng: -5.2,
      distanceRemainingKm: 102,
      etaMinutes: 135,
      routeGeoJson: { type: "LineString", coordinates: [[-6.451, 6.877], [-5.75, 6.45], [-5.2, 6.1], [-4.012, 5.316]] },
    },
  });
  await prisma.gpsEvent.createMany({
    data: [
      { tripId: trip.id, latitude: 6.877, longitude: -6.451, speedKph: 0, heading: 120 },
      { tripId: trip.id, latitude: 6.45, longitude: -5.75, speedKph: 62, heading: 120 },
      { tripId: trip.id, latitude: 6.1, longitude: -5.2, speedKph: 68, heading: 118 },
    ],
  });

  const glossary = [
    ["dyu", "common.save", "Mara", "needs_review"],
    ["dyu", "common.search", "Ɲini", "needs_review"],
    ["ak", "common.search", "Hwehwɛ", "needs_review"],
    ["fr", "common.search", "Rechercher", "verified"],
    ["en", "common.search", "Search", "verified"],
    ["es", "common.search", "Buscar", "verified"],
    ["pt", "common.search", "Pesquisar", "verified"],
    ["ar", "common.search", "بحث", "verified"],
    ["zh", "common.search", "搜索", "verified"],
  ];
  await prisma.localeCatalog.createMany({
    data: glossary.map(([locale, key, value, status]) => ({ locale, key, value, status, country: locale === "fr" || locale === "en" ? null : "CI" })),
  });

  await prisma.course.createMany({
    data: [
      { title: "Techniques de fermentation du cacao", description: "Améliorez la qualité export avec fermentation contrôlée, séchage et contrôle humidité.", category: "Cacao", duration: "2h 30min", level: "intermediate", lessons: 8, completedLessons: 5, instructor: "Dr. Koné Ibrahim", thumbnail: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=85", rating: 4.8 },
      { title: "Agriculture biologique en zone tropicale", description: "Fondamentaux de l'agriculture biologique adaptée aux climats ivoiriens.", category: "Général", duration: "4h", level: "beginner", lessons: 12, completedLessons: 3, instructor: "Prof. Touré Mariame", thumbnail: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=85", rating: 4.6 },
      { title: "Gestion financière pour agriculteurs", description: "Suivez trésorerie, avances, commandes et marges avec des indicateurs simples.", category: "Business", duration: "3h", level: "beginner", lessons: 10, completedLessons: 0, instructor: "Mme. Bamba Fatou", thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85", rating: 4.7 },
    ],
  });

  console.log("Seed complete. Test password for seeded accounts: AgriChain2026!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
