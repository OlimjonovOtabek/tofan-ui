import { ValidationError } from '@domain/shared/errors/validation.error';
import { ExerciseDraft, createExerciseDraft } from './exercise-draft';

const draft: ExerciseDraft = {
  name: 'Squat',
  nameUz: 'Skvat',
  nameRu: 'Приседание',
  muscleGroup: 'quadriceps',
  equipmentType: 'barbell',
  difficulty: 'intermediate',
  type: 'strength',
  gender: 'any',
  isCompound: true,
  isHomeExercise: false,
  instructions: null,
  videoFileId: null,
};

describe('createExerciseDraft', () => {
  it('trims the text a user typed', () => {
    const prepared = createExerciseDraft({
      ...draft,
      name: '  Squat ',
      instructions: '  Tizzani bukib pasaying. ',
    });

    expect(prepared.name).toBe('Squat');
    expect(prepared.instructions).toBe('Tizzani bukib pasaying.');
  });

  it('treats blank instructions as no instructions', () => {
    expect(createExerciseDraft({ ...draft, instructions: '   ' }).instructions).toBeNull();
  });

  it('names every language that is missing', () => {
    let error: unknown;
    try {
      createExerciseDraft({ ...draft, name: '', nameUz: ' ', nameRu: 'Приседание' });
    } catch (thrown) {
      error = thrown;
    }

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map((issue) => issue.code)).toEqual([
      'Name.Empty',
      'NameUz.Empty',
    ]);
  });
});
