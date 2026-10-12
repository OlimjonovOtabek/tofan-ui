import { CoachExercise } from './coach-exercise';
import { emptyExerciseForm, exerciseFormOf, toExerciseDraft } from './coach-exercise-form';

const exercise: CoachExercise = {
  id: 'e1',
  name: 'Squat',
  nameUz: 'O‘tirib turish',
  nameRu: 'Приседание',
  muscleGroup: 'quadriceps',
  equipmentType: 'barbell',
  difficulty: 'intermediate',
  type: 'strength',
  gender: 'any',
  isCompound: true,
  isHomeExercise: false,
  isActive: true,
  instructions: null,
  videoFileId: null,
};

describe('coach exercise form', () => {
  it('should leave muscle group and equipment unchosen when a new exercise starts', () => {
    expect(emptyExerciseForm('v1')).toMatchObject({ muscleGroup: null, equipmentType: null, videoFileId: 'v1' });
  });

  it('should not build a draft while muscle group or equipment is unchosen', () => {
    expect(toExerciseDraft({ ...emptyExerciseForm(null), name: 'Squat' })).toBeNull();
  });

  it('should ask the coach to choose again when the saved value is unspecified', () => {
    const form = exerciseFormOf({ ...exercise, muscleGroup: 'unknown', equipmentType: 'none' }, null);

    expect(form.muscleGroup).toBeNull();
    expect(form.equipmentType).toBeNull();
  });

  it('should trim the names and turn blank instructions into null when a draft is built', () => {
    const form = { ...exerciseFormOf(exercise, 'v1'), name: ' Squat ', instructions: '  ' };

    expect(toExerciseDraft(form)).toMatchObject({
      name: 'Squat',
      muscleGroup: 'quadriceps',
      instructions: null,
      videoFileId: 'v1',
    });
  });
});
