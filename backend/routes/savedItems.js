const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');

const prisma = new PrismaClient();
const router = express.Router();

// Get all saved items for the current user
router.get('/', authenticate, async (req, res) => {
    const { userId } = req.user;

    try {
        const savedVehicleAds = await prisma.savedVehicleAd.findMany({
            where: { userId },
            include: { vehicleAd: true },
        });

        const savedPartAds = await prisma.savedPartAd.findMany({
            where: { userId },
            include: { partAd: true },
        });

        res.json({ savedVehicleAds, savedPartAds });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching saved items', error: error.message });
    }
});

// Save a new item for the current user
router.post('/', authenticate, async (req, res) => {
    const { userId } = req.user;
    const { vehicleAdId, partAdId } = req.body;
    console.log('Request body:', req.body);

    if (!vehicleAdId && !partAdId) {
        return res.status(400).json({ message: 'Either vehicleAdId or partAdId is required' });
    }

    try {
        if (vehicleAdId) {
            const savedVehicleAd = await prisma.savedVehicleAd.create({
                data: {
                    userId,
                    vehicleAdId,
                },
            });
            res.status(201).json(savedVehicleAd);
        } else if (partAdId) {
            const savedPartAd = await prisma.savedPartAd.create({
                data: {
                    userId,
                    partAdId,
                },
            });
            res.status(201).json(savedPartAd);
        }
    } catch (error) {
        console.error('Error saving item:', error);
        if (error.code === 'P2002') { // Unique constraint violation
            return res.status(409).json({ message: 'Item already saved' });
        }
        res.status(500).json({ message: 'Error saving item', error: error.message });
    }
});

// Delete a saved item
router.delete('/', authenticate, async (req, res) => {
    const { userId } = req.user;
    const { vehicleAdId, partAdId } = req.body;

    if (!vehicleAdId && !partAdId) {
        return res.status(400).json({ message: 'Either vehicleAdId or partAdId is required' });
    }

    try {
        if (vehicleAdId) {
            await prisma.savedVehicleAd.deleteMany({
                where: {
                    userId,
                    vehicleAdId,
                },
            });
            res.status(204).send();
        } else if (partAdId) {
            await prisma.savedPartAd.deleteMany({
                where: {
                    userId,
                    partAdId,
                },
            });
            res.status(204).send();
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
});


module.exports = router;
