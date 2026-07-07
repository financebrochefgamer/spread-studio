'use client';

import { useEffect, useRef } from 'react';
import { BASE_SCENARIO, type Scenario } from '@/lib/positions/scenario';
import { track } from '@/lib/analytics/store';

const SCENARIO_ADJUSTED_DEBOUNCE_MS = 500;

interface Props {
  scenario: Scenario;
  maxDaysForward: number;
  onChange: (scenario: Scenario) => void;
}

export function ScenarioControls({ scenario, maxDaysForward, onChange }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const trackScenario = (next: Scenario) => {
    track('scenario_adjusted', {
      spot_shift_pct: next.spotShiftPct,
      vol_shift_pts: next.volShiftPts,
      days_forward: next.daysForward,
    });
  };

  const update = (patch: Partial<Scenario>) => {
    const next = { ...scenario, ...patch };
    onChange(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => trackScenario(next), SCENARIO_ADJUSTED_DEBOUNCE_MS);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange(BASE_SCENARIO);
    trackScenario(BASE_SCENARIO);
  };

  return (
    <div className="space-y-4 rounded border border-zinc-800 bg-zinc-950 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">Scenario</h2>
        <button
          data-testid="scenario-reset"
          type="button"
          className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-sky-400"
          onClick={reset}
        >
          Reset
        </button>
      </div>
      <ScenarioSlider
        testId="scenario-spot"
        label="Spot shift"
        value={scenario.spotShiftPct}
        min={-30}
        max={30}
        unit="%"
        onChange={(value) => update({ spotShiftPct: value })}
      />
      <ScenarioSlider
        testId="scenario-vol"
        label="Vol shift"
        value={scenario.volShiftPts}
        min={-20}
        max={20}
        unit=" pt"
        onChange={(value) => update({ volShiftPts: value })}
      />
      <ScenarioSlider
        testId="scenario-days"
        label="Days forward"
        value={scenario.daysForward}
        min={0}
        max={maxDaysForward}
        unit="d"
        onChange={(value) => update({ daysForward: value })}
      />
    </div>
  );
}

function ScenarioSlider({
  testId,
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  testId: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-xs">
      <div className="mb-1 flex items-center justify-between text-zinc-400">
        <span>{label}</span>
        <span className="num text-zinc-100">
          {value}
          {unit}
        </span>
      </div>
      <input
        data-testid={testId}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-sky-400"
      />
    </label>
  );
}
