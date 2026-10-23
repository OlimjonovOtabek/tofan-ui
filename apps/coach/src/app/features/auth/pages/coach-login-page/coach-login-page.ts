import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required, schema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { BrandLogo } from '@coach/core/layout/brand-logo';
import { Button } from '@coach/core/ui/button/button';
import { Switch } from '@coach/core/ui/switch/switch';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { COACH_SUPPORT_URL, HOME_PATH } from '@coach/core/layout/coach-links';
import { SignInStore, SignInValue } from '../../sign-in.store';

const signInSchema = schema<SignInValue>((path) => {
  required(path.identifier, { message: 'coachApp.signIn.identifierRequired' });
  required(path.password, { message: 'coachApp.signIn.passwordRequired' });
});

@Component({
  selector: 'coach-login-page',
  imports: [FormField, FormRoot, TranslatePipe, BrandLogo, Button, Switch, TextField],
  providers: [SignInStore],
  templateUrl: './coach-login-page.html',
  styleUrl: './coach-login-page.css',
})
export class CoachLoginPage {
  protected readonly store = inject(SignInStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly supportUrl = COACH_SUPPORT_URL;
  protected readonly value = signal<SignInValue>(this.store.initialValue());
  protected readonly signInForm = form(this.value, signInSchema, {
    submission: { action: () => this.submit() },
  });

  private async submit(): Promise<undefined> {
    if (await this.store.signIn(this.value())) {
      await this.router.navigateByUrl(
        this.route.snapshot.queryParamMap.get('returnUrl') ?? HOME_PATH,
      );
    }
    return undefined;
  }
}
