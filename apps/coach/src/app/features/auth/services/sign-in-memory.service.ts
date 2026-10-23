import { Injectable } from '@angular/core';
import {
  FORGOTTEN_SIGN_IN,
  RememberedSignIn,
  parseRememberedSignIn,
} from '../models/sign-in-memory';

const STORAGE_KEY = 'tofan.coach.signIn';

@Injectable({ providedIn: 'root' })
export class SignInMemoryService {
  read(): RememberedSignIn {
    try {
      return parseRememberedSignIn(localStorage.getItem(STORAGE_KEY));
    } catch {
      return FORGOTTEN_SIGN_IN;
    }
  }

  save(value: RememberedSignIn): boolean {
    try {
      if (value.remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return true;
    } catch {
      return false;
    }
  }
}
