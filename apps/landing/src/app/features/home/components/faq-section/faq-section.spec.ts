import { TestBed } from '@angular/core/testing';
import { FaqSection } from './faq-section';

describe('FaqSection', () => {
  it('should open only the first question when rendered', () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(FaqSection);
    fixture.detectChanges();

    const items = [...(fixture.nativeElement as HTMLElement).querySelectorAll('details')];

    expect(items).toHaveLength(4);
    expect(items.map((item) => item.open)).toEqual([true, false, false, false]);
  });
});
