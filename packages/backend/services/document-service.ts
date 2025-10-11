import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Doc, Id } from '../convex/_generated/dataModel';

type DocumentType = Doc<'documents'>['documentType'];
type EntityType = Doc<'documents'>['entityType'];

export class DocumentService {
  // Upload a new document
  public static async uploadDocument(
    ctx: MutationCtx,
    data: {
      entityId: string;
      entityType: EntityType;
      fileName: string;
      originalName: string;
      fileType: string;
      fileSize: number;
      fileSizeFormatted: string;
      media: {
        storageId: string;
        fileUrl: string;
      };
      thumbnailUrl?: string;
      documentType: DocumentType;
      uploadedBy: Id<'users'>;
      isRequired?: boolean;
    }
  ) {
    const documentData = {
      entityId: data.entityId,
      entityType: data.entityType,
      fileName: data.fileName,
      originalName: data.originalName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      fileSizeFormatted: data.fileSizeFormatted,
      media: data.media,
      thumbnailUrl: data.thumbnailUrl,
      documentType: data.documentType,
      uploadedBy: data.uploadedBy,
      isRequired: data.isRequired || false,
      isVerified: false,
      _creationTime: Date.now(),
    };

    return await ctx.db.insert('documents', documentData);
  }

  // Get documents by entity
  public static async getDocumentsByEntity(
    ctx: QueryCtx,
    entityId: string,
    entityType: EntityType
  ) {
    return await ctx.db
      .query('documents')
      .withIndex('by_entity', (q) =>
        q.eq('entityId', entityId).eq('entityType', entityType)
      )
      .order('desc')
      .collect();
  }

  // Get documents by uploader
  public static async getDocumentsByUploader(
    ctx: QueryCtx,
    uploaderId: Id<'users'>
  ) {
    return await ctx.db
      .query('documents')
      .withIndex('by_uploader', (q) => q.eq('uploadedBy', uploaderId))
      .order('desc')
      .collect();
  }

  // Get documents by type
  public static async getDocumentsByType(
    ctx: QueryCtx,
    documentType: DocumentType
  ) {
    return await ctx.db
      .query('documents')
      .withIndex('by_type', (q) => q.eq('documentType', documentType))
      .order('desc')
      .collect();
  }

  // Get required documents for entity
  public static async getRequiredDocuments(
    ctx: QueryCtx,
    entityType: EntityType
  ) {
    return await ctx.db
      .query('documents')
      .withIndex('by_required', (q) =>
        q.eq('entityType', entityType).eq('isRequired', true)
      )
      .collect();
  }

  // Get verified documents
  public static async getVerifiedDocuments(ctx: QueryCtx, entityId?: string) {
    let query = ctx.db
      .query('documents')
      .withIndex('by_verification_status', (q) => q.eq('isVerified', true));

    if (entityId) {
      const results = await query.collect();
      return results.filter((doc) => doc.entityId === entityId);
    }

    return await query.collect();
  }

  // Verify document
  public static async verifyDocument(
    ctx: MutationCtx,
    documentId: Id<'documents'>,
    verifierId: Id<'users'>,
    isVerified: boolean = true
  ) {
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    return await ctx.db.patch(documentId, {
      isVerified,
      verifiedBy: isVerified ? verifierId : undefined,
      verifiedAt: isVerified ? Date.now() : undefined,
    });
  }

  // Delete document
  public static async deleteDocument(
    ctx: MutationCtx,
    documentId: Id<'documents'>,
    userId: Id<'users'>
  ) {
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check permissions - only uploader or admin can delete
    const user = await ctx.db.get(userId);
    if (document.uploadedBy !== userId && user?.role !== 'admin') {
      throw new Error('Unauthorized: You can only delete your own documents');
    }

    return await ctx.db.delete(documentId);
  }

  // Update document metadata
  public static async updateDocument(
    ctx: MutationCtx,
    documentId: Id<'documents'>,
    updates: {
      fileName?: string;
      originalName?: string;
      documentType?: DocumentType;
      isRequired?: boolean;
      thumbnailUrl?: string;
    },
    userId: Id<'users'>
  ) {
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check permissions - only uploader or admin can update
    const user = await ctx.db.get(userId);
    if (document.uploadedBy !== userId && user?.role !== 'admin') {
      throw new Error('Unauthorized: You can only update your own documents');
    }

    return await ctx.db.patch(documentId, updates);
  }

  // Get project verification documents (specific for verification process)
  public static async getProjectVerificationDocuments(
    ctx: QueryCtx,
    projectId: Id<'projects'>
  ) {
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_entity', (q) =>
        q.eq('entityId', projectId).eq('entityType', 'project')
      )
      .collect();

