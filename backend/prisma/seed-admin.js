const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

const ADMIN_EMAIL = "admin@localconnect.app";
const ADMIN_PASSWORD = "ChangeMe123!";

async function main() {
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.updateMany({
    where: { role: "ADMIN", email: { not: ADMIN_EMAIL } },
    data: { role: "CUSTOMER" },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN", name: "Platform Admin", password, isSuspended: false },
    create: {
      name: "Platform Admin",
      email: ADMIN_EMAIL,
      password,
      role: "ADMIN",
      location: "Platform",
      city: "Platform",
      country: "Global",
      countryCode: "US",
    },
  });

  const admins = await prisma.user.count({ where: { role: "ADMIN" } });
  if (admins !== 1) {
    throw new Error(`Expected exactly 1 admin, found ${admins}.`);
  }
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
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
