
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start populating parts...');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in the database. Please seed the database first.');
    return;
  }

  const partsData = {
    'Braking System': [
      { name: 'Brake Line', price: 25.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 10, description: 'High quality brake line.' },
      { name: 'Brake Fluid', price: 15.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 20, description: 'DOT 4 brake fluid.' },
      { name: 'ABS Control Module', price: 150.00, condition: 'Used', year: 2020, carMark: 'Volkswagen', quantity: 5, description: 'Used ABS control module for Volkswagen.' },
      { name: 'Brake Booster', price: 120.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 7, description: 'Universal brake booster.' },
      { name: 'Parking Brake Cable', price: 30.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 15, description: 'Parking brake cable.' }
    ],
    'Suspension & Steering': [
      { name: 'Sway Bar', price: 80.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 8, description: 'Front sway bar.' },
      { name: 'Tie Rod End', price: 40.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 12, description: 'Outer tie rod end.' },
      { name: 'Ball Joint', price: 50.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 10, description: 'Lower ball joint.' },
      { name: 'Leaf Spring', price: 100.00, condition: 'Used', year: 2019, carMark: 'Ford', quantity: 4, description: 'Used leaf spring for Ford trucks.' },
      { name: 'Power Steering Fluid', price: 20.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 25, description: 'Universal power steering fluid.' }
    ],
    'Body & Exterior': [
      { name: 'Grille', price: 100.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 6, description: 'Chrome grille.' },
      { name: 'Mirror', price: 70.00, condition: 'Used', year: 2021, carMark: 'BMW', quantity: 3, description: 'Side mirror for BMW.' },
      { name: 'Door Handle', price: 35.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 15, description: 'Exterior door handle.' },
      { name: 'Wiper Blade', price: 25.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 30, description: 'All-season wiper blade.' },
      { name: 'Emblem', price: 20.00, condition: 'New', year: 2023, carMark: 'Audi', quantity: 10, description: 'Audi rings emblem.' }
    ],
    'Interior Parts': [
        { name: 'Sun Visor', price: 45.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 10, description: 'Driver side sun visor.' },
        { name: 'Glove Box', price: 80.00, condition: 'Used', year: 2020, carMark: 'Toyota', quantity: 5, description: 'Glove box assembly for Toyota.' },
        { name: 'Center Console', price: 150.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 7, description: 'Universal center console.' },
        { name: 'Seat Cover', price: 60.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 20, description: 'Set of front seat covers.' },
        { name: 'Dashboard', price: 250.00, condition: 'Used', year: 2018, carMark: 'Honda', quantity: 3, description: 'Dashboard for Honda Civic.' }
    ],
    'Lighting & Electrics': [
        { name: 'Battery', price: 120.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 15, description: '12V car battery.' },
        { name: 'Fuse', price: 5.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 100, description: 'Assorted car fuses.' },
        { name: 'Ignition Coil', price: 50.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 20, description: 'Ignition coil pack.' },
        { name: 'Starter Motor', price: 180.00, condition: 'Used', year: 2019, carMark: 'Mercedes-Benz', quantity: 5, description: 'Starter motor for Mercedes-Benz.' },
        { name: 'Wiper Motor', price: 70.00, condition: 'New', year: 2023, carMark: 'Universal', quantity: 10, description: 'Front wiper motor.' }
    ]
  };

  for (const categoryName of Object.keys(partsData)) {
    const category = await prisma.partCategory.findUnique({
      where: { name: categoryName },
      include: { subCategories: true }
    });

    if (category && category.subCategories.length > 0) {
      const subCategory = category.subCategories[0];
      for (const part of partsData[categoryName]) {
        await prisma.partAd.create({
          data: {
            ...part,
            sellerId: user.id,
            subCategoryId: subCategory.id,
            location: 'Tirana',
            phone: '+355 69 123 4567'
          }
        });
      }
      console.log(`Added parts for category: ${categoryName}`);
    } else {
      console.warn(`Category or sub-category not found for: ${categoryName}`);
    }
  }

  console.log('Finished populating parts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
