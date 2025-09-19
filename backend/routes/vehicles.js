const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new vehicle ad
router.post('/', authenticateToken, async (req, res) => {
  console.log('Authorization header:', req.headers['authorization']);
  console.log('Request body:', req.body);
  console.log('User from token:', req.user);
  const { name, make, model, year, price, mileage, transmission, fuel, color, location, phone, description, imageUrl, power, engine, carPlates, "package": packageType, vehicleCategory, historyCheck, insuranceBaseRate } = req.body;
  console.log('Package type:', packageType);
  const ownerId = req.user.userId;

  const parsedYear = parseInt(year);
  const parsedPrice = parseFloat(price);
  const parsedMileage = parseInt(mileage);
  const parsedPower = parseInt(power);

  try {
    const newVehicleAd = await prisma.vehicleAd.create({
      data: {
        name,
        make,
        model,
        year: isNaN(parsedYear) ? 0 : parsedYear,
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        mileage: isNaN(parsedMileage) ? 0 : parsedMileage,
        transmission,
        fuel,
        color,
        location,
        phone,
        description,
        imageUrl,
        power: isNaN(parsedPower) ? 0 : parsedPower,
        engine,
        carPlates,
        "package": packageType,
        vehicleCategory,
        historyCheck,
        insuranceBaseRate: insuranceBaseRate ? parseFloat(insuranceBaseRate) : null,
        owner: { connect: { id: ownerId } },
      },
    });
    res.status(201).json(newVehicleAd);
  } catch (error) {
    console.error('Error creating vehicle ad:', error);
    res.status(500).json({ message: 'Error creating vehicle ad', error: error.message });
  }
});

// Get vehicle ads for the logged-in user
router.get('/my-ads', authenticateToken, async (req, res) => {
  const ownerId = req.user.userId;

  try {
    const vehicleAds = await prisma.vehicleAd.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(vehicleAds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user vehicle ads', error: error.message });
  }
});

// Get all vehicle ads (with filtering and sorting)
router.get('/', async (req, res) => {
    console.log(req.headers);
    const { type, model, yearFrom, yearTo, priceFrom, priceTo, powerFrom, powerTo, mileageFrom, mileageTo, transmitor, fuel, colour, location, limit, sortBy } = req.query;

    const where = {};

    if (type) where.make = type;
    if (model) where.model = model;
    if (transmitor) where.transmission = transmitor;
    if (fuel) where.fuel = fuel;
    if (colour) where.color = colour;
    if (location) where.location = location;

    if (yearFrom) where.year = { ...where.year, gte: parseInt(yearFrom) };
    if (yearTo) where.year = { ...where.year, lte: parseInt(yearTo) };

    if (priceFrom) where.price = { ...where.price, gte: parseFloat(priceFrom) };
    if (priceTo) where.price = { ...where.price, lte: parseFloat(priceTo) };

    if (powerFrom) where.power = { ...where.power, gte: parseInt(powerFrom) };
    if (powerTo) where.power = { ...where.power, lte: parseInt(powerTo) };

    if (mileageFrom) where.mileage = { ...where.mileage, gte: parseInt(mileageFrom) };
    if (mileageTo) where.mileage = { ...where.mileage, lte: parseInt(mileageTo) };

    let orderBy = { createdAt: 'desc' }; // Default sort
    switch (sortBy) {
        case 'price_asc':
            orderBy = { price: 'asc' };
            break;
        case 'price_desc':
            orderBy = { price: 'desc' };
            break;
        case 'year_asc':
            orderBy = { year: 'asc' };
            break;
        case 'year_desc':
            orderBy = { year: 'desc' };
            break;
    }

    try {
        const queryOptions = { where, orderBy };
        if (limit) {
            queryOptions.take = parseInt(limit);
        }

        const vehicles = await prisma.vehicleAd.findMany(queryOptions);
        console.log(vehicles);
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle ads', error: error.message });
    }
});

// Get a single vehicle ad by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const vehicle = await prisma.vehicleAd.findUnique({ where: { id } });
        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle ad', error: error.message });
    }
});

// Reserve a vehicle
router.post('/:id/reserve', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  const userId = req.user.userId;

  try {
    const vehicle = await prisma.vehicleAd.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.reserved) {
      return res.status(400).json({ message: 'Vehicle already reserved' });
    }

    const reservation = await prisma.reservation.create({
      data: {
        name,
        phone,
        email,
        vehicle: { connect: { id } },
        user: { connect: { id: userId } },
      },
    });

    const updatedVehicle = await prisma.vehicleAd.update({
      where: { id },
      data: { reserved: true },
    });

    res.json({ reservation, vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ message: 'Error reserving vehicle', error: error.message });
  }
});

// Delete a vehicle ad
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.userId;

  try {
    const vehicleAd = await prisma.vehicleAd.findUnique({
      where: { id },
    });

    if (!vehicleAd) {
      return res.status(404).json({ message: 'Vehicle ad not found' });
    }

    if (vehicleAd.ownerId !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to delete this ad' });
    }

    // Delete all reservations associated with the vehicle ad
    await prisma.reservation.deleteMany({
      where: { vehicleId: id },
    });

    await prisma.vehicleAd.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting vehicle ad', error: error.message });
  }
});

// Update a vehicle ad
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.userId;
  const { name, make, model, year, price, mileage, transmission, fuel, color, location, phone, description, imageUrl, power, engine, carPlates, "package": packageType, historyCheck, insuranceBaseRate } = req.body;

  try {
    const vehicleAd = await prisma.vehicleAd.findUnique({
      where: { id },
    });

    if (!vehicleAd) {
      return res.status(404).json({ message: 'Vehicle ad not found' });
    }

    if (vehicleAd.ownerId !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to update this ad' });
    }

    if (vehicleAd.package === 'premium' && vehicleAd.modifiedOnce) {
      return res.status(403).json({ message: 'This premium ad has already been modified once' });
    }

    const parsedYear = parseInt(year);
    const parsedPrice = parseFloat(price);
    const parsedMileage = parseInt(mileage);
    const parsedPower = parseInt(power);

    const updatedVehicleAd = await prisma.vehicleAd.update({
      where: { id },
      data: {
        name,
        make,
        model,
        year: isNaN(parsedYear) ? vehicleAd.year : parsedYear,
        price: isNaN(parsedPrice) ? vehicleAd.price : parsedPrice,
        mileage: isNaN(parsedMileage) ? vehicleAd.mileage : parsedMileage,
        transmission,
        fuel,
        color,
        location,
        phone,
        description,
        imageUrl,
        power: isNaN(parsedPower) ? vehicleAd.power : parsedPower,
        engine,
        carPlates,
        "package": packageType,
        historyCheck,
        insuranceBaseRate: insuranceBaseRate ? parseFloat(insuranceBaseRate) : vehicleAd.insuranceBaseRate,
        modifiedOnce: vehicleAd.package === 'premium' ? true : vehicleAd.modifiedOnce,
      },
    });

    res.json(updatedVehicleAd);
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle ad', error: error.message });
  }
});

module.exports = router;