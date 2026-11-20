const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const provider = await prisma.user.upsert({
    where: { email: "provider@localconnect.test" },
    update: {},
    create: {
      name: "Amina Khan",
      email: "provider@localconnect.test",
      password,
      role: "PROVIDER",
      phone: "03001234567",
      location: "Lahore, Pakistan",
      city: "Lahore",
      country: "Pakistan",
      countryCode: "PK",
      latitude: 31.5204,
      longitude: 74.3587,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@localconnect.test" },
    update: {},
    create: {
      name: "Hassan Ali",
      email: "customer@localconnect.test",
      password,
      role: "CUSTOMER",
      phone: "03007654321",
      location: "Lahore, Pakistan",
      city: "Lahore",
      country: "Pakistan",
      countryCode: "PK",
      latitude: 31.5497,
      longitude: 74.3436,
    },
  });

  await prisma.user.updateMany({
    where: { role: "PROVIDER" },
    data: { isVerified: true },
  });

  const existing = await prisma.service.findFirst({
    where: { title: "Home Cleaning", providerId: provider.id },
  });

  if (!existing) {
    await prisma.service.create({
      data: {
        title: "Home Cleaning",
        description: "Professional home cleaning service",
        category: "Cleaning",
        price: 50000,
        currency: "PKR",
        location: "Lahore, Pakistan",
        latitude: 31.5204,
        longitude: 74.3587,
        providerId: provider.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
