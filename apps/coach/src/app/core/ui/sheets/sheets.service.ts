import { Injectable, signal } from '@angular/core';
import { ConfirmSheet, PromptSheet, SheetAction, SheetChoice, SheetRequest } from './sheet-request';

@Injectable({ providedIn: 'root' })
export class Sheets {
  private readonly current = signal<SheetRequest | null>(null);

  readonly request = this.current.asReadonly();

  confirm(sheet: ConfirmSheet): Promise<boolean> {
    return new Promise((resolve) => this.show({ kind: 'confirm', sheet, resolve }));
  }

  actions(title: string, actions: readonly SheetAction[]): Promise<void> {
    return new Promise((resolve) => this.show({ kind: 'actions', title, actions, resolve }));
  }

  choose<T>(title: string, choices: readonly SheetChoice<T>[]): Promise<T | null> {
    return new Promise((resolve) =>
      this.show({ kind: 'choose', title, choices, resolve: (value) => resolve(value as T | null) }),
    );
  }

  prompt(sheet: PromptSheet): Promise<string | null> {
    return new Promise((resolve) => this.show({ kind: 'prompt', sheet, resolve }));
  }

  dismiss(): void {
    const request = this.current();
    this.current.set(null);
    resolveDismissed(request);
  }

  complete(): void {
    this.current.set(null);
  }

  private show(request: SheetRequest): void {
    this.dismiss();
    this.current.set(request);
  }
}

function resolveDismissed(request: SheetRequest | null): void {
  switch (request?.kind) {
    case 'confirm':
      request.resolve(false);
      break;
    case 'actions':
      request.resolve();
      break;
    case 'choose':
      request.resolve(null);
      break;
    case 'prompt':
      request.resolve(null);
      break;
  }
}
