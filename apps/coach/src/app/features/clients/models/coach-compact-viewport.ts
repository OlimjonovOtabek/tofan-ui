import { DOCUMENT, DestroyRef, Signal, inject, signal } from '@angular/core';

const COMPACT_QUERY = '(max-width: 760px)';

export function compactViewport(): Signal<boolean> {
  const view = inject(DOCUMENT).defaultView;
  const query = typeof view?.matchMedia === 'function' ? view.matchMedia(COMPACT_QUERY) : null;
  const compact = signal(query?.matches ?? false);
  if (query !== null) {
    const update = (): void => compact.set(query.matches);
    query.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', update));
  }
  return compact.asReadonly();
}
