const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Get all vehicle ads (with filtering and sorting)
router.get('/', async (req, res) => {
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

module.exports = router;
