import { CoachWeightPoint } from '../services/coach-client-detail.dto';
import { recentWeightRows, weightStats } from './coach-weight-stats';

function point(id: string, day: string, weightKg: number): CoachWeightPoint {
  return { id, weightKg, loggedDate: day, loggedOnUtc: `${day}T06:00:00Z`, note: null };
}

const points = [point('b', '2026-10-02', 84), point('a', '2026-10-01', 84.2), point('c', '2026-10-03', 83.5)];

describe('coach weight stats', () => {
  it('should report no stats when there are no weights', () => {
    expect(weightStats([])).toBeNull();
  });

  it('should compare the earliest and latest weights regardless of response order', () => {
    const stats = weightStats(points);

    expect(stats?.first).toBe(84.2);
    expect(stats?.last).toBe(83.5);
    expect(stats?.change).toBeCloseTo(-0.7);
    expect(stats?.count).toBe(3);
  });

  it('should list the newest entries first with the change from the previous entry', () => {
    const rows = recentWeightRows(points, 2);

    expect(rows.map((row) => row.point.id)).toEqual(['c', 'b']);
    expect(rows[0].delta).toBeCloseTo(-0.5);
  });

  it('should give the oldest entry no change', () => {
    expect(recentWeightRows(points, 5)[2].delta).toBeNull();
  });
});
