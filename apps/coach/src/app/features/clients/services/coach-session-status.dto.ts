import { enumMap } from '@shared/utils/enum-map';
import { SessionStatus } from '../models/coach-session-status';

export enum WorkoutSessionStatusDto {
  Planned = 1,
  Started = 2,
  Completed = 3,
  Skipped = 4,
  Cancelled = 5,
}

export const sessionStatuses = enumMap<SessionStatus, WorkoutSessionStatusDto>(
  WorkoutSessionStatusDto,
);
