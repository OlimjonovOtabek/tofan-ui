import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { EXTERNAL_LINKS } from '@landing/core/config/external-links';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { Icon } from '@landing/shared/icon/icon';
import { COACH_STEPS } from '../../models/numbered-steps';

@Component({
  selector: 'landing-coach-section',
  imports: [LandingTranslatePipe, Icon],
  templateUrl: './coach-section.html',
  styleUrl: './coach-section.css',
})
export class CoachSection {
  protected readonly sectionId = SITE_SECTIONS.coaches;
  protected readonly steps = COACH_STEPS;
  protected readonly adminUrl = EXTERNAL_LINKS.adminTelegram;
  protected readonly panelUrl = EXTERNAL_LINKS.coachPanel;
}
