/**
 * CLOUDINARY SERVICE
 *
 * Provides utilities for handling Cloudinary file uploads and management
 * for the monitoring system progress updates.
 */

export interface CloudinaryMedia {
  cloudinary_public_id: string;
  cloudinary_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface PhotoUploadOptions {
  folder?: string;
  tags?: string[];
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
  transformation?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * CloudinaryService class for handling file operations
 */
export class CloudinaryService {
  private static readonly DEFAULT_MAX_FILE_SIZE = 10; // 10MB
  private static readonly ALLOWED_FORMATS = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
  ];
  private static readonly PROGRESS_UPDATE_FOLDER = 'progress-updates';

  /**
   * Validate photo upload data
   */
  static validatePhotoUpload(
    photos: CloudinaryMedia[],
    projectType: string,
    options?: PhotoUploadOptions
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!photos || !Array.isArray(photos)) {
      errors.push('Photos must be provided as an array');
      return { isValid: false, errors, warnings };
    }

    if (photos.length === 0) {
      warnings.push(
        'No photos provided - visual evidence is highly recommended'
      );
      return { isValid: true, errors, warnings };
    }

    const maxFileSize = options?.maxFileSize || this.DEFAULT_MAX_FILE_SIZE;
    const allowedFormats = options?.allowedFormats || this.ALLOWED_FORMATS;

    // Validate each photo
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const photoIndex = i + 1;

      if (!photo.cloudinary_public_id) {
        errors.push(`Photo ${photoIndex}: Missing cloudinary_public_id`);
      }

      if (!photo.cloudinary_url) {
        errors.push(`Photo ${photoIndex}: Missing cloudinary_url`);
      }

      // Validate file size if provided
      if (photo.bytes && photo.bytes > maxFileSize * 1024 * 1024) {
        warnings.push(
          `Photo ${photoIndex}: File size (${Math.round(photo.bytes / 1024 / 1024)}MB) exceeds recommended size of ${maxFileSize}MB`
        );
      }

      // Validate format if provided
      if (
        photo.format &&
        !allowedFormats.includes(photo.format.toLowerCase())
      ) {
        warnings.push(
          `Photo ${photoIndex}: Format '${photo.format}' is not in recommended formats: ${allowedFormats.join(', ')}`
        );
      }

      // Validate URL format
      if (
        photo.cloudinary_url &&
        !photo.cloudinary_url.includes('cloudinary.com')
      ) {
        errors.push(`Photo ${photoIndex}: Invalid Cloudinary URL format`);
      }
    }

    // Project-specific photo requirements
    const projectRequirements = this.getProjectPhotoRequirements(projectType);

    if (photos.length < projectRequirements.minimumCount) {
      warnings.push(
        `Only ${photos.length} photos provided. ${projectRequirements.minimumCount} photos recommended for ${projectType} projects`
      );
    }

    if (photos.length > 20) {
      warnings.push(
        'More than 20 photos provided. Consider selecting the most relevant images to improve load times'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get project-specific photo requirements
   */
  static getProjectPhotoRequirements(projectType: string) {
    const requirements = {
      reforestation: {
        minimumCount: 5,
        recommendedTypes: ['before', 'during', 'after', 'close-up', 'overview'],
        description:
          'Include before/during/after shots, close-ups of planted trees, and overview of the area',
      },
      solar: {
        minimumCount: 4,
        recommendedTypes: ['installation', 'panels', 'inverter', 'monitoring'],
        description:
          'Show installation progress, panel arrays, inverter systems, and monitoring equipment',
      },
      wind: {
        minimumCount: 4,
        recommendedTypes: [
          'turbines',
          'foundation',
          'grid_connection',
          'control_room',
        ],
        description:
          'Document turbine installation, foundations, grid connections, and control systems',
      },
      biogas: {
        minimumCount: 4,
        recommendedTypes: [
          'digester',
          'gas_collection',
          'waste_input',
          'output_system',
        ],
        description:
          'Show digester construction, gas collection system, waste input, and output infrastructure',
      },
      waste_management: {
        minimumCount: 5,
        recommendedTypes: [
          'facility',
          'sorting',
          'processing',
          'recycled_output',
          'equipment',
        ],
        description:
          'Document facility setup, sorting processes, processing equipment, output, and machinery',
      },
      mangrove_restoration: {
        minimumCount: 6,
        recommendedTypes: [
          'site_before',
          'planting',
          'seedlings',
          'established_growth',
          'ecosystem',
          'aerial_view',
        ],
        description:
          'Include site before restoration, planting activities, seedling growth, ecosystem development, and aerial views',
      },
    };

    return (
      requirements[projectType as keyof typeof requirements] || {
        minimumCount: 3,
        recommendedTypes: ['before', 'during', 'after'],
        description:
          'Include before, during, and after photos of project activities',
      }
    );
  }

  /**
   * Generate Cloudinary transformation URL for thumbnails
   */
  static generateThumbnailUrl(
    cloudinaryUrl: string,
    width: number = 400,
    height: number = 300,
    quality: string = 'auto'
  ): string {
    if (!cloudinaryUrl.includes('cloudinary.com')) {
      return cloudinaryUrl;
    }

    // Extract the public ID and format from the URL
    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1) {
      return cloudinaryUrl;
    }

    // Insert transformation parameters
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      'c_fill',
      `q_${quality}`,
      'f_auto',
    ].join(',');

    urlParts.splice(uploadIndex + 1, 0, transformations);

    return urlParts.join('/');
  }

