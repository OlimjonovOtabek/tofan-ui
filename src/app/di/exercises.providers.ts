import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { CreateExerciseUseCase } from '@application/exercises/create-exercise.use-case';
import { DeleteExerciseUseCase } from '@application/exercises/delete-exercise.use-case';
import { GetExercisesUseCase } from '@application/exercises/get-exercises.use-case';
import { SetExerciseActivationUseCase } from '@application/exercises/set-exercise-activation.use-case';
import { UpdateExerciseUseCase } from '@application/exercises/update-exercise.use-case';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';
import { FakeExerciseRepository } from '@infrastructure/exercises/fake-exercise.repository';
import { HttpExerciseRepository } from '@infrastructure/exercises/http-exercise.repository';

export interface ExercisesProvidersOptions {
  readonly useMockApi: boolean;
}

export function provideExercises({ useMockApi }: ExercisesProvidersOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ExerciseRepository,
      useClass: useMockApi ? FakeExerciseRepository : HttpExerciseRepository,
    },
    {
      provide: GetExercisesUseCase,
      useFactory: () => new GetExercisesUseCase(inject(ExerciseRepository)),
    },
    {
      provide: CreateExerciseUseCase,
      useFactory: () => new CreateExerciseUseCase(inject(ExerciseRepository)),
    },
    {
      provide: UpdateExerciseUseCase,
      useFactory: () => new UpdateExerciseUseCase(inject(ExerciseRepository)),
    },
    {
      provide: DeleteExerciseUseCase,
      useFactory: () => new DeleteExerciseUseCase(inject(ExerciseRepository)),
    },
    {
      provide: SetExerciseActivationUseCase,
      useFactory: () => new SetExerciseActivationUseCase(inject(ExerciseRepository)),
    },
  ]);
}
