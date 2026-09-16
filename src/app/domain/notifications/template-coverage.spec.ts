import { NotificationTemplate } from './entities/notification-template';
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
    't',
    't',
    't',
    'b',
    'b',
    'b',
    isActive,
    now,
    now,
  );
}

describe('templateCoverage', () => {
  it('reaches everyone once the fallback style has an active template', () => {
    const coverage = templateCoverage(
      [template('workoutReminder', 'aggressive'), template('workoutReminder', 'professional')],
      'workoutReminder',
    );

    expect(coverage).toEqual({
      activeStyles: ['professional', 'aggressive'],
      reachesEveryone: true,
    });
  });

  it('does not reach trainees of other styles without the fallback', () => {
    expect(
      templateCoverage([template('workoutReminder', 'soft')], 'workoutReminder').reachesEveryone,
    ).toBe(false);
  });

  it('ignores inactive templates and other types', () => {
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
