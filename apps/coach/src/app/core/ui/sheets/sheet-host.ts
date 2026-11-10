import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { OptionTile } from '../option-tile/option-tile';
import { Sheet } from '../sheet/sheet';
import { TextField } from '../text-field/text-field';
import { EMPTY_TEXT_PAIR, SheetAction, SheetChoice, SheetRequest } from './sheet-request';
import { Sheets } from './sheets.service';

@Component({
  selector: 'coach-sheet-host',
  imports: [Sheet, Button, Icon, OptionTile, TextField],
  templateUrl: './sheet-host.html',
  styleUrl: './sheet-host.css',
})
export class SheetHost {
  private readonly sheets = inject(Sheets);

  protected readonly request = this.sheets.request;
  protected readonly confirmSheet = computed(() => narrow(this.request(), 'confirm'));
  protected readonly actionSheet = computed(() => narrow(this.request(), 'actions'));
  protected readonly choiceSheet = computed(() => narrow(this.request(), 'choose'));
  protected readonly promptSheet = computed(() => narrow(this.request(), 'prompt'));
  protected readonly pairSheet = computed(() => narrow(this.request(), 'pair'));
  protected readonly title = computed(() => {
    const request = this.request();
    if (request === null) {
      return '';
    }
    return request.kind === 'actions' || request.kind === 'choose'
      ? request.title
      : request.sheet.title;
  });
  protected readonly promptText = linkedSignal(() => {
    const request = this.request();
    return request?.kind === 'prompt' ? request.sheet.initial : '';
  });

  protected readonly pairTitle = linkedSignal(() => this.initialPair().title);
  protected readonly pairText = linkedSignal(() => this.initialPair().text);
  protected readonly canSavePair = computed(
    () => !this.pairSheet()?.sheet.titleRequired || this.pairTitle().trim().length > 0,
  );

  private readonly initialPair = computed(() => this.pairSheet()?.sheet.initial ?? EMPTY_TEXT_PAIR);

  protected openChanged(open: boolean): void {
    if (!open) {
      this.sheets.dismiss();
    }
  }

  protected confirm(confirmed: boolean): void {
    const request = this.request();
    if (request?.kind !== 'confirm') {
      return;
    }
    this.sheets.complete();
    request.resolve(confirmed);
  }

  protected run(action: SheetAction): void {
    const request = this.request();
    if (request?.kind !== 'actions') {
      return;
    }
    this.sheets.complete();
    request.resolve();
    action.run();
  }

  protected choose(choice: SheetChoice<unknown>): void {
    const request = this.request();
    if (request?.kind !== 'choose') {
      return;
    }
    this.sheets.complete();
    request.resolve(choice.value);
  }

  protected save(): void {
    const request = this.request();
    if (request?.kind !== 'prompt') {
      return;
    }
    const text = this.promptText().trim();
    this.sheets.complete();
    request.resolve(text);
  }

  protected savePair(): void {
    const request = this.request();
    if (request?.kind !== 'pair' || !this.canSavePair()) {
      return;
    }
    const pair = { title: this.pairTitle().trim(), text: this.pairText().trim() };
    this.sheets.complete();
    request.resolve(pair);
  }
}

function narrow<K extends SheetRequest['kind']>(
  request: SheetRequest | null,
  kind: K,
): Extract<SheetRequest, { kind: K }> | null {
  return request !== null && isKind(request, kind) ? request : null;
}

function isKind<K extends SheetRequest['kind']>(
  request: SheetRequest,
  kind: K,
): request is Extract<SheetRequest, { kind: K }> {
  return request.kind === kind;
}
