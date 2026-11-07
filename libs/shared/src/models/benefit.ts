import { LocalizedText } from './localized-text';

export const BENEFIT_TEXT_MAX_LENGTH = 200;
export const BENEFITS_MAX_COUNT = 20;

export type Benefit = LocalizedText;

export type BenefitTextProblem = 'required' | 'tooLong';

export function benefitTextProblem(text: string): BenefitTextProblem | null {
  const length = text.trim().length;
  if (length === 0) {
    return 'required';
  }
  return length > BENEFIT_TEXT_MAX_LENGTH ? 'tooLong' : null;
}

export function canAddBenefit(count: number): boolean {
  return count < BENEFITS_MAX_COUNT;
}

export function moveBenefit<TItem>(items: readonly TItem[], from: number, to: number): TItem[] {
  const moved = [...items];
  if (to < 0 || to >= items.length || from < 0 || from >= items.length) {
    return moved;
  }
  const [item] = moved.splice(from, 1);
  moved.splice(to, 0, item);
  return moved;
}
