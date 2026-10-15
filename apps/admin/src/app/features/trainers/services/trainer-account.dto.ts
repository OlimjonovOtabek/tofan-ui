export interface TrainerAccountResponse {
  id: string;
  userName: string;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  isActive: boolean;
  registeredOnUtc: string | null;
}
