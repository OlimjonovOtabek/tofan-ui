export interface ExerciseResponse {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  muscleGroup: number;
  equipmentType: number;
  difficulty: number;
  type: number;
  gender: number;
  isCompound: boolean;
  isHomeExercise: boolean;
  isActive: boolean;
  instructions?: string | null;
  videoFileId?: string | null;
}

export interface UpdateExerciseRequest {
  name: string;
  nameUz: string;
  nameRu: string;
  muscleGroup: number;
  equipmentType: number;
  difficulty: number;
  type: number;
  gender: number;
  isCompound: boolean;
  isHomeExercise: boolean;
  instructions?: string | null;
  videoFileId: string;
}
