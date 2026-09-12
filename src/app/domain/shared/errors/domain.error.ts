/** Base class for every business rule violation. Presentation maps these to user messages. */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
