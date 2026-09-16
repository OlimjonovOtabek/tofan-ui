---
paths:
  - "src/app/features/**/services/**/*.ts"
  - "src/app/features/**/models/**/*.ts"
  - "src/app/core/http/**/*.ts"
---

# Models and services rules

## Models (`features/<x>/models/`)
- Plain TypeScript: no `@angular/*`, `@openng/*` or RxJS imports.
- Models are classes with `readonly` properties (when they carry derived getters such as
  `displayName`) or interfaces.
- Status/type values are union types or `as const` arrays, mirroring backend enum names in camelCase.
- Pure rules and drafts live here (`exercise-draft.ts` with `createExerciseDraft`) and are unit tested.

## Services (`features/<x>/services/`)
- `<feature>.service.ts`: `@Injectable({ providedIn: 'root' })`, injects `ApiClient`, returns models.
  One service per backend resource. No state.
- `*.dto.ts`: exact backend shape, hand-written from the staging Swagger; integer enums as TS `enum`.
  Never used outside `services/`.
- `*.mapper.ts`: pure functions `toExercise(dto)`, `toCreateExerciseRequest(model)`, enum maps via
  `enumMap`. Unit tested.
- Paths are constants in the service file; ids go through `encodeURIComponent`.
- Query objects are passed to `ApiClient.get(path, query)`; `undefined` values are dropped.
- Do not catch errors to hide them; `ApiClient` already maps failures to error classes.
  Catch only to translate a meaningful case (for example 404 → `null` in `findByBarcode`).
