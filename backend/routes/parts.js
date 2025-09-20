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
    const { subCategoryId, priceFrom, priceTo, location, condition } = req.query;

    const where = {};

    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (location) where.location = location;
    if (condition) {
        where.condition = { in: condition.split(',') };
    }
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
        const part = await prisma.partAd.findUnique({ where: { id } });
        if (part) res.json(part);
        else res.status(404).json({ message: 'Part not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching part ad', error: error.message });
    }
});

// Create a new part ad
router.post('/', authenticateToken, async (req, res) => {
  console.log('Request body for new part ad:', req.body);
  try {
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
      'package': packageType,
      carMark,
      carModel,
      vehicleType
    } = req.body;

    const ownerId = req.user.userId;

    // Validate required fields
    if (!name || !price || !location || !phone || !condition || !description || !subCategory) {
      const errorMessage = {
        message: 'Missing required fields',
        required: ['name', 'price', 'location', 'phone', 'condition', 'description', 'subCategory']
      };
      console.error('Validation Error:', errorMessage);
      return res.status(400).json(errorMessage);
    }

    // Trim subCategory
    const cleanedSubCategory = subCategory.trim();

    const subCategoryRecord = await prisma.partSubCategory.findFirst({
      where: {
        name: cleanedSubCategory
      }
    });

    if (!subCategoryRecord) {
      const availableSubCategories = await prisma.partSubCategory.findMany({
        select: {
          name: true,
        },
      });
      const errorMessage = { 
        message: `Invalid sub-category: ${subCategory}`,
        availableSubCategories: availableSubCategories.map(sc => sc.name),
      };
      console.error('Validation Error:', errorMessage);
      return res.status(400).json(errorMessage);
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      const errorMessage = { message: 'Invalid price value' };
      console.error('Validation Error:', errorMessage);
      return res.status(400).json(errorMessage);
    }

    const parsedYear = year ? parseInt(year, 10) : null;
    if (year && isNaN(parsedYear)) {
        const errorMessage = { message: 'Invalid year value' };
        console.error('Validation Error:', errorMessage);
        return res.status(400).json(errorMessage);
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
      year: parsedYear,
      package: packageType ? String(packageType).trim() : null,
      seller: { connect: { id: ownerId } },
      subCategory: { connect: { id: subCategoryRecord.id } },
      carMark: carMark ? String(carMark).trim() : null,
      carModel: carModel ? String(carModel).trim() : null,
      vehicleType: vehicleType ? String(vehicleType).trim() : null,
    };

    console.log('dataToSave:', dataToSave);
    const newPartAd = await prisma.partAd.create({ data: dataToSave });
    res.status(201).json(newPartAd);
  } catch (error) {
    console.error('Error creating part ad:', error);

    if (error.code === 'P2002') {
      const errorMessage = { message: 'Duplicate entry detected' };
      console.error('Database Error:', errorMessage);
      return res.status(400).json(errorMessage);
    }
    if (error.code === 'P2003') {
      const errorMessage = { message: 'Foreign key constraint failed' };
      console.error('Database Error:', errorMessage);
      return res.status(400).json(errorMessage);
    }
    if (error.code === 'P2025') {
      const errorMessage = { message: 'Related record not found' };
      console.error('Database Error:', errorMessage);
      return res.status(404).json(errorMessage);
    }

    res.status(500).json({ message: 'Error creating part ad', error: error.message, code: error.code || 'UNKNOWN_ERROR' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.userId;

  try {
    const partAd = await prisma.partAd.findUnique({
      where: { id },
    });

    if (!partAd) {
      return res.status(404).json({ message: 'Part ad not found' });
    }

    if (partAd.sellerId !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to delete this ad' });
    }

    await prisma.partAd.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting part ad', error: error.message });
  }
});

module.exports = router;