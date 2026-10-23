import { TestBed } from '@angular/core/testing';
import { CoachSection } from './coach-section';

describe('CoachSection', () => {
  it('should link to the admin Telegram and the coach panel when rendered', () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(CoachSection);
    fixture.detectChanges();

    const hrefs = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.actions a')].map(
      (link) => link.getAttribute('href'),
    );

    expect(hrefs).toEqual(['https://t.me/peaktofan_admin', 'https://coach.peaktofan.com/']);
  });
});
