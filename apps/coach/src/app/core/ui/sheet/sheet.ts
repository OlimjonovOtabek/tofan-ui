import {
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  input,
  model,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'coach-sheet',
  template: `
    <dialog #dialog class="sheet" [attr.aria-label]="title()" (close)="open.set(false)">
      @if (open()) {
        <h2 class="t-title2">{{ title() }}</h2>
        <div class="body"><ng-content /></div>
      }
    </dialog>
  `,
  styleUrl: './sheet.css',
})
export class Sheet {
  readonly open = model(false);
  readonly title = input.required<string>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() =>
      this.dialog().nativeElement.addEventListener('click', (event) => this.closeOnBackdrop(event)),
    );
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected closeOnBackdrop(event: Event): void {
    if (event.target === this.dialog().nativeElement) {
      this.open.set(false);
    }
  }
}
