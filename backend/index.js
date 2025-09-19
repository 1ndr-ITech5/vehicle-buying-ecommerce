require('dotenv').config();

console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);

const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const reviewRoutes = require('./routes/reviews');
const partRoutes = require('./routes/parts');
const uploadRoutes = require('./routes/upload');
const savedItemsRoutes = require('./routes/savedItems');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/saved-items', savedItemsRoutes);

app.get('/', (req, res) => {
  res.send('AutoShqip API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});