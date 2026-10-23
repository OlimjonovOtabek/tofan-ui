import { IconName } from '../icon/icon-name';

export interface SheetAction {
  readonly label: string;
  readonly icon: IconName;
  readonly destructive?: boolean;
  readonly run: () => void;
}

export interface SheetChoice<T> {
  readonly value: T;
  readonly title: string;
  readonly subtitle?: string;
  readonly selected?: boolean;
}

export interface ConfirmSheet {
  readonly title: string;
  readonly message?: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly destructive?: boolean;
}

export interface PromptSheet {
  readonly title: string;
  readonly initial: string;
  readonly hint: string;
  readonly actionLabel: string;
  readonly maxLength?: number;
}

export type SheetRequest =
  | {
      readonly kind: 'confirm';
      readonly sheet: ConfirmSheet;
      readonly resolve: (confirmed: boolean) => void;
    }
  | {
      readonly kind: 'actions';
      readonly title: string;
      readonly actions: readonly SheetAction[];
      readonly resolve: () => void;
    }
  | {
      readonly kind: 'choose';
      readonly title: string;
      readonly choices: readonly SheetChoice<unknown>[];
      readonly resolve: (value: unknown) => void;
    }
  | {
      readonly kind: 'prompt';
      readonly sheet: PromptSheet;
      readonly resolve: (text: string | null) => void;
    };
