const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint violation
            return res.status(409).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        console.log(`Attempting to log in user with email: ${email}`);
        const user = await prisma.user.findUnique({ where: { email } });
        console.log('User found:', user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Comparing passwords...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Is password valid?', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        res.json({ message: 'Login successful', accessToken, refreshToken });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Refresh the access token
router.post('/refresh-token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user = await prisma.user.findUnique({ where: { id: payload.userId } });

        if (!user || user.refreshToken !== token) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.json({ accessToken });
    } catch (error) {
        res.sendStatus(403);
    }
});

// Logout a user
router.post('/logout', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(204);
    }

    try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        await prisma.user.update({
            where: { id: payload.userId },
            data: { refreshToken: null },
        });

        res.sendStatus(204);
    } catch (error) {
        res.sendStatus(204);
    }
});


module.exports = router;