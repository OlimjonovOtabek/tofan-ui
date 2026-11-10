import { Query } from '@core/http/api.dto';
import { Trainer } from '../models/trainer';
import { TrainerListFilter } from '../models/trainer-list-filter';
import { TrainerDraft } from '../models/trainer-draft';
import { TrainerEditDraft } from '../models/trainer-edit-draft';
import { CreateTrainerRequest, TrainerSummaryResponse, UpdateTrainerRequest } from './trainer.dto';

export type PhotoUrlOf = (fileId: string) => string;

export function toTrainer(response: TrainerSummaryResponse, photoUrlOf: PhotoUrlOf): Trainer {
  const photoFileId = response.photoFileId ?? null;
  return new Trainer(
    response.id,
    response.userId,
    response.displayName,
    response.bio ?? null,
    photoFileId,
    photoFileId === null ? null : photoUrlOf(photoFileId),
    response.monthlyPrice,
    response.isPublished,
    new Date(response.createdOnUtc),
    response.slug ?? null,
    response.vipMonthlyPrice ?? null,
    {
      userName: response.userName ?? null,
      email: response.email ?? null,
      phoneNumber: response.phoneNumber ?? null,
      activeSubscribersCount: response.activeSubscribersCount ?? 0,
    },
  );
}

export function toTrainerListQuery(filter: TrainerListFilter): Query {
  return {
    Search: filter.search,
    IsPublished:
      filter.publishState === undefined ? undefined : filter.publishState === 'published',
  };
}

export function toCreateTrainerRequest(draft: TrainerDraft): CreateTrainerRequest {
  return {
    username: draft.username,
    email: draft.email,
    phoneNumber: draft.phoneNumber,
    password: draft.password,
    displayName: draft.displayName,
    bio: draft.bio,
    photoFileId: draft.photoFileId,
  };
}

export function toUpdateTrainerRequest(draft: TrainerEditDraft): UpdateTrainerRequest {
  return {
    email: draft.email,
    phoneNumber: draft.phoneNumber,
    displayName: draft.displayName,
    bio: draft.bio,
    photoFileId: draft.photoFileId,
    monthlyPrice: draft.monthlyPrice,
    vipMonthlyPrice: draft.vipMonthlyPrice,
  };
}
