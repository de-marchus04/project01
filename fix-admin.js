const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password", 10);
  const user = await prisma.user.upsert({
    where: { username: "dimich04" },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      username: "dimich04",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("User dimich04 is ready:", user.username, user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
