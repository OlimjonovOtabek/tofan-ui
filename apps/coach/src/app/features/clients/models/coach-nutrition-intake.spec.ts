import { CoachDailyNutrition } from '../services/coach-client-detail.dto';
import { intakeOf, nutritionSummary } from './coach-nutrition-intake';

function day(date: string, consumedCalories: number, targetCalories: number, mealsLogged: number, proteinGrams = 0): CoachDailyNutrition {
  return {
    date,
    consumedCalories,
    targetCalories,
    proteinGrams,
    carbsGrams: 0,
    fatGrams: 0,
    targetProteinGrams: 0,
    targetCarbsGrams: 0,
    targetFatGrams: 0,
    mealsLogged,
  };
}

describe('coach nutrition intake', () => {
  it('should report no target and no percent when the target is zero', () => {
    expect(intakeOf(1890, 0)).toEqual({ hasTarget: false, over: false, overBy: 0, percent: 0, barPercent: 0 });
  });

  it('should report the share of the target when intake is below it', () => {
    const intake = intakeOf(1050, 2100);

    expect(intake.percent).toBe(50);
    expect(intake.over).toBe(false);
  });

  it('should keep the real excess while capping the bar when intake is above the target', () => {
    const intake = intakeOf(2330, 2100);

    expect(intake.over).toBe(true);
    expect(intake.overBy).toBe(230);
    expect(intake.percent).toBe(111);
    expect(intake.barPercent).toBe(100);
  });

  it('should average only the days that have logged meals', () => {
    const summary = nutritionSummary([day('2026-10-09', 2000, 2100, 4, 130), day('2026-10-08', 1800, 2100, 3, 110), day('2026-10-07', 0, 2100, 0)]);

    expect(summary.averageCalories).toBe(1900);
    expect(summary.averageProtein).toBe(120);
    expect(summary.loggedDays).toBe(2);
    expect(summary.totalDays).toBe(3);
  });

  it('should count days above the target and ignore days without a target', () => {
    const summary = nutritionSummary([day('2026-10-09', 2330, 2100, 5), day('2026-10-08', 2500, 0, 4)]);

    expect(summary.overDays).toBe(1);
  });

  it('should report zero averages when nothing was logged', () => {
    expect(nutritionSummary([day('2026-10-09', 0, 2100, 0)]).averageCalories).toBe(0);
  });
});
