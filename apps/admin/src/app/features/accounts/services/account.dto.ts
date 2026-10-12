export interface UserResponse {
  id: string;
  userName: string;
  email?: string | null;
  emailVerified: boolean;
  phoneNumber?: string | null;
  isActive: boolean;
  registeredOnUtc: string;
}
