const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const authorName = "dimich04 (Админ сайта)";
  const authorPhoto = "https://ui-avatars.com/api/?name=dimich04&background=8c9a81&color=fff&size=200";

  await prisma.article.updateMany({ data: { author: authorName, authorPhoto: authorPhoto } });
  await prisma.course.updateMany({ data: { author: authorName, authorPhoto: authorPhoto } });
  await prisma.consultation.updateMany({ data: { author: authorName, authorPhoto: authorPhoto } });
  await prisma.tour.updateMany({ data: { author: authorName, authorPhoto: authorPhoto } });

  console.log("Database ownership assigned to dimich04");
}

main().catch(console.error).finally(() => prisma.$disconnect());
