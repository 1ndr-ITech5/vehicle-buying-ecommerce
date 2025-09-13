const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const finalCategoriesData = [
    { name: 'Engine Parts', subCategories: [ { name: 'Filters' }, { name: 'Belts & Chains' }, { name: 'Gaskets & Seals' } ] },
    { name: 'Brake System', subCategories: [ { name: 'Brake Pads' }, { name: 'Brake Discs' }, { name: 'Calipers' } ] },
    { name: 'Suspension', subCategories: [ { name: 'Shock Absorbers' }, { name: 'Control Arms' }, { name: 'Ball Joints' } ] },
    { name: 'Exhaust System', subCategories: [ { name: 'Mufflers' }, { name: 'Catalytic Converters' }, { name: 'Exhaust Pipes' } ] },
    { name: 'Transmission', subCategories: [ { name: 'Clutch Kits' }, { name: 'Flywheels' }, { name: 'Gearboxes' } ] },
    { name: 'Electrical', subCategories: [ { name: 'Batteries' }, { name: 'Alternators' }, { name: 'Spark Plugs' } ] },
    { name: 'Body Parts', subCategories: [ { name: 'Bumpers' }, { name: 'Fenders' }, { name: 'Doors' } ] },
    { name: 'Interior', subCategories: [ { name: 'Seats' }, { name: 'Dashboards' }, { name: 'Floor Mats' } ] },
    { name: 'Wheels & Tires', subCategories: [ { name: 'Tires' }, { name: 'Rims' }, { name: 'Hubcaps' } ] },
    { name: 'Accessories', subCategories: [ { name: 'Car Covers' }, { name: 'Phone Holders' }, { name: 'Roof Racks' } ] },
];

