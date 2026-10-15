import { Trainer } from '../models/trainer';
import { TrainerDraft } from '../models/trainer-draft';
import { CreateTrainerRequest, TrainerResponse } from './trainer.dto';

export type PhotoUrlOf = (fileId: string) => string;

export function toTrainer(response: TrainerResponse, photoUrlOf: PhotoUrlOf): Trainer {
  return new Trainer(
    response.id,
    response.userId,
    response.displayName,
    response.bio ?? null,
    response.photoFileId === null || response.photoFileId === undefined
      ? null
      : photoUrlOf(response.photoFileId),
    response.monthlyPrice,
    response.isPublished,
    new Date(response.createdOnUtc),
  );
}

export function toCreateTrainerRequest(draft: TrainerDraft): CreateTrainerRequest {
  return {
    username: draft.username,
    email: draft.email,
    phoneNumber: draft.phoneNumber,
    password: draft.password,
    displayName: draft.displayName,
    photoFileId: draft.photoFileId,
  };
}
