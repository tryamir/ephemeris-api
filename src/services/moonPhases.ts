import sweph from 'sweph';
import {
  calcBodyLongitude,
  dateToJulianDay,
  findAngularRootsInInterval,
  formatUTCSecond,
  normalizeDegrees,
  parseUTCDate,
  type CoordinateSystem,
} from './exactTiming.js';

const { constants } = sweph;

export type MoonPhase = 'new' | 'full';

export interface MoonPhasesInput {
  startUTC: string;
  endUTC: string;
  phases?: MoonPhase[];
  coordinateSystem?: CoordinateSystem;
}

export interface MoonPhaseEvent {
  phase: MoonPhase;
  exactUTC: string;
  sunLongitude: number;
  moonLongitude: number;
}

export interface MoonPhasesResult {
  events: MoonPhaseEvent[];
}

const PHASE_ANGLES: Record<MoonPhase, number> = {
  new: 0,
  full: 180,
};

export function calculateMoonPhases(input: MoonPhasesInput): MoonPhasesResult {
  const requestedPhases = input.phases ?? ['full'];
  const unsupportedPhase = requestedPhases.find(phase => !(phase in PHASE_ANGLES));
  if (unsupportedPhase) {
    throw new Error(`Unsupported moon phase: ${unsupportedPhase}`);
  }
  const phases = Array.from(new Set(requestedPhases));

  const startDate = parseUTCDate(input.startUTC, 'startUTC');
  const endDate = parseUTCDate(input.endUTC, 'endUTC');
  if (endDate <= startDate) {
    throw new Error('endUTC must be after startUTC');
  }

  const coordinateSystem = input.coordinateSystem ?? 'sidereal';
  const startJulianDay = dateToJulianDay(startDate);
  const endJulianDay = dateToJulianDay(endDate);

  const elongation = (julianDay: number) => {
    const sun = calcBodyLongitude(julianDay, constants.SE_SUN, coordinateSystem);
    const moon = calcBodyLongitude(julianDay, constants.SE_MOON, coordinateSystem);
    return normalizeDegrees(moon.longitude - sun.longitude);
  };

  const events = phases.flatMap(phase =>
    findAngularRootsInInterval(elongation, PHASE_ANGLES[phase], startJulianDay, endJulianDay).map(julianDay => {
      const sun = calcBodyLongitude(julianDay, constants.SE_SUN, coordinateSystem);
      const moon = calcBodyLongitude(julianDay, constants.SE_MOON, coordinateSystem);

      return {
        phase,
        exactUTC: formatUTCSecond(julianDay),
        sunLongitude: normalizeDegrees(sun.longitude),
        moonLongitude: normalizeDegrees(moon.longitude),
      };
    }),
  ).sort((a, b) => a.exactUTC.localeCompare(b.exactUTC));

  return { events };
}
