import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CatalogHeader } from './catalog-header';

@Component({
  imports: [CatalogHeader],
  template: `
    <app-catalog-header [title]="title" [subtitle]="subtitle">
      <button type="button">add</button>
    </app-catalog-header>
  `,
})
class Host {
  title = 'Exercises';
  subtitle: string | null = '12 total';
}

describe('CatalogHeader', () => {
  it('should render the title, the subtitle and the projected actions', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toContain('Exercises');
    expect(element.textContent).toContain('12 total');
    expect(element.querySelector('button')?.textContent).toBe('add');
  });

  it('should omit the subtitle when it is null', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.subtitle = null;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span')).toBeNull();
  });
});
