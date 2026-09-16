export enum MuscleGroup {
  Unknown = 0,
  Chest = 1,
  Back = 2,
  Shoulders = 3,
  Biceps = 4,
  Triceps = 5,
  Forearms = 6,
  Abs = 7,
  Obliques = 8,
  Glutes = 9,
  Quadriceps = 10,
  Hamstrings = 11,
  Calves = 12,
  FullBody = 13,
  Cardio = 14,
}

export enum EquipmentType {
  None = 0,
  Bodyweight = 1,
  Barbell = 2,
  Dumbbell = 3,
  Kettlebell = 4,
  Machine = 5,
  Cable = 6,
  ResistanceBand = 7,
  Bench = 8,
  PullUpBar = 9,
  SmithMachine = 10,
}

export enum ExerciseDifficulty {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export enum ExerciseType {
  Strength = 1,
  Cardio = 2,
  Mobility = 3,
  Flexibility = 4,
  WarmUp = 5,
  CoolDown = 6,
}

export enum ExerciseGender {
  Any = 0,
  Male = 1,
  Female = 2,
}

export interface ExerciseResponse {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  muscleGroup: MuscleGroup;
  equipmentType: EquipmentType;
  difficulty: ExerciseDifficulty;
  type: ExerciseType;
  gender: ExerciseGender;
  isCompound: boolean;
  isHomeExercise: boolean;
  isActive: boolean;
  instructions?: string | null;
  videoFileId?: string | null;
}

export interface CreateExerciseRequest {
  name: string;
  nameUz: string;
  nameRu: string;
  muscleGroup: MuscleGroup;
  equipmentType: EquipmentType;
  difficulty: ExerciseDifficulty;
  type: ExerciseType;
  gender: ExerciseGender;
  isCompound: boolean;
  isHomeExercise: boolean;
  instructions?: string | null;
  videoFileId?: string | null;
}
