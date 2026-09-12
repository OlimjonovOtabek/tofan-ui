export interface Environment {
  readonly production: boolean;
  /** Backend root URL that the generated OpenAPI client calls. */
  readonly apiBaseUrl: string;
  /** Swaps HTTP repositories with in-memory fakes, so the UI works without a backend. */
  readonly useMockApi: boolean;
}
