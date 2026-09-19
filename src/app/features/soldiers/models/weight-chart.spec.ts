import { ChartArea, toWeightChart } from './weight-chart';
import { WeightEntry } from './weight-entry';

const AREA: ChartArea = { width: 110, height: 120, left: 10, right: 0, top: 10, bottom: 10 };

function entry(weightKg: number, day: number): WeightEntry {
  return {
    id: String(day),
    weightKg,
    source: 'manual',
    note: null,
    loggedAt: new Date(Date.UTC(2026, 8, day)),
  };
}

describe('toWeightChart', () => {
  it('should return nothing when the history is empty', () => {
    expect(toWeightChart([], 70, AREA)).toBeNull();
  });

  it('should place points by time and weight when the history has entries', () => {
    const chart = toWeightChart([entry(80, 1), entry(78, 11)], null, AREA);

    expect(chart?.minKg).toBe(77);
    expect(chart?.maxKg).toBe(81);
    expect(chart?.points.map((point) => point.x)).toEqual([10, 110]);
    expect(chart?.points.map((point) => point.y)).toEqual([35, 85]);
    expect(chart?.path).toBe('M10,35 L110,85');
  });

  it('should widen the range to show the target when the target is outside it', () => {
    const chart = toWeightChart([entry(80, 1)], 72, AREA);

    expect(chart?.minKg).toBe(71);
    expect(chart?.points[0]?.x).toBe(60);
    expect(chart?.targetY).toBe(100);
  });
});
