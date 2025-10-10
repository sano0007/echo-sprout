/**
 * COMPREHENSIVE FORM VALIDATION UTILITIES
 * For Monitoring and Tracking System
 *
 * This module provides robust frontend validation for all forms
 * in the monitoring system with TypeScript support.
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

// ============= VALIDATION FUNCTIONS =============

/**
 * Validates a single field against multiple rules
 */
export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value) continue;

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `Minimum length is ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `Maximum length is ${rule.maxLength} characters`;
      }
    }

    // Numeric validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return rule.message || `Minimum value is ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return rule.message || `Maximum value is ${rule.max}`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return rule.message || 'Invalid value';
    }
  }

  return null;
}

/**
 * Validates an entire form object
 */
export function validateForm(data: Record<string, any>, schema: FieldValidation): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];
    const error = validateField(value, rules);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

// ============= MONITORING SYSTEM SPECIFIC VALIDATIONS =============

/**
 * Progress Update Form Validation Schema
 */
export const progressUpdateSchema: FieldValidation = {
  title: [
    { required: true, message: 'Progress update title is required' },
    { minLength: 5, message: 'Title must be at least 5 characters' },
    { maxLength: 100, message: 'Title cannot exceed 100 characters' },
  ],
  description: [
    { required: true, message: 'Description is required' },
    { minLength: 20, message: 'Description must be at least 20 characters' },
    { maxLength: 1000, message: 'Description cannot exceed 1000 characters' },
  ],
  progressPercentage: [
    { required: true, message: 'Progress percentage is required' },
    { min: 0, message: 'Progress cannot be negative' },
    { max: 100, message: 'Progress cannot exceed 100%' },
  ],
  updateType: [
    { required: true, message: 'Update type is required' },
    {
      custom: (value) => ['milestone', 'measurement', 'photo', 'issue', 'completion'].includes(value),
      message: 'Invalid update type'
    },
  ],
  nextSteps: [
    { maxLength: 500, message: 'Next steps cannot exceed 500 characters' },
  ],
  challenges: [
    { maxLength: 500, message: 'Challenges cannot exceed 500 characters' },
  ],
};

/**
 * Alert Creation Form Validation Schema
 */
export const alertCreationSchema: FieldValidation = {
  alertType: [
    { required: true, message: 'Alert type is required' },
  ],
  severity: [
    { required: true, message: 'Severity level is required' },
    {
      custom: (value) => ['low', 'medium', 'high', 'critical'].includes(value),
      message: 'Invalid severity level'
    },
  ],
  message: [
    { required: true, message: 'Alert message is required' },
    { minLength: 10, message: 'Message must be at least 10 characters' },
    { maxLength: 200, message: 'Message cannot exceed 200 characters' },
  ],
  description: [
    { maxLength: 1000, message: 'Description cannot exceed 1000 characters' },
  ],
};

/**
 * PDF Report Generation Form Validation Schema
 */
export const pdfReportSchema: FieldValidation = {
  title: [
    { required: true, message: 'Report title is required' },
    { minLength: 3, message: 'Title must be at least 3 characters' },
    { maxLength: 100, message: 'Title cannot exceed 100 characters' },
  ],
  templateType: [
    { required: true, message: 'Template type is required' },
    {
      custom: (value) => ['analytics', 'monitoring'].includes(value),
      message: 'Invalid template type'
    },
  ],
  reportType: [
    { required: true, message: 'Report type is required' },
  ],
  startDate: [
    { required: true, message: 'Start date is required' },
    {
      custom: (value) => new Date(value) <= new Date(),
      message: 'Start date cannot be in the future'
    },
  ],
  endDate: [
    { required: true, message: 'End date is required' },
  ],
};

/**
 * Project Creation Form Validation Schema
 */
export const projectCreationSchema: FieldValidation = {
  title: [
    { required: true, message: 'Project title is required' },
    { minLength: 5, message: 'Title must be at least 5 characters' },
    { maxLength: 100, message: 'Title cannot exceed 100 characters' },
  ],
  description: [
    { required: true, message: 'Project description is required' },
    { minLength: 50, message: 'Description must be at least 50 characters' },
    { maxLength: 2000, message: 'Description cannot exceed 2000 characters' },
  ],
  projectType: [
    { required: true, message: 'Project type is required' },
    {
      custom: (value) => ['reforestation', 'solar', 'wind', 'biogas', 'waste_management', 'mangrove_restoration'].includes(value),
      message: 'Invalid project type'
    },
  ],
  budget: [
    { required: true, message: 'Budget is required' },
    { min: 1000, message: 'Minimum budget is $1,000' },
    { max: 10000000, message: 'Maximum budget is $10,000,000' },
  ],
  areaSize: [
    { required: true, message: 'Area size is required' },
    { min: 0.1, message: 'Minimum area is 0.1 hectares' },
    { max: 100000, message: 'Maximum area is 100,000 hectares' },
  ],
  estimatedCO2Reduction: [
    { required: true, message: 'Estimated CO2 reduction is required' },
    { min: 1, message: 'Minimum CO2 reduction is 1 ton' },
  ],
  totalCarbonCredits: [
    { required: true, message: 'Total carbon credits is required' },
    { min: 1, message: 'Minimum carbon credits is 1' },
  ],
  pricePerCredit: [
    { required: true, message: 'Price per credit is required' },
    { min: 1, message: 'Minimum price per credit is $1' },
    { max: 1000, message: 'Maximum price per credit is $1,000' },
  ],
};

// ============= UTILITY FUNCTIONS =============

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Date range validation
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate;
}

/**
 * File size validation (in bytes)
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * File type validation
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Currency validation
 */
export function isValidCurrency(value: number): boolean {
  return value >= 0 && Number.isFinite(value) && value <= 999999999.99;
}

/**
 * Percentage validation
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

// ============= REAL-TIME VALIDATION HOOKS =============

/**
 * Debounced validation for real-time feedback
 */
export function debounceValidation(
  callback: () => void,
  delay: number = 300
): () => void {
  let timeoutId: NodeJS.Timeout;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}

/**
 * Form validation state manager
 */
export class FormValidator {
  private schema: FieldValidation;
  private data: Record<string, any> = {};
  private errors: Record<string, string> = {};
  private touched: Record<string, boolean> = {};

  constructor(schema: FieldValidation) {
    this.schema = schema;
  }

  setFieldValue(fieldName: string, value: any): void {
    this.data[fieldName] = value;
    this.validateField(fieldName);
  }

  setFieldTouched(fieldName: string): void {
    this.touched[fieldName] = true;
  }

  validateField(fieldName: string): void {
    const rules = this.schema[fieldName];
    if (rules) {
      const error = validateField(this.data[fieldName], rules);
      if (error) {
        this.errors[fieldName] = error;
      } else {
        delete this.errors[fieldName];
      }
    }
  }

  validateAll(): ValidationResult {
    return validateForm(this.data, this.schema);
  }

  getFieldError(fieldName: string): string | undefined {
    return this.touched[fieldName] ? this.errors[fieldName] : undefined;
  }

  isFieldValid(fieldName: string): boolean {
    return !this.errors[fieldName];
  }

  isFormValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  resetForm(): void {
    this.data = {};
    this.errors = {};
    this.touched = {};
  }
}

export default {
  validateField,
  validateForm,
  progressUpdateSchema,
  alertCreationSchema,
  pdfReportSchema,
  projectCreationSchema,
  FormValidator,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidDateRange,
  isValidFileSize,
  isValidFileType,
  isValidCurrency,
  isValidPercentage,
  debounceValidation,
};