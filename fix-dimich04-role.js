const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { username: "dimich04" },
    data: { role: "ADMIN" }
  });

  console.log("dimich04 is now ADMIN in the DB.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
