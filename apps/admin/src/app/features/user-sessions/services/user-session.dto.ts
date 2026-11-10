export enum UserSessionStatusDto {
  Active = 1,
  Revoked = 2,
  Expired = 3,
}

export interface UserSessionResponse {
  id: string;
  userId: string;
  accessTokenHash: string;
  createdOnUtc: string;
  expiresOnUtc: string;
  isRevoked: boolean;
  revokedOnUtc?: string | null;
  userName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
