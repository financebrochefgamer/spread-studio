export interface Scenario {
  spotShiftPct: number;
  volShiftPts: number;
  daysForward: number;
}

export const BASE_SCENARIO: Scenario = { spotShiftPct: 0, volShiftPts: 0, daysForward: 0 };
