export const GENDERS = ['male', 'female'] as const;
export type Gender = (typeof GENDERS)[number];

export const FITNESS_GOALS = ['loseWeight', 'gainMuscle', 'maintain', 'recomposition'] as const;
export type FitnessGoal = (typeof FITNESS_GOALS)[number];

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'veryActive'] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const GOAL_PACES = ['slow', 'moderate', 'aggressive'] as const;
export type GoalPace = (typeof GOAL_PACES)[number];

export const TRAINER_STYLES = ['soft', 'professional', 'aggressive'] as const;
export type TrainerStyle = (typeof TRAINER_STYLES)[number];

export const WEIGHT_SOURCES = ['manual', 'estimated', 'healthSync'] as const;
export type WeightSource = (typeof WEIGHT_SOURCES)[number];

export const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];