    // Categorize documents by type
    const categorizedDocs = {
      required: documents.filter((doc) => doc.isRequired),
      submitted: documents,
      verified: documents.filter((doc) => doc.isVerified),
      missing: [] as string[], // Will be populated with missing required document types
    };

    // Define required document types for project verification
    const requiredTypes: DocumentType[] = [
      'project_plan',
      'environmental_assessment',
      'technical_specs',
      'budget_breakdown',
      'timeline',
    ] as const;

    // Check for missing required documents
    const submittedTypes = documents.map((doc) => doc.documentType);
    categorizedDocs.missing = requiredTypes.filter(
      (type) => !submittedTypes.includes(type)
    );

    return categorizedDocs;
  }

  // Get document verification checklist for a project
  public static async getDocumentVerificationStatus(
    ctx: QueryCtx,
    projectId: Id<'projects'>
  ) {
    const documents = await this.getProjectVerificationDocuments(
      ctx,
      projectId
    );

    const requiredDocTypes = [
      { type: 'project_plan', name: 'Project Plan', required: true },
      {
        type: 'environmental_assessment',
        name: 'Environmental Assessment',
        required: true,
      },
      { type: 'permits', name: 'Permits & Licenses', required: false },
      {
        type: 'technical_specs',
        name: 'Technical Specifications',
        required: true,
      },
      { type: 'budget_breakdown', name: 'Budget Breakdown', required: true },
      { type: 'timeline', name: 'Project Timeline', required: true },
      { type: 'photos', name: 'Site Photos', required: false },
    ];

    const checklist = requiredDocTypes.map((docType) => {
      const submittedDoc = documents.submitted.find(
        (doc) => doc.documentType === docType.type
      );
      const isVerified = submittedDoc
        ? documents.verified.includes(submittedDoc)
        : false;

      return {
        documentType: docType.type,
        name: docType.name,
        required: docType.required,
        submitted: !!submittedDoc,
        verified: isVerified,
        document: submittedDoc || null,
      };
    });

    const stats = {
      totalRequired: requiredDocTypes.filter((dt) => dt.required).length,
      submitted: checklist.filter((item) => item.submitted && item.required)
        .length,
      verified: checklist.filter((item) => item.verified && item.required)
        .length,
      isComplete: checklist
        .filter((item) => item.required)
        .every((item) => item.submitted && item.verified),
    };

    return {
      checklist,
      stats,
    };
  }

  // Search documents
  public static async searchDocuments(
    ctx: QueryCtx,
    searchTerm: string,
    filters?: {
      entityType?: EntityType;
      documentType?: string;
      uploadedBy?: Id<'users'>;
      isVerified?: boolean;
    }
  ) {
    let documents = await ctx.db.query('documents').collect();

    // Apply text search
    const searchTermLower = searchTerm.toLowerCase();
    documents = documents.filter(
      (doc) =>
        doc.fileName.toLowerCase().includes(searchTermLower) ||
        doc.originalName.toLowerCase().includes(searchTermLower) ||
        doc.documentType.toLowerCase().includes(searchTermLower)
    );

    // Apply filters
    if (filters) {
      if (filters.entityType) {
        documents = documents.filter(
          (doc) => doc.entityType === filters.entityType
        );
      }
      if (filters.documentType) {
        documents = documents.filter(
          (doc) => doc.documentType === filters.documentType
        );
      }
      if (filters.uploadedBy) {
        documents = documents.filter(
          (doc) => doc.uploadedBy === filters.uploadedBy
        );
      }
      if (filters.isVerified !== undefined) {
        documents = documents.filter(
          (doc) => doc.isVerified === filters.isVerified
        );
      }
    }

    return documents.sort(
      (a, b) => (b._creationTime || 0) - (a._creationTime || 0)
    );
  }

  // Get document statistics
  public static async getDocumentStats(
    ctx: QueryCtx,
    entityId?: string,
    entityType?: EntityType
  ) {
    let documents = await ctx.db.query('documents').collect();

    if (entityId && entityType) {
      documents = documents.filter(
        (doc) => doc.entityId === entityId && doc.entityType === entityType
      );
    }

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      total: documents.length,
      verified: documents.filter((doc) => doc.isVerified).length,
      unverified: documents.filter((doc) => !doc.isVerified).length,
      required: documents.filter((doc) => doc.isRequired).length,
      uploadedThisMonth: documents.filter(
        (doc) => (doc._creationTime || 0) >= thirtyDaysAgo
      ).length,
      byType: documents.reduce(
        (acc, doc) => {
          acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
    };
  }
}
