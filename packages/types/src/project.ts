import { Id } from "../../backend/convex/_generated/dataModel";
import { VerificationStatus } from "./marketplace";

export interface ProjectLocation {
  lat: number;
  long: number;
  name: string;
}

export interface ProjectCreator {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface ProjectImage {
  cloudinary_public_id: string;
  cloudinary_url: string;
  caption?: string;
  isPrimary: boolean;
  uploadDate: number;
}

export interface FeaturedImage {
  cloudinary_public_id: string;
  cloudinary_url: string;
}

export interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  creatorId: string;
  creator: ProjectCreator;
  title: string;
  description: string;
  projectType: ProjectType;
  location: ProjectLocation;
  areaSize: number;
  estimatedCO2Reduction: number;
  budget: number;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  status: ProjectStatus;
  verificationStatus: VerificationStatus;
  totalCarbonCredits: number;
  pricePerCredit: number;
  creditsAvailable: number;
  creditsSold: number;
  assignedVerifierId?: string;
  verificationStartedAt?: number;
  verificationCompletedAt?: number;
  qualityScore?: number;
  projectImages?: ProjectImage[];
  featuredImage?: FeaturedImage;
  requiredDocuments: string[];
  submittedDocuments: string[];
  isDocumentationComplete: boolean;
}

export type ProjectStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "active"
  | "completed"
  | "suspended";

export type ProjectType =
  | "reforestation"
  | "solar"
  | "wind"
  | "biogas"
  | "waste_management"
  | "mangrove_restoration";
