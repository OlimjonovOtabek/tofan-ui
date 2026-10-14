import { CoachDailyNutrition } from '../services/coach-client-detail.dto';

export interface Intake {
  hasTarget: boolean;
  over: boolean;
  overBy: number;
  percent: number;
  barPercent: number;
}

export interface NutritionSummary {
  totalDays: number;
  loggedDays: number;
  overDays: number;
  averageCalories: number;
  averageProtein: number;
}

const FULL_PERCENT = 100;

export function intakeOf(consumed: number, target: number): Intake {
  if (target <= 0) {
    return { hasTarget: false, over: false, overBy: 0, percent: 0, barPercent: 0 };
  }
  const percent = Math.round((consumed / target) * FULL_PERCENT);
  return {
    hasTarget: true,
    over: consumed > target,
    overBy: Math.max(0, consumed - target),
    percent,
    barPercent: Math.min(FULL_PERCENT, percent),
  };
}

export function nutritionSummary(days: readonly CoachDailyNutrition[]): NutritionSummary {
  const logged = days.filter((day) => day.mealsLogged > 0);
  const average = (pick: (day: CoachDailyNutrition) => number): number =>
    logged.length === 0 ? 0 : Math.round(logged.reduce((sum, day) => sum + pick(day), 0) / logged.length);
  return {
    totalDays: days.length,
    loggedDays: logged.length,
    overDays: days.filter((day) => intakeOf(day.consumedCalories, day.targetCalories).over).length,
    averageCalories: average((day) => day.consumedCalories),
    averageProtein: average((day) => day.proteinGrams),
  };
}
