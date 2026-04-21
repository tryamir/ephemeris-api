import express from 'express';
import chartRoutes from './routes/chart.js';
import dashaRoutes from './routes/dasha.js';

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = 2; // Whole Sign house system fix

app.use(express.json());

app.get('/api/version', (_req, res) => {
  res.json({ schemaVersion: API_VERSION });
});

app.use('/api/chart', chartRoutes);
app.use('/api/dasha', dashaRoutes);

app.listen(PORT, () => {
  console.log(`ephemeris-api running on port ${PORT}`);
});
