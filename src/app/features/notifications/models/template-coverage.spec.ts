import { NotificationTemplate } from './notification-template';
import { NotificationType, TrainerStyle } from './notification-attributes';
import { templateCoverage } from './template-coverage';

function template(
  type: NotificationType,
  style: TrainerStyle,
  isActive = true,
): NotificationTemplate {
  const now = new Date('2026-09-16T00:00:00Z');
  return new NotificationTemplate(
    'id',
    type,
    style,
    { en: 't', uz: 't', ru: 't' },
    { en: 'b', uz: 'b', ru: 'b' },
    isActive,
    now,
    now,
  );
}

describe('templateCoverage', () => {
  it('should reach everyone when the fallback style has an active template', () => {
    const coverage = templateCoverage(
      [template('workoutReminder', 'aggressive'), template('workoutReminder', 'professional')],
      'workoutReminder',
    );

    expect(coverage).toEqual({
      activeStyles: ['professional', 'aggressive'],
      reachesEveryone: true,
    });
  });

  it('should not reach other styles when the fallback template is missing', () => {
    expect(
      templateCoverage([template('workoutReminder', 'soft')], 'workoutReminder').reachesEveryone,
    ).toBe(false);
  });

  it('should ignore templates when they are inactive or of another type', () => {
    expect(
      templateCoverage(
        [
          template('workoutReminder', 'professional', false),
          template('mealReminder', 'professional'),
        ],
        'workoutReminder',
      ),
    ).toEqual({ activeStyles: [], reachesEveryone: false });
  });
});
