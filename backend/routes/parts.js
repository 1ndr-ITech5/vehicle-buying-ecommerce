const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

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
    // Removed carMark and year from destructuring since they no longer exist in the database
    const { subCategoryId, priceFrom, priceTo, location, condition } = req.query;

    const where = {};

    if (subCategoryId) where.subCategoryId = subCategoryId;
    // Removed carMark filter - field no longer exists in database
    if (location) where.location = location;
    if (condition) {
        where.condition = { in: condition.split(',') };
    }

    // Removed year filter - field no longer exists in database
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

// Create a new part ad
router.post('/', authenticateToken, async (req, res) => {
  const {
    name,
    price,
    location,
    phone,
    imageUrl,
    condition,
    description,
    compatibleModels,
    detailedCompatibility,
    installationDifficulty,
    year,
    subCategory,
    'package': packageType
  } = req.body;
  const ownerId = req.user.userId;

  try {
    console.log('--- Creating new part ad ---');
    console.log('Request body:', req.body);

    // Validate required fields
    if (!name || !price || !location || !phone || !condition || !description || !subCategory) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'price', 'location', 'phone', 'condition', 'description', 'subCategory']
      });
    }

    const subCategoryRecord = await prisma.partSubCategory.findFirst({
      where: { name: { equals: subCategory, mode: 'insensitive' } },
    });

    console.log('Sub-category record:', subCategoryRecord);

    if (!subCategoryRecord) {
      return res.status(400).json({ message: 'Invalid sub-category' });
    }

    const parsedPrice = parseFloat(price);
    console.log('Parsed price:', parsedPrice);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: 'Invalid price value' });
    }

    const dataToSave = {
      name: String(name).trim(),
      price: parsedPrice,
      location: String(location).trim(),
      phone: String(phone).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      condition: String(condition).trim(),
      description: String(description).trim(),
      compatibleModels: compatibleModels ? String(compatibleModels).trim() : null,
      detailedCompatibility: detailedCompatibility ? String(detailedCompatibility).trim() : null,
      installationDifficulty: installationDifficulty ? String(installationDifficulty).trim() : null,
      year: year ? parseInt(year) : null,
      package: packageType ? String(packageType).trim() : null,
      seller: { connect: { id: ownerId } },
      subCategory: { connect: { id: subCategoryRecord.id } },
    };

    console.log('Data to save:', dataToSave);

    const newPartAd = await prisma.partAd.create({
      data: dataToSave,
    });

    console.log('--- Part ad created successfully ---');
    res.status(201).json(newPartAd);
  } catch (error) {
    console.error('--- Error creating part ad ---');
    console.error('Error details:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Duplicate entry detected' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Foreign key constraint failed' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Related record not found' });
    }
    
    res.status(500).json({ 
      message: 'Error creating part ad', 
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

module.exports = router;
