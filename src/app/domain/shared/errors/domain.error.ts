/** Base class for every business rule violation. Presentation maps these to user messages. */
export abstract class DomainError extends Error {
  /** Backend error code such as `Exercise.NotFound`; empty when the error is raised client-side. */
  readonly code: string;

  protected constructor(message: string, code = '') {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}
