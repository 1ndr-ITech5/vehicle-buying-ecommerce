const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Create a new review
router.post('/', async (req, res) => {
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
        return res.status(400).json({ message: 'Name, rating, and comment are required' });
    }

    try {
        const review = await prisma.review.create({
            data: {
                name,
                rating: parseInt(rating),
                comment,
            },
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
});

// Delete a review
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.review.delete({
            where: { id: id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
});

// Update a review
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, rating, comment } = req.body;

    try {
        const updatedReview = await prisma.review.update({
            where: { id: id },
            data: {
                name,
                rating: rating ? parseInt(rating) : undefined,
                comment,
            },
        });
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
});

module.exports = router;
