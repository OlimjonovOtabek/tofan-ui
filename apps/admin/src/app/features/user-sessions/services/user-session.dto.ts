export interface UserSessionResponse {
  id: string;
  userId: string;
  accessTokenHash: string;
  createdOnUtc: string;
  expiresOnUtc: string;
  isRevoked: boolean;
  revokedOnUtc?: string | null;
}
