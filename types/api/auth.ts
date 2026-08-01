// Authentication API Types

export enum AccountType {
  TALENT = "talent",
  CLIENT = "client",
  ADMIN = "admin",
}

export enum UserStatus {
  PENDING_VERIFICATION = "pending_verification",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BLOCKED = "blocked",
  INVITED = "invited",
}

export enum UserRole {
  USER = "user",
  TALENT = "talent",
  CLIENT_OWNER = "client_owner",
  CLIENT_ADMIN = "client_admin",
  CLIENT_RECRUITER = "client_recruiter",
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  SUPPORT = "support",
  MODERATOR = "moderator",
}

export enum EmploymentType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  CONTRACT = "contract",
  FREELANCE = "freelance",
  INTERNSHIP = "internship",
  TEMPORARY = "temporary",
}

export enum WorkPreference {
  REMOTE = "remote",
  ON_SITE = "on-site",
  HYBRID = "hybrid",
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  accountType: AccountType;
  roles: UserRole[];
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  tempPassword: boolean;
  termsAccepted: boolean;
  invitedBy?: string;
  invitedAt?: string;
  lastLoginAt?: string;
  totalInvited: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterTalentDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  stateOfResidence?: string;
  gender?: string;
  phone?: string;
  professionalTitle: string;
  yearsOfExperience: number;
  skills: string[];
  employmentType: EmploymentType;
  workPreference: WorkPreference;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  termsAccepted: boolean;
}

export interface RegisterTalentData {
  user: User;
  otp_reference: string;
}

export interface RegisterClientDto {
  email: string;
  password: string;
  contactFirstName: string;
  contactLastName: string;
  phone: string;
  country: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  companyDescription?: string;
  logoUrl?: string;
  termsAccepted: boolean;
}

export interface RegisterClientData {
  user: User;
  otp_reference: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginData {
  user: User;
  tokens: AuthTokens;
  session_id: string;
  temp_password?: boolean;
}

export interface GoogleAuthDto {
  id_token: string;
  account_type?: AccountType;
  terms_accepted?: boolean;
}

export interface GoogleAuthData {
  user: User;
  tokens: AuthTokens;
  session_id: string;
  is_new_user: boolean;
  profile_complete: boolean;
}

export interface TalentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  country?: string;
  stateOfResidence?: string;
  gender?: string;
  phone?: string;
  professionalTitle?: string;
  yearsOfExperience?: number;
  employmentType?: EmploymentType;
  workPreference?: WorkPreference;
  skills?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  country?: string;
  companyDescription?: string;
  logoUrl?: string;
  contactFirstName: string;
  contactLastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteTalentRegistrationDto {
  professionalTitle: string;
  yearsOfExperience: number;
  skills: string[];
  stateOfResidence?: string;
  gender?: string;
  employmentType: EmploymentType;
  workPreference: WorkPreference;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  phone?: string;
}

export interface CompleteTalentRegistrationData {
  user: User;
  profile: TalentProfile;
}

export interface CompleteClientRegistrationDto {
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  companyDescription?: string;
  logoUrl?: string;
  contactFirstName?: string;
  contactLastName?: string;
  phone?: string;
  country?: string;
}

export interface CompleteClientRegistrationData {
  user: User;
  profile: ClientProfile;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface RefreshTokenData {
  tokens: AuthTokens;
}

export interface LogoutDto {
  access_token?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordData {
  reference: string;
}

export interface ResetPasswordDto {
  reference: string;
  otp: string;
  email: string;
  new_password: string;
}

export interface VerifyEmailDto {
  reference: string;
  otp: string;
  email: string;
}

export interface VerifyEmailData {
  user: User;
  tokens: AuthTokens;
  session_id: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface ResendVerificationData {
  reference: string;
}

export interface InviteUserDto {
  email: string;
  account_type: AccountType;
  roles: UserRole[];
}

export interface AcceptInviteDto {
  token: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export interface AcceptInviteData {
  user: User;
  tokens: AuthTokens;
  session_id: string;
}
