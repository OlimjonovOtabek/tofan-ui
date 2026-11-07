import {
  BENEFITS_MAX_COUNT,
  BENEFIT_TEXT_MAX_LENGTH,
  benefitTextProblem,
  canAddBenefit,
  moveBenefit,
} from './benefit';

describe('benefit limits', () => {
  it('should allow 200 characters per text and 20 benefits when reading the limits', () => {
    expect(BENEFIT_TEXT_MAX_LENGTH).toBe(200);
    expect(BENEFITS_MAX_COUNT).toBe(20);
  });
});

describe('benefitTextProblem', () => {
  it('should report nothing when the text is filled', () => {
    expect(benefitTextProblem('Chat 1:1')).toBeNull();
  });

  it('should report required when the text is empty', () => {
    expect(benefitTextProblem('')).toBe('required');
  });

  it('should report required when the text is only spaces', () => {
    expect(benefitTextProblem('   ')).toBe('required');
  });

  it('should accept a text when it has exactly 200 characters', () => {
    expect(benefitTextProblem('a'.repeat(200))).toBeNull();
  });

  it('should report tooLong when the text has 201 characters', () => {
    expect(benefitTextProblem('a'.repeat(201))).toBe('tooLong');
  });

  it('should ignore surrounding spaces when counting characters', () => {
    expect(benefitTextProblem(`  ${'a'.repeat(200)}  `)).toBeNull();
  });
});

describe('canAddBenefit', () => {
  it('should allow another benefit when fewer than 20 exist', () => {
    expect(canAddBenefit(19)).toBe(true);
  });

  it('should refuse another benefit when 20 exist', () => {
    expect(canAddBenefit(20)).toBe(false);
  });
});

describe('moveBenefit', () => {
  const list = ['a', 'b', 'c'] as const;

  it('should move an item down when the target is later', () => {
    expect(moveBenefit(list, 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('should move an item up when the target is earlier', () => {
    expect(moveBenefit(list, 2, 1)).toEqual(['a', 'c', 'b']);
  });

  it('should move an item across several places when dragged', () => {
    expect(moveBenefit(list, 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('should keep the order when the target is outside the list', () => {
    expect(moveBenefit(list, 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveBenefit(list, 2, 3)).toEqual(['a', 'b', 'c']);
  });

  it('should not change the original list when moving', () => {
    moveBenefit(list, 0, 2);

    expect(list).toEqual(['a', 'b', 'c']);
  });
});
