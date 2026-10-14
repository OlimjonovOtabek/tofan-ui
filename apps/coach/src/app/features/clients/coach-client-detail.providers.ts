import { CoachClientDetailStore } from './coach-client-detail.store';
import { CoachFoodDiaryStore } from './coach-food-diary.store';
import { CoachNutritionReportStore } from './coach-nutrition-report.store';
import { CoachWeightReportStore } from './coach-weight-report.store';
import { CoachWorkoutReportStore } from './coach-workout-report.store';

export const CLIENT_DETAIL_STORES = [
  CoachWeightReportStore,
  CoachWorkoutReportStore,
  CoachNutritionReportStore,
  CoachFoodDiaryStore,
  CoachClientDetailStore,
] as const;
