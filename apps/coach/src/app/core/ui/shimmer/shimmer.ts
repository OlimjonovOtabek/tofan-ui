import { Component, input } from '@angular/core';

@Component({
  selector: 'coach-shimmer',
  template: '',
  styleUrl: './shimmer.css',
  host: {
    'aria-hidden': 'true',
    '[style.height.px]': 'height()',
    '[style.width]': 'width()',
    '[style.border-radius.px]': 'radius()',
  },
})
export class Shimmer {
  readonly height = input.required<number>();
  readonly width = input('100%');
  readonly radius = input(20);
}
