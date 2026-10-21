import { describe, expect, it } from 'vitest';
import { findMenuGroupLabel } from './menu-group';

describe('findMenuGroupLabel', () => {
  it('should return the group label when the url matches an item exactly', () => {
    expect(findMenuGroupLabel('/exercises')).toBe('layout.menu.catalog');
  });

  it('should return the group label when the url is below an item', () => {
    expect(findMenuGroupLabel('/soldiers/42?tab=1')).toBe('layout.menu.users');
  });

  it('should return the dashboard group only for the root url', () => {
    expect(findMenuGroupLabel('/')).toBe('layout.menu.main');
    expect(findMenuGroupLabel('/unknown')).toBeUndefined();
  });

  it('should return undefined when no item matches', () => {
    expect(findMenuGroupLabel('/not-found')).toBeUndefined();
  });
});
