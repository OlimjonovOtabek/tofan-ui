export class LatestRequest {
  private generation = 0;

  begin(): () => boolean {
    const generation = ++this.generation;
    return () => generation === this.generation;
  }

  cancel(): void {
    this.generation++;
  }
}
