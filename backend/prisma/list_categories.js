
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Listing categories and sub-categories...');
  const categories = await prisma.partCategory.findMany({
    include: { subCategories: true }
  });
  categories.forEach(category => {
    console.log(`- ${category.name}`);
    category.subCategories.forEach(subCategory => {
      console.log(`  - ${subCategory.name}`);
    });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
