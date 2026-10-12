import { ButtonDirective } from '@openng/optimus-ui/button';
import { Card } from '@openng/optimus-ui/card';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'coach-access-denied-page',
  imports: [ButtonDirective, Card, RouterLink, TranslatePipe],
  templateUrl: './coach-access-denied-page.html',
  styleUrl: './coach-access-denied-page.css',
})
export class CoachAccessDeniedPage {}
