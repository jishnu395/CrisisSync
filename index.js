require('dotenv').config();
const express = require('express');
const cors = require('cors');
const incidentRoutes = require('./routes/incidents');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing POST/PATCH bodies

// Routes
app.use('/api', incidentRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.send('CrisisSync API is operational.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`CrisisSync backend running on port ${PORT}`);
});