---
paths:
  - "src/**/*.spec.ts"
---

# Test rules (Vitest)

- Arrange / Act / Assert, one behaviour per test, name: `should <result> when <condition>`.
- Stores: `TestBed` with the feature service replaced by `{ provide: ExercisesService, useValue: {...} }`.
  Never mock `HttpClient` in store tests.
- Mappers, drafts and pure model rules: plain unit tests, no TestBed.
- `core/http`: `HttpTestingController` is allowed there.
- Components: `TestBed.createComponent`, set inputs with `fixture.componentRef.setInput()`.
- Time: pass `now` explicitly or use `vi.useFakeTimers()`. No real waits.
- No snapshot tests of Optimus UI markup.
- Every bug fix starts with a failing test.
