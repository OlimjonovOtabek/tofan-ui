import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { START_STEPS } from '../../models/numbered-steps';
import { SectionHeading } from '../section-heading/section-heading';

@Component({
  selector: 'landing-steps-section',
  imports: [LandingTranslatePipe, SectionHeading],
  templateUrl: './steps-section.html',
  styleUrl: './steps-section.css',
})
export class StepsSection {
  protected readonly steps = START_STEPS;
}
