export interface Payment {
  readonly id: string;
  readonly name: string | null;
  readonly paidOn: Date | null;
  readonly netAmount: number;
  readonly refunded: boolean;
}
