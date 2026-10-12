import { buildWeightChart, WeightChartSize } from './coach-weight-chart';

const size: WeightChartSize = { width: 900, height: 260, left: 40, right: 880, top: 20, bottom: 220 };

function entry(loggedDate: string, weightKg: number) {
  return { loggedDate, weightKg };
}

describe('buildWeightChart', () => {
  it('should return no chart when there are no weights', () => {
    expect(buildWeightChart([], 76, size)).toBeNull();
  });

  it('should centre a single weight horizontally', () => {
    const chart = buildWeightChart([entry('2026-10-01', 80)], null, size);

    expect(chart?.dots).toEqual([{ x: 460, y: 120 }]);
  });

  it('should place the first weight at the left edge and the last at the right edge', () => {
    const chart = buildWeightChart([entry('2026-10-01', 84), entry('2026-10-02', 82)], null, size);

    expect(chart?.dots[0].x).toBe(40);
    expect(chart?.dots[1].x).toBe(880);
  });

  it('should draw a heavier weight higher than a lighter one', () => {
    const chart = buildWeightChart([entry('2026-10-01', 84), entry('2026-10-02', 82)], null, size);

    expect(chart?.dots[0].y).toBeLessThan(chart?.dots[1].y ?? 0);
  });

  it('should scale the axis to whole kilograms around the data', () => {
    const chart = buildWeightChart([entry('2026-10-01', 84.2), entry('2026-10-02', 82.4)], null, size);

    expect(chart?.grid.map((line) => line.value)).toEqual([81, 82, 83, 84, 85]);
  });

  it('should leave the goal line out when the target is outside the visible range', () => {
    const chart = buildWeightChart([entry('2026-10-01', 84.2), entry('2026-10-02', 82.4)], 76, size);

    expect(chart?.goalY).toBeNull();
  });

  it('should position the goal line when the target is inside the visible range', () => {
    const chart = buildWeightChart([entry('2026-10-01', 84), entry('2026-10-02', 82)], 83, size);

    expect(chart?.goalY).not.toBeNull();
  });

  it('should thin out the date labels when there are many entries', () => {
    const many = Array.from({ length: 30 }, (_, index) => entry(`2026-09-${String(index + 1).padStart(2, '0')}`, 80));

    expect(buildWeightChart(many, null, size)?.labels.length).toBeLessThanOrEqual(9);
  });
});
