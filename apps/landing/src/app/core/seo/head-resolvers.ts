import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LandingHead } from './landing-head';

export const homeHead: ResolveFn<boolean> = () => {
  inject(LandingHead).showHome();
  return true;
};

export const notFoundHead: ResolveFn<boolean> = () => {
  inject(LandingHead).showNotFound();
  return true;
};
