import { Trainer } from '../models/trainer';
import { TrainerDraft } from '../models/trainer-draft';
import { TrainerEditDraft } from '../models/trainer-edit-draft';
import { CreateTrainerRequest, TrainerResponse, UpdateTrainerRequest } from './trainer.dto';

export type PhotoUrlOf = (fileId: string) => string;

export function toTrainer(response: TrainerResponse, photoUrlOf: PhotoUrlOf): Trainer {
  const photoFileId = response.photoFileId ?? null;
  return new Trainer(
    response.id,
    response.userId,
    response.displayName,
    response.bio ?? null,
    photoFileId,
    photoFileId === null ? null : photoUrlOf(photoFileId),
    response.monthlyPrice,
    response.commissionPercent ?? null,
    response.isPublished,
    new Date(response.createdOnUtc),
    response.slug ?? null,
  );
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
  };
}
