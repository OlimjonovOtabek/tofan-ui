import { RouteNode, isPushedRoute } from './coach-navigation';

function route(data: Record<string, unknown>, firstChild: RouteNode | null = null): RouteNode {
  return { data, firstChild };
}

describe('isPushedRoute', () => {
  it('should be pushed when any route in the active branch is marked pushed', () => {
    expect(isPushedRoute(route({}, route({}, route({ pushed: true }))))).toBe(true);
  });

  it('should not be pushed when no route in the branch is marked', () => {
    expect(isPushedRoute(route({}, route({ title: 'x' })))).toBe(false);
  });
});
