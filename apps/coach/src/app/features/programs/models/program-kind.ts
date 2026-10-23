export const PROGRAM_KINDS = ['workout', 'meal'] as const;

export type ProgramKind = (typeof PROGRAM_KINDS)[number];

export const PROGRAM_KIND_PARAM = 'kind';

export function toProgramKind(value: unknown): ProgramKind {
  return value === 'meal' ? 'meal' : 'workout';
}
