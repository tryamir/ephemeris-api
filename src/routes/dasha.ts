import { Router, type Request, type Response } from 'express';
import { calculateDashas, type MahaDasha } from '../services/dasha.js';
import type { BirthData } from '../services/ephemeris.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { year, month, day, hour, latitude, longitude } = req.body as BirthData;

  if ([year, month, day, hour, latitude, longitude].some(v => v === undefined)) {
    res.status(400).json({ error: 'Missing required fields: year, month, day, hour, latitude, longitude' });
    return;
  }

  const dashas: MahaDasha[] = calculateDashas({ year, month, day, hour, latitude, longitude });
  res.json({ dashas });
});

export default router;
