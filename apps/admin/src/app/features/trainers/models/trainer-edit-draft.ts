import { requireDisplayName, toOptionalText } from './trainer-draft';

export interface TrainerEditDraft {
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly displayName: string;
  readonly bio: string | null;
  readonly photoFileId: string | null;
  readonly monthlyPrice: number;
}

export function createTrainerEditDraft(draft: TrainerEditDraft): TrainerEditDraft {
  return {
    email: draft.email.trim(),
    phoneNumber: toOptionalText(draft.phoneNumber),
    displayName: requireDisplayName(draft.displayName),
    bio: toOptionalText(draft.bio),
    photoFileId: draft.photoFileId,
    monthlyPrice: draft.monthlyPrice,
  };
}
