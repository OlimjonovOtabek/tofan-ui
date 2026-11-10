const MAX_INITIALS = 2;

export const TRAINER_PUBLISH_STATES = ['published', 'draft'] as const;
export type TrainerPublishState = (typeof TRAINER_PUBLISH_STATES)[number];

export interface TrainerListSummary {
  readonly userName: string | null;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly activeSubscribersCount: number;
}

export const NO_LIST_SUMMARY: TrainerListSummary = {
  userName: null,
  email: null,
  phoneNumber: null,
  activeSubscribersCount: 0,
};

export class Trainer {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly displayName: string,
    readonly bio: string | null,
    readonly photoFileId: string | null,
    readonly photoUrl: string | null,
    readonly monthlyPrice: number,
    readonly isPublished: boolean,
    readonly createdOn: Date,
    readonly slug: string | null,
    readonly vipMonthlyPrice: number | null,
    readonly summary: TrainerListSummary = NO_LIST_SUMMARY,
  ) {}

  publishState(): TrainerPublishState {
    return this.isPublished ? 'published' : 'draft';
  }

  hasPrice(): boolean {
    return this.monthlyPrice > 0;
  }

  hasVipPrice(): boolean {
    return this.vipMonthlyPrice !== null;
  }

  contacts(): readonly string[] {
    const { email, phoneNumber } = this.summary;
    return [email, phoneNumber].filter((contact): contact is string => contact !== null);
  }

  initials(): string {
    return this.displayName
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .slice(0, MAX_INITIALS)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }
}
