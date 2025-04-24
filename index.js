require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Asset schema
const assetSchema = new mongoose.Schema({
  name: String,
  type: String,
  value: Number,
});

const Asset = mongoose.model('Asset', assetSchema);

// Test route
app.get('/assets', async (req, res) => {
  const assets = await Asset.find();
  res.json(assets);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
