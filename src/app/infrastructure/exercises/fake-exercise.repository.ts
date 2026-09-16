import { Injectable } from '@angular/core';
import { Exercise } from '@domain/exercises/entities/exercise';
import { ExerciseDraft } from '@domain/exercises/exercise-draft';
import {
  ExerciseFilter,
  ExerciseRepository,
} from '@domain/exercises/repositories/exercise.repository';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { Page, PageRequest } from '@domain/shared/paging/page';

const NETWORK_DELAY_MS = 250;

const SEED: readonly Exercise[] = [
  new Exercise(
    '11111111-1111-1111-1111-111111111111',
    'Barbell squat',
    'Shtanga bilan skvat',
    'Приседания со штангой',
    'quadriceps',
    'barbell',
    'intermediate',
    'strength',
    'any',
    true,
    false,
    true,
    'Yelka kengligida turib, tizzani 90 darajaga bukib pasaying.',
  ),
  new Exercise(
    '22222222-2222-2222-2222-222222222222',
    'Push-up',
    'Gantel bilan turtish',
    'Отжимания',
    'chest',
    'bodyweight',
    'beginner',
    'strength',
    'any',
    true,
    true,
    true,
  ),
  new Exercise(
    '33333333-3333-3333-3333-333333333333',
    'Plank',
    'Planka',
    'Планка',
    'abs',
    'bodyweight',
    'beginner',
    'mobility',
    'any',
    false,
    true,
    false,
  ),
];

/** In-memory catalog for `useMockApi`, so the page can be used without a backend. */
@Injectable()
export class FakeExerciseRepository implements ExerciseRepository {
  private exercises = [...SEED];

  async list(filter: ExerciseFilter, page: PageRequest): Promise<Page<Exercise>> {
    await delay();
    const matching = this.exercises.filter((exercise) => matches(exercise, filter));
    return {
      items: matching.slice(page.first, page.first + page.rows),
      totalCount: matching.length,
    };
  }

  async getById(id: string): Promise<Exercise> {
    await delay();
    return this.find(id);
  }

  async create(draft: ExerciseDraft): Promise<string> {
    await delay();
    const id = crypto.randomUUID();
    this.exercises = [toExercise(id, draft, true), ...this.exercises];
    return id;
  }

  async update(id: string, draft: ExerciseDraft): Promise<void> {
    await delay();
    const current = this.find(id);
    this.replace(toExercise(id, draft, current.isActive));
  }

  async delete(id: string): Promise<void> {
    await delay();
    this.find(id);
    this.exercises = this.exercises.filter((exercise) => exercise.id !== id);
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await delay();
    const current = this.find(id);
    this.replace(
      new Exercise(
        current.id,
        current.name,
        current.nameUz,
        current.nameRu,
        current.muscleGroup,
        current.equipmentType,
        current.difficulty,
        current.type,
        current.gender,
        current.isCompound,
        current.isHomeExercise,
        isActive,
        current.instructions,
        current.videoFileId,
      ),
    );
  }

  private find(id: string): Exercise {
    const exercise = this.exercises.find((candidate) => candidate.id === id);
    if (exercise === undefined) {
      throw new NotFoundError('The exercise was not found.', 'Exercise.NotFound');
    }
    return exercise;
  }

  private replace(exercise: Exercise): void {
    this.exercises = this.exercises.map((candidate) =>
      candidate.id === exercise.id ? exercise : candidate,
    );
  }
}

function toExercise(id: string, draft: ExerciseDraft, isActive: boolean): Exercise {
  return new Exercise(
    id,
    draft.name,
    draft.nameUz,
    draft.nameRu,
    draft.muscleGroup,
    draft.equipmentType,
    draft.difficulty,
    draft.type,
    draft.gender,
    draft.isCompound,
    draft.isHomeExercise,
    isActive,
    draft.instructions,
    draft.videoFileId,
  );
}

function matches(exercise: Exercise, filter: ExerciseFilter): boolean {
  const search = filter.search?.toLowerCase() ?? '';
  return (
    (search.length === 0 ||
      [exercise.name, exercise.nameUz, exercise.nameRu].some((name) =>
        name.toLowerCase().includes(search),
      )) &&
    (filter.muscleGroup === undefined || exercise.muscleGroup === filter.muscleGroup) &&
    (filter.equipmentType === undefined || exercise.equipmentType === filter.equipmentType) &&
    (filter.gender === undefined || exercise.gender === filter.gender) &&
    (filter.isHomeExercise === undefined || exercise.isHomeExercise === filter.isHomeExercise) &&
    (filter.isActive === undefined || exercise.isActive === filter.isActive)
  );
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
}