  /**
   * Generate optimized URL for different use cases
   */
  static generateOptimizedUrl(
    cloudinaryUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
      crop?: string;
    } = {}
  ): string {
    if (!cloudinaryUrl.includes('cloudinary.com')) {
      return cloudinaryUrl;
    }

    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
    } = options;

    const transformations = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);

    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);

    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1) {
      return cloudinaryUrl;
    }

    urlParts.splice(uploadIndex + 1, 0, transformations.join(','));

    return urlParts.join('/');
  }

  /**
   * Validate and prepare photo data for database storage
   */
  static preparePhotosForStorage(
    photos: CloudinaryMedia[],
    projectType: string
  ): {
    photos: CloudinaryMedia[];
    validation: ValidationResult;
    thumbnails: string[];
  } {
    const validation = this.validatePhotoUpload(photos, projectType);

    // Generate thumbnails for valid photos
    const thumbnails = photos
      .filter((photo) => photo.cloudinary_url)
      .map((photo) => this.generateThumbnailUrl(photo.cloudinary_url));

    // Prepare photos with additional metadata
    const preparedPhotos = photos.map((photo) => ({
      ...photo,
      uploadedAt: Date.now(),
      projectType,
    }));

    return {
      photos: preparedPhotos,
      validation,
      thumbnails,
    };
  }

  /**
   * Get upload configuration for frontend
   */
  static getUploadConfig(projectType: string, updateType: string) {
    const requirements = this.getProjectPhotoRequirements(projectType);

    return {
      folder: `${this.PROGRESS_UPDATE_FOLDER}/${projectType}/${updateType}`,
      maxFiles: 20,
      maxFileSize: this.DEFAULT_MAX_FILE_SIZE,
      allowedFormats: this.ALLOWED_FORMATS,
      requirements: requirements,
      tags: [projectType, updateType, 'progress-update'],
      transformations: {
        thumbnail: 'w_400,h_300,c_fill,q_auto,f_auto',
        medium: 'w_800,h_600,c_fill,q_auto,f_auto',
        large: 'w_1200,h_900,c_fill,q_auto,f_auto',
      },
    };
  }

  /**
   * Extract metadata from Cloudinary URL
   */
  static extractMetadata(cloudinaryUrl: string): {
    publicId: string;
    format?: string;
    version?: string;
  } {
    if (!cloudinaryUrl.includes('cloudinary.com')) {
      return { publicId: '' };
    }

    try {
      const url = new URL(cloudinaryUrl);
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.findIndex((part) => part === 'upload');

      if (uploadIndex === -1) {
        return { publicId: '' };
      }

      // Get the part after upload (and any transformations)
      const afterUpload = pathParts.slice(uploadIndex + 1);

      // Find the actual file part (last part without transformations)
      let fileWithExtension = afterUpload[afterUpload.length - 1];

      // Handle versioned URLs
      let version: string | undefined;
      if (
        fileWithExtension.startsWith('v') &&
        /^v\d+$/.test(afterUpload[afterUpload.length - 2])
      ) {
        version = afterUpload[afterUpload.length - 2];
        fileWithExtension = afterUpload[afterUpload.length - 1];
      }

      // Extract format
      const lastDotIndex = fileWithExtension.lastIndexOf('.');
      const format =
        lastDotIndex > 0
          ? fileWithExtension.substring(lastDotIndex + 1)
          : undefined;
      const publicId =
        lastDotIndex > 0
          ? fileWithExtension.substring(0, lastDotIndex)
          : fileWithExtension;

      return {
        publicId,
        format,
        version,
      };
    } catch (error) {
      return { publicId: '' };
    }
  }

  /**
   * Validate that photos are actually uploaded and accessible
   */
  static async validatePhotoAccessibility(
    photos: CloudinaryMedia[]
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // In a real implementation, this would make HTTP requests to verify the images exist
    // For now, we'll do basic URL validation
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const photoIndex = i + 1;

      if (!photo.cloudinary_url) {
        errors.push(`Photo ${photoIndex}: Missing URL`);
        continue;
      }

      try {
        new URL(photo.cloudinary_url);

        if (!photo.cloudinary_url.includes('res.cloudinary.com')) {
          warnings.push(
            `Photo ${photoIndex}: URL doesn't appear to be from Cloudinary`
          );
        }
      } catch (error) {
        errors.push(`Photo ${photoIndex}: Invalid URL format`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
