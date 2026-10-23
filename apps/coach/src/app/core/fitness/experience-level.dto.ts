import { enumMap } from '@shared/utils/enum-map';
import { ExperienceLevel } from './experience-level';

export enum ExperienceLevelDto {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export const experienceLevels = enumMap<ExperienceLevel, ExperienceLevelDto>(ExperienceLevelDto);
