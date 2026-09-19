export enum Gender {
  Male = 1,
  Female = 2,
}

export enum FitnessGoal {
  LoseWeight = 1,
  GainMuscle = 2,
  Maintain = 3,
  Recomposition = 4,
}

export enum ExperienceLevel {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export enum ActivityLevel {
  Sedentary = 1,
  Light = 2,
  Moderate = 3,
  Active = 4,
  VeryActive = 5,
}

export enum GoalPace {
  Slow = 1,
  Moderate = 2,
  Aggressive = 3,
}

export enum TrainerStyle {
  Soft = 1,
  Professional = 2,
  Aggressive = 3,
}

export enum WeightSource {
  Manual = 1,
  Estimated = 2,
  HealthSync = 3,
}

export interface SoldierListItemResponse {
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  gender: Gender;
  countryCode: string;
  goal?: FitnessGoal | null;
  experienceLevel?: ExperienceLevel | null;
  currentWeightKg?: number | null;
  targetWeightKg?: number | null;
  isHomeWorkout?: boolean | null;
  createdOnUtc: string;
}

export interface SoldierResponse {
  profileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  dateOfBirth: string;
  gender: Gender;
  profilePhotoUrl?: string | null;
  countryCode: string;
  timeZone: string;
  heightCm?: number | null;
  startingWeightKg?: number | null;
  currentWeightKg?: number | null;
  targetWeightKg?: number | null;
  bodyFatPercent?: number | null;
  experienceLevel?: ExperienceLevel | null;
  activityLevel?: ActivityLevel | null;
  isHomeWorkout?: boolean | null;
  goal?: FitnessGoal | null;
  goalPace?: GoalPace | null;
  workoutDaysPerWeek?: number | null;
  trainingDays?: number[] | null;
  goalStartDate?: string | null;
  goalTargetDate?: string | null;
  autoAdjustPlanEnabled?: boolean | null;
  currencyCode?: string | null;
  trainerStyle?: TrainerStyle | null;
  languageCode?: string | null;
  bmi?: number | null;
  estimatedWeeksToGoal?: number | null;
  createdOnUtc: string;
  updatedOnUtc?: string | null;
}

export interface WeightLogResponse {
  id: string;
  weightKg: number;
  source: WeightSource;
  note?: string | null;
  loggedOnUtc: string;
}