const vehicleData = [
    // Cars
    { name: 'Mercedes-Benz C-Class', make: 'Mercedes-Benz', model: 'C-Class', year: 2021, price: 32000, mileage: 15000, transmission: 'Automatic', fuel: 'Diesel', color: 'Black', location: 'Tirana', phone: '+355690000001', description: 'Like new', power: 194, engine: '2.0L', carPlates: 'AA 111 BB' },
    { name: 'BMW 3 Series', make: 'BMW', model: '3 Series', year: 2020, price: 28000, mileage: 30000, transmission: 'Automatic', fuel: 'Petrol', color: 'Blue', location: 'Durres', phone: '+355690000002', description: 'M Sport package', power: 258, engine: '2.0L', carPlates: 'AB 222 CC' },
    { name: 'Audi A4', make: 'Audi', model: 'A4', year: 2019, price: 25000, mileage: 45000, transmission: 'Automatic', fuel: 'Diesel', color: 'White', location: 'Vlora', phone: '+355690000003', description: 'S-Line, well maintained', power: 190, engine: '2.0L', carPlates: 'AC 333 DD' },
    { name: 'Ford Focus', make: 'Ford', model: 'Focus', year: 2022, price: 22000, mileage: 5000, transmission: 'Manual', fuel: 'Petrol', color: 'Red', location: 'Shkoder', phone: '+355690000004', description: 'Almost new', power: 125, engine: '1.0L', carPlates: 'AD 444 EE' },
    { name: 'Toyota Corolla', make: 'Toyota', model: 'Corolla', year: 2021, price: 23000, mileage: 10000, transmission: 'Automatic', fuel: 'Hybrid', color: 'Silver', location: 'Fier', phone: '+355690000005', description: 'Very economical', power: 122, engine: '1.8L', carPlates: 'AE 555 FF' },
    { name: 'Renault Clio', make: 'Renault', model: 'Clio', year: 2020, price: 15000, mileage: 25000, transmission: 'Manual', fuel: 'Petrol', color: 'Orange', location: 'Korce', phone: '+355690000006', description: 'Perfect city car', power: 100, engine: '1.0L', carPlates: 'AF 666 GG' },
    { name: 'Volkswagen Golf', make: 'Volkswagen', model: 'Golf', year: 2019, price: 19000, mileage: 50000, transmission: 'Automatic', fuel: 'Diesel', color: 'Grey', location: 'Elbasan', phone: '+355690000007', description: 'Reliable and efficient', power: 150, engine: '2.0L', carPlates: 'AG 777 HH' },
    { name: 'Skoda Octavia', make: 'Skoda', model: 'Octavia', year: 2021, price: 21000, mileage: 20000, transmission: 'Automatic', fuel: 'Diesel', color: 'Black', location: 'Berat', phone: '+355690000008', description: 'Spacious family car', power: 150, engine: '2.0L', carPlates: 'AH 888 II' },
    // Vans
    { name: 'Mercedes-Benz Sprinter', make: 'Mercedes-Benz', model: 'Sprinter', year: 2018, price: 25000, mileage: 80000, transmission: 'Manual', fuel: 'Diesel', color: 'White', location: 'Tirana', phone: '+355690000009', description: 'Cargo van, high roof', power: 163, engine: '2.1L', carPlates: 'AI 999 JJ' },
    { name: 'Fiat Ducato', make: 'Fiat', model: 'Ducato', year: 2019, price: 22000, mileage: 60000, transmission: 'Manual', fuel: 'Diesel', color: 'White', location: 'Durres', phone: '+355690000010', description: 'Maxi version', power: 140, engine: '2.3L', carPlates: 'AJ 000 KK' },
    { name: 'Opel Vivaro', make: 'Opel', model: 'Vivaro', year: 2020, price: 23000, mileage: 40000, transmission: 'Manual', fuel: 'Diesel', color: 'Silver', location: 'Vlora', phone: '+355690000011', description: '9 seats', power: 120, engine: '1.6L', carPlates: 'AK 111 LL' },
    { name: 'Renault Master', make: 'Renault', model: 'Master', year: 2017, price: 18000, mileage: 120000, transmission: 'Manual', fuel: 'Diesel', color: 'White', location: 'Shkoder', phone: '+355690000012', description: 'Good condition', power: 130, engine: '2.3L', carPlates: 'AL 222 MM' },
    { name: 'Iveco Daily', make: 'Iveco', model: 'Daily', year: 2019, price: 26000, mileage: 90000, transmission: 'Manual', fuel: 'Diesel', color: 'Blue', location: 'Fier', phone: '+355690000013', description: 'Ready for work', power: 150, engine: '2.3L', carPlates: 'AM 333 NN' },
    // Motorcycles
    { name: 'Honda CBR650R', make: 'Honda', model: 'CBR', year: 2021, price: 8500, mileage: 5000, transmission: 'Manual', fuel: 'Petrol', color: 'Red', location: 'Tirana', phone: '+355690000014', description: 'Sport bike', power: 95, engine: '650cc', carPlates: 'AN 444 OO' },
    { name: 'Yamaha MT-07', make: 'Yamaha', model: 'MT-07', year: 2020, price: 7500, mileage: 8000, transmission: 'Manual', fuel: 'Petrol', color: 'Black', location: 'Durres', phone: '+355690000015', description: 'Great for city and touring', power: 74, engine: '689cc', carPlates: 'AO 555 PP' },
    { name: 'Suzuki V-Strom', make: 'Suzuki', model: 'V-Strom', year: 2019, price: 8000, mileage: 12000, transmission: 'Manual', fuel: 'Petrol', color: 'Yellow', location: 'Vlora', phone: '+355690000016', description: 'Adventure bike', power: 70, engine: '645cc', carPlates: 'AP 666 QQ' },
    { name: 'Ducati Panigale V2', make: 'Ducati', model: 'Panigale', year: 2021, price: 15000, mileage: 3000, transmission: 'Manual', fuel: 'Petrol', color: 'Red', location: 'Tirana', phone: '+355690000017', description: 'Superbike', power: 155, engine: '955cc', carPlates: 'AQ 777 RR' },
    { name: 'KTM 390 Duke', make: 'KTM', model: 'Duke', year: 2022, price: 5500, mileage: 2000, transmission: 'Manual', fuel: 'Petrol', color: 'Orange', location: 'Shkoder', phone: '+355690000018', description: 'Naked bike', power: 44, engine: '373cc', carPlates: 'AR 888 SS' },
    // Add more to reach 32
    { name: 'Volkswagen Passat', make: 'Volkswagen', model: 'Passat', year: 2018, price: 17000, mileage: 75000, transmission: 'Automatic', fuel: 'Diesel', color: 'Silver', location: 'Tirana', phone: '+355690000019', description: 'Comfortable sedan', power: 150, engine: '2.0L', carPlates: 'AS 999 TT' },
    { name: 'Ford Kuga', make: 'Ford', model: 'Kuga', year: 2019, price: 24000, mileage: 40000, transmission: 'Automatic', fuel: 'Petrol', color: 'Blue', location: 'Durres', phone: '+355690000020', description: 'SUV', power: 150, engine: '1.5L', carPlates: 'AT 000 UU' },
    { name: 'BMW X3', make: 'BMW', model: 'X3', year: 2019, price: 42000, mileage: 35000, transmission: 'Automatic', fuel: 'Diesel', color: 'Black', location: 'Vlora', phone: '+355690000021', description: 'xDrive', power: 190, engine: '2.0L', carPlates: 'AU 111 VV' },
    { name: 'Audi Q7', make: 'Audi', model: 'Q7', year: 2017, price: 38000, mileage: 90000, transmission: 'Automatic', fuel: 'Diesel', color: 'Grey', location: 'Tirana', phone: '+355690000022', description: '7-seater', power: 272, engine: '3.0L', carPlates: 'AV 222 WW' },
    { name: 'Toyota Yaris', make: 'Toyota', model: 'Yaris', year: 2022, price: 18000, mileage: 1000, transmission: 'Automatic', fuel: 'Hybrid', color: 'White', location: 'Fier', phone: '+355690000023', description: 'Brand new', power: 92, engine: '1.5L', carPlates: 'AW 333 XX' },
    { name: 'Renault Captur', make: 'Renault', model: 'Captur', year: 2019, price: 16000, mileage: 33000, transmission: 'Manual', fuel: 'Petrol', color: 'Blue', location: 'Korce', phone: '+355690000024', description: 'Crossover', power: 130, engine: '1.3L', carPlates: 'AX 444 YY' },
    { name: 'Skoda Kodiaq', make: 'Skoda', model: 'Kodiaq', year: 2020, price: 26000, mileage: 55000, transmission: 'Automatic', fuel: 'Diesel', color: 'Green', location: 'Elbasan', phone: '+355690000025', description: '7-seater SUV', power: 190, engine: '2.0L', carPlates: 'AY 555 ZZ' },
    { name: 'Mercedes-Benz Vito', make: 'Mercedes-Benz', model: 'Vito', year: 2020, price: 29000, mileage: 50000, transmission: 'Automatic', fuel: 'Diesel', color: 'Black', location: 'Tirana', phone: '+355690000026', description: 'Passenger van', power: 163, engine: '2.0L', carPlates: 'AZ 666 AA' },
    { name: 'Fiat Doblo', make: 'Fiat', model: 'Doblo', year: 2018, price: 14000, mileage: 95000, transmission: 'Manual', fuel: 'Diesel', color: 'Red', location: 'Durres', phone: '+355690000027', description: 'Cargo', power: 95, engine: '1.6L', carPlates: 'BA 777 BB' },
    { name: 'Honda Africa Twin', make: 'Honda', model: 'Africa Twin', year: 2020, price: 12000, mileage: 11000, transmission: 'Manual', fuel: 'Petrol', color: 'Tricolor', location: 'Vlora', phone: '+355690000028', description: 'Adventure touring', power: 102, engine: '1084cc', carPlates: 'BB 888 CC' },
    { name: 'Yamaha R1', make: 'Yamaha', model: 'R1', year: 2022, price: 18000, mileage: 1500, transmission: 'Manual', fuel: 'Petrol', color: 'Blue', location: 'Tirana', phone: '+355690000029', description: 'Track ready', power: 200, engine: '998cc', carPlates: 'BC 999 DD' },
    { name: 'Audi A6', make: 'Audi', model: 'A6', year: 2020, price: 35000, mileage: 40000, transmission: 'Automatic', fuel: 'Diesel', color: 'Black', location: 'Tirana', phone: '+355690000030', description: 'Executive sedan', power: 286, engine: '3.0L', carPlates: 'BD 000 EE' },
    { name: 'BMW 5 Series', make: 'BMW', model: '5 Series', year: 2021, price: 40000, mileage: 22000, transmission: 'Automatic', fuel: 'Petrol', color: 'White', location: 'Durres', phone: '+355690000031', description: 'Luxury and performance', power: 252, engine: '2.0L', carPlates: 'BE 111 FF' },
    { name: 'Mercedes-Benz E-Class', make: 'Mercedes-Benz', model: 'E-Class', year: 2022, price: 48000, mileage: 8000, transmission: 'Automatic', fuel: 'Diesel', color: 'Silver', location: 'Tirana', phone: '+355690000032', description: 'Latest model', power: 194, engine: '2.0L', carPlates: 'BF 222 GG' },
];

