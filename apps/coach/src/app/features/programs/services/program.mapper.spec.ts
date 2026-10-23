import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';
import { MealTypeDto } from '@coach/core/fitness/meal-type.dto';
import { ServingUnitDto } from '@coach/core/fitness/serving-unit.dto';
import { pendingVideoDraft } from '../models/day-draft';
import { mealDraftsOf } from '../models/meal-draft';
import { toFood, toMealProgramDetail, toMealProgramRequest } from './meal-program.mapper';
import { WorkoutProgramDetailResponse } from './program.dto';
import {
  toCreateWorkoutProgramRequest,
  toDayRequest,
  toWorkoutProgramDetail,
} from './workout-program.mapper';

const detail: WorkoutProgramDetailResponse = {
  id: 'w1',
  name: 'Strong',
  goal: FitnessGoalDto.GainMuscle,
  experienceLevel: 2,
  isHomeWorkout: false,
  isPublished: true,
  createdOnUtc: '2026-10-01T00:00:00Z',
  dayCount: null,
  days: [
    {
      id: 'd2',
      title: 'Pull',
      description: null,
      isRestDay: false,
      displayOrder: 1,
      exercises: [],
    },
    {
      id: 'd1',
      title: 'Push',
      description: 'Chest',
      isRestDay: false,
      displayOrder: 0,
      exercises: [
        {
          id: 'x1',
          displayOrder: 0,
          exercise: {
            id: 'e1',
            name: 'Bench',
            nameRu: 'Жим',
            nameUz: 'Jim',
            videoFileId: 'f1',
            videoUrl: '/v/1',
            hlsUrl: null,
            posterUrl: null,
          },
        },
        {
          id: 'x2',
          displayOrder: 1,
          exercise: {
            id: 'e2',
            name: 'Fly',
            nameRu: '',
            nameUz: '',
            videoFileId: null,
            videoUrl: null,
            hlsUrl: null,
            posterUrl: null,
          },
        },
      ],
    },
  ],
};

describe('toWorkoutProgramDetail', () => {
  it('should order days, keep video exercises and count the dropped ones', () => {
    const program = toWorkoutProgramDetail(detail, (path) => (path ? `/api${path}` : null));

    expect(program.goal).toBe('gainMuscle');
    expect(program.experienceLevel).toBe('intermediate');
    expect(program.dayCount).toBe(2);
    expect(program.days.map((day) => day.title)).toEqual(['Push', 'Pull']);
    expect(program.days[0].videos).toEqual([
      {
        key: 'x1',
        fileId: 'f1',
        name: { en: 'Bench', uz: 'Jim', ru: 'Жим' },
        videoUrl: '/api/v/1',
        hlsUrl: null,
        posterUrl: null,
      },
    ]);
    expect(program.days[0].droppedExerciseCount).toBe(1);
  });
});

describe('toDayRequest', () => {
  it('should send only uploaded videos and drop blank text', () => {
    const uploaded = { ...pendingVideoDraft('a', 'blob:a'), fileId: 'f1', name: ' Squat ' };
    const unnamed = { ...pendingVideoDraft('b', 'blob:b'), fileId: 'f2' };

    expect(
      toDayRequest({
        title: ' Legs ',
        description: ' ',
        videos: [uploaded, unnamed, pendingVideoDraft('c', 'blob:c')],
        droppedExerciseCount: 0,
      }),
    ).toEqual({ title: 'Legs', videos: [{ fileId: 'f1', name: 'Squat' }, { fileId: 'f2' }] });
  });
});

describe('toCreateWorkoutProgramRequest', () => {
  it('should map the enums and include the days', () => {
    expect(
      toCreateWorkoutProgramRequest(
        { name: 'Strong', goal: 'loseWeight', experienceLevel: 'advanced', isHomeWorkout: true },
        [],
      ),
    ).toEqual({ name: 'Strong', goal: 1, experienceLevel: 3, isHomeWorkout: true, days: [] });
  });
});

describe('meal program mapping', () => {
  const response = {
    id: 'm1',
    name: ' Cut ',
    goal: FitnessGoalDto.LoseWeight,
    isPublished: false,
    mealCount: 0,
    totals: null,
    optionTotals: null,
    meals: [
      {
        id: 'meal1',
        mealType: MealTypeDto.SecondBreakfast,
        plannedTime: null,
        title: 'Snack',
        displayOrder: 0,
        items: [
          {
            id: 'i1',
            foodId: 'egg',
            foodName: 'Egg',
            foodNameRu: 'Яйцо',
            foodNameUz: 'Tuxum',
            quantity: 2,
            unit: ServingUnitDto.Piece,
            quantityGrams: 100,
            calories: 140,
            estimatedCost: null,
            optionNumber: 2,
          },
        ],
      },
    ],
  };

  it('should read the detail with option numbers and units', () => {
    const program = toMealProgramDetail(response);

    expect(program.name).toBe('Cut');
    expect(program.mealCount).toBe(1);
    expect(program.meals[0].type).toBe('secondBreakfast');
    expect(program.meals[0].items[0]).toMatchObject({
      unit: 'piece',
      optionNumber: 2,
      quantity: 2,
    });
  });

  it('should write options as numbered items when the program is saved', () => {
    const meals = mealDraftsOf(toMealProgramDetail(response).meals);

    expect(toMealProgramRequest(' Cut ', null, meals)).toEqual({
      name: 'Cut',
      meals: [
        {
          mealType: MealTypeDto.SecondBreakfast,
          title: 'Snack',
          displayOrder: 0,
          items: [{ foodId: 'egg', quantity: 2, unit: ServingUnitDto.Piece, optionNumber: 1 }],
        },
      ],
    });
  });

  it('should fall back to grams when a food has no unit', () => {
    expect(
      toFood({
        id: 'f',
        name: null,
        nameRu: null,
        nameUz: null,
        servingUnit: null,
        servingSize: 100,
        servingSizeGrams: 100,
        caloriesPerServing: 50,
      }).servingUnit,
    ).toBe('grams');
  });
});
