export type UserRole =
  | "project_creator"
  | "credit_buyer"
  | "verifier"
  | "admin";

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationName?: string;
  organizationType?: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  isVerified: boolean;
  profileImage?: string;
  clerkId: string;
  verifierSpecialty?: string[];
  isActive: boolean;
  lastLoginAt?: string;
}