const carData = {
    marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda', 'Fiat', 'Opel', 'Iveco', 'Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'],
    locations: ['Tirana', 'Durres', 'Vlora', 'Shkoder', 'Fier', 'Korce'],
    conditions: ['New', 'Used']
};

async function main() {
    console.log('Start seeding with final data...');

    await prisma.partAd.deleteMany();
    await prisma.partSubCategory.deleteMany();
    await prisma.partCategory.deleteMany();
    await prisma.vehicleAd.deleteMany();
    await prisma.review.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
        data: { email: 'test@example.com', password: hashedPassword },
    });
    console.log(`Created user with id: ${user.id}`);

    for (const cat of finalCategoriesData) {
        await prisma.partCategory.create({
            data: {
                name: cat.name,
                subCategories: {
                    create: cat.subCategories.map(sc => ({ name: sc.name, partCount: 10 }))
                },
            },
        });
    }
    console.log('Created final part categories and sub-categories.');

    const allSubCategories = await prisma.partSubCategory.findMany();

    for (const subCat of allSubCategories) {
        for (let i = 0; i < 10; i++) { // Create 10 parts for each subcategory
            const randomMark = carData.marks[Math.floor(Math.random() * carData.marks.length)];
            const randomLocation = carData.locations[Math.floor(Math.random() * carData.locations.length)];
            const randomCondition = carData.conditions[Math.floor(Math.random() * carData.conditions.length)];

            await prisma.partAd.create({
                data: {
                    name: `${randomMark} ${subCat.name} #${i + 1}`,
                    price: parseFloat((Math.random() * 200 + 20).toFixed(2)),
                    location: randomLocation,
                    phone: `+355 69 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
                    condition: randomCondition,
                    description: `High quality ${subCat.name} for ${randomMark}. Condition: ${randomCondition}.`,
                    sellerId: user.id,
                    subCategoryId: subCat.id,
                }
            });
        }
    }
    console.log('Created final sample part ads for all sub-categories.');

    for (const vehicle of vehicleData) {
        await prisma.vehicleAd.create({
            data: { ...vehicle, ownerId: user.id }
        });
    }
    console.log(`Created ${vehicleData.length} vehicle ads.`);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });