import { Router, type Request, type Response } from 'express';
import { calculateMoonPhases, type MoonPhasesInput } from '../services/moonPhases.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  try {
    const { startUTC, endUTC, phases, coordinateSystem } = req.body as MoonPhasesInput;

    if (!startUTC || !endUTC) {
      res.status(400).json({ error: 'Missing required fields: startUTC, endUTC' });
      return;
    }

    if (phases !== undefined && (!Array.isArray(phases) || phases.length === 0)) {
      res.status(400).json({ error: 'phases must be a non-empty array when provided' });
      return;
    }

    if (coordinateSystem !== undefined && coordinateSystem !== 'sidereal' && coordinateSystem !== 'tropical') {
      res.status(400).json({ error: 'coordinateSystem must be sidereal or tropical' });
      return;
    }

    res.json(calculateMoonPhases({ startUTC, endUTC, ...(phases && { phases }), ...(coordinateSystem && { coordinateSystem }) }));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid moon phase request' });
  }
});

export default router;
