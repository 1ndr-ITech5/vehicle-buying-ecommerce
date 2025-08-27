const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Get all part categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.partCategory.findMany({
            include: { subCategories: true },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Get all part ads (with filtering)
router.get('/', async (req, res) => {
    const { subCategoryId, carMark, year, priceFrom, priceTo, location, condition } = req.query;

    const where = {};

    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (carMark) where.carMark = carMark;
    if (location) where.location = location;
    if (condition) {
        where.condition = { in: condition.split(',') };
    }

    if (year) where.year = { gte: parseInt(year) };
    if (priceFrom) where.price = { ...where.price, gte: parseFloat(priceFrom) };
    if (priceTo) where.price = { ...where.price, lte: parseFloat(priceTo) };

    try {
        const parts = await prisma.partAd.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(parts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching part ads', error: error.message });
    }
});

// Get a single part ad by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const part = await prisma.partAd.findUnique({
            where: { id },
        });
        if (part) {
            res.json(part);
        } else {
            res.status(404).json({ message: 'Part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching part ad', error: error.message });
    }
});

module.exports = router;
