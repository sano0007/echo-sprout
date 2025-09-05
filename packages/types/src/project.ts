import { VerificationStatus } from "./marketplace";

export interface ProjectLocation {
  lat: number;
  long: number;
  name: string;
}

export interface Project {
  _id: string;
  creatorId: string;
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
