import { InjectionToken } from '@angular/core';
import { Roles } from './roles';

export const REQUIRED_LOGIN_ROLE = new InjectionToken<string>('REQUIRED_LOGIN_ROLE', {
  providedIn: 'root',
  factory: () => Roles.admin,
});
