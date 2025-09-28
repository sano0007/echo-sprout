import { z } from 'zod';

const organizationTypes = [
  'Corporation',
  'Non-Profit',
  'Government Agency',
  'Educational Institution',
  'Individual',
  'Startup',
  'Other',
] as const;

const userRoles = [
  'project_creator',
  'credit_buyer',
  'verifier',
  'admin',
] as const;

export const userDetailsSchema = z.object({
  // Personal Information - Required
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    ),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    ),

  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(254, 'Email must be less than 254 characters')
    .toLowerCase(),

  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[+]?[\s\d\-()]+$/, 'Please enter a valid phone number'),

  // Address Information - Required
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),

  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'City can only contain letters, spaces, hyphens, and apostrophes'
    ),

  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Country can only contain letters, spaces, hyphens, and apostrophes'
    ),

  // Organization Information - Optional
  organizationName: z
    .string()
    .max(200, 'Organization name must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  organizationType: z
    .enum(organizationTypes)
    .optional()
    .or(z.literal(''))
    .or(z.string()),

  // Role Information
  role: z.enum(userRoles).default('credit_buyer'),

  // Profile Information - Optional
  profileImage: z
    .string()
    .url('Profile image must be a valid URL')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('Website must be a valid URL')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),

  // Backward compatibility
  location: z.string().optional().or(z.literal('')),
});

// Schema for user profile updates (excludes email field)
export const userProfileUpdateSchema = userDetailsSchema
  .omit({ email: true })
  .extend({
    // Allow email to be present but ignore changes
    email: z.string().optional(),
  });

// Schema for registration (includes all fields)
export const userRegistrationSchema = userDetailsSchema;

// Schema for step-by-step validation
export const registrationStep1Schema = z.object({
  firstName: userDetailsSchema.shape.firstName,
  lastName: userDetailsSchema.shape.lastName,
  email: userDetailsSchema.shape.email,
  phoneNumber: userDetailsSchema.shape.phoneNumber,
  address: userDetailsSchema.shape.address,
  city: userDetailsSchema.shape.city,
  country: userDetailsSchema.shape.country,
});

export const registrationStep2Schema = z.object({
  // Document upload validation can be added here
  documentsUploaded: z.boolean().optional(),
});

export const registrationStep3Schema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Type exports
export type UserDetailsFormData = z.infer<typeof userDetailsSchema>;
export type UserProfileUpdateData = z.infer<typeof userProfileUpdateSchema>;
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type RegistrationStep1Data = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep2Data = z.infer<typeof registrationStep2Schema>;
export type RegistrationStep3Data = z.infer<typeof registrationStep3Schema>;

// Validation helper functions
export const validateUserDetails = (data: unknown) => {
  return userDetailsSchema.safeParse(data);
};

export const validateUserProfileUpdate = (data: unknown) => {
  return userProfileUpdateSchema.safeParse(data);
};

export const validateRegistrationStep1 = (data: unknown) => {
  return registrationStep1Schema.safeParse(data);
};

export const validateRegistrationStep2 = (data: unknown) => {
  return registrationStep2Schema.safeParse(data);
};

export const validateRegistrationStep3 = (data: unknown) => {
  return registrationStep3Schema.safeParse(data);
};
