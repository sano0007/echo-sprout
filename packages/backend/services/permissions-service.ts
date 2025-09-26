import type { QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

export interface User {
  _id: Id<'users'>;
  role: 'project_creator' | 'credit_buyer' | 'verifier' | 'admin';
  isActive: boolean;
  verifierSpecialty?: string[];
}

export class PermissionsService {
  // Check if user has admin access
  public static hasAdminAccess(user: User): boolean {
    return user.role === 'admin' && user.isActive;
  }

  // Check if user is a verifier
  public static isVerifier(user: User): boolean {
    return user.role === 'verifier' && user.isActive;
  }

  // Check if user is a project creator
  public static isProjectCreator(user: User): boolean {
    return user.role === 'project_creator' && user.isActive;
  }

  // Check if user can create verifications
  public static canCreateVerification(user: User): boolean {
    return this.hasAdminAccess(user);
  }

  // Check if user can view verification details
  public static async canViewVerification(
    ctx: QueryCtx,
    user: User,
    verificationId: Id<'verifications'>
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      return false;
    }

    // Verifier can view their own verifications
    if (this.isVerifier(user) && verification.verifierId === user._id) {
      return true;
    }

    // Project creator can view verifications for their projects
    if (this.isProjectCreator(user)) {
      const project = await ctx.db.get(verification.projectId);
      return project?.creatorId === user._id;
    }

    return false;
  }

  // Check if user can modify verification
  public static async canModifyVerification(
    ctx: QueryCtx,
    user: User,
    verificationId: Id<'verifications'>
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      return false;
    }

    // Only assigned verifier can modify verification
    return this.isVerifier(user) && verification.verifierId === user._id;
  }

  // Check if user can view project details
  public static async canViewProject(
    ctx: QueryCtx,
    user: User,
    projectId: Id<'projects'>
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      return false;
    }

    // Project creator can view their own projects
    if (project.creatorId === user._id) {
      return true;
    }

    // Assigned verifier can view project
    if (this.isVerifier(user) && project.assignedVerifierId === user._id) {
      return true;
    }

    return false;
  }

  // Check if user can modify project
  public static async canModifyProject(
    ctx: QueryCtx,
    user: User,
    projectId: Id<'projects'>
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      return false;
    }

    // Only project creator can modify project (unless it's under verification)
    return (
      project.creatorId === user._id &&
      project.verificationStatus !== 'in_progress'
    );
  }

  // Check if user can send verification messages
  public static async canSendVerificationMessage(
    ctx: QueryCtx,
    user: User,
    verificationId: Id<'verifications'>,
    recipientId: Id<'users'>
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      return false;
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) {
      return false;
    }

    // Verifier can send messages for their assigned verifications
    if (this.isVerifier(user) && verification.verifierId === user._id) {
      return true;
    }

    // Project creator can send messages for their projects
    if (this.isProjectCreator(user) && project.creatorId === user._id) {
      return true;
    }

    return false;
  }

  // Check if user can view verification messages
  public static async canViewVerificationMessages(
    ctx: QueryCtx,
    user: User,
    verificationId: Id<'verifications'>
  ): Promise<boolean> {
    return this.canViewVerification(ctx, user, verificationId);
  }

  // Check if user can upload documents
  public static async canUploadDocument(
    ctx: QueryCtx,
    user: User,
    entityId: string,
    entityType:
      | 'project'
      | 'verification'
      | 'user_profile'
      | 'educational_content'
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    switch (entityType) {
      case 'project':
        const project = await ctx.db.get(entityId as Id<'projects'>);
        if (!project) return false;

        // Project creator can upload to their projects
        if (project.creatorId === user._id) return true;

        // Assigned verifier can upload verification documents
        if (this.isVerifier(user) && project.assignedVerifierId === user._id)
          return true;

        return false;

      case 'user_profile':
        // Users can only upload to their own profile
        return entityId === user._id;

      case 'verification':
        // Only verifiers can upload verification documents
        return this.isVerifier(user);

      case 'educational_content':
        // Only admins and verified users can upload educational content
        return (
          this.hasAdminAccess(user) ||
          (user.isActive && user.role !== 'credit_buyer')
        );

      default:
        return false;
    }
  }

  // Check if user can verify documents
  public static canVerifyDocument(user: User): boolean {
    return this.isVerifier(user);
  }

  // Check if user can delete documents
  public static async canDeleteDocument(
    ctx: QueryCtx,
    user: User,
    documentId: Id<'documents'>
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    const document = await ctx.db.get(documentId);
    if (!document) {
      return false;
    }

    // Users can delete their own documents
    return document.uploadedBy === user._id;
  }

  // Check if user can assign verifiers to projects
  public static canAssignVerifier(user: User): boolean {
    return this.hasAdminAccess(user);
  }

  // Check if user can view admin dashboard
  public static canViewAdminDashboard(user: User): boolean {
    return this.hasAdminAccess(user);
  }

  // Check if user can view verifier dashboard
  public static canViewVerifierDashboard(user: User): boolean {
    return this.isVerifier(user) || this.hasAdminAccess(user);
  }

  // Check if user can approve/reject projects
  public static async canApproveRejectProject(
    ctx: QueryCtx,
    user: User,
    projectId: Id<'projects'>
  ): Promise<boolean> {
    if (this.hasAdminAccess(user)) {
      return true;
    }

    if (!this.isVerifier(user)) {
      return false;
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      return false;
    }

    // Only assigned verifier can approve/reject
    return project.assignedVerifierId === user._id;
  }

  // Check if user can view analytics/statistics
  public static canViewAnalytics(user: User, scope: 'own' | 'all'): boolean {
    if (scope === 'own') {
      return user.isActive; // All active users can view their own stats
    }

    // Only admins can view all analytics
    return this.hasAdminAccess(user);
  }

  // Check if user can manage other users
  public static canManageUsers(user: User): boolean {
    return this.hasAdminAccess(user);
  }

  // Check if verifier has required specialty for project
  public static hasRequiredSpecialty(user: User, projectType: string): boolean {
    if (!this.isVerifier(user) || !user.verifierSpecialty) {
      return false;
    }

    // Map project types to required specialties
    const specialtyMap: Record<string, string[]> = {
      reforestation: ['reforestation', 'environmental'],
      solar: ['solar', 'renewable_energy'],
      wind: ['wind', 'renewable_energy'],
      biogas: ['biogas', 'waste_management'],
      waste_management: ['waste_management', 'environmental'],
      mangrove_restoration: ['mangrove_restoration', 'environmental'],
    };

    const requiredSpecialties = specialtyMap[projectType] || [projectType];

    return requiredSpecialties.some((specialty) =>
      user.verifierSpecialty!.includes(specialty)
    );
  }

  // Check if user can create audit logs
  public static canCreateAuditLog(user: User): boolean {
    return this.hasAdminAccess(user) || this.isVerifier(user);
  }

  // Check if user can view audit logs
  public static canViewAuditLogs(user: User): boolean {
    return this.hasAdminAccess(user);
  }

  // Check if user can send notifications
  public static canSendNotifications(user: User): boolean {
    return this.hasAdminAccess(user);
  }

  // Get user permissions summary
  public static async getUserPermissions(
    ctx: QueryCtx,
    user: User
  ): Promise<{
    canCreateVerification: boolean;
    canViewAdminDashboard: boolean;
    canViewVerifierDashboard: boolean;
    canAssignVerifier: boolean;
    canVerifyDocuments: boolean;
    canViewAllAnalytics: boolean;
    canManageUsers: boolean;
    isAdmin: boolean;
    isVerifier: boolean;
    isProjectCreator: boolean;
    specialties: string[];
  }> {
    return {
      canCreateVerification: this.canCreateVerification(user),
      canViewAdminDashboard: this.canViewAdminDashboard(user),
      canViewVerifierDashboard: this.canViewVerifierDashboard(user),
      canAssignVerifier: this.canAssignVerifier(user),
      canVerifyDocuments: this.canVerifyDocument(user),
      canViewAllAnalytics: this.canViewAnalytics(user, 'all'),
      canManageUsers: this.canManageUsers(user),
      isAdmin: this.hasAdminAccess(user),
      isVerifier: this.isVerifier(user),
      isProjectCreator: this.isProjectCreator(user),
      specialties: user.verifierSpecialty || [],
    };
  }

  // Validate and throw error if user doesn't have permission
  public static validatePermission(
    hasPermission: boolean,
    message: string
  ): void {
    if (!hasPermission) {
      throw new Error(`Unauthorized: ${message}`);
    }
  }

  // Wrapper for common permission checks with automatic error throwing
  public static async validateVerificationAccess(
    ctx: QueryCtx,
    user: User,
    verificationId: Id<'verifications'>,
    action: 'view' | 'modify'
  ): Promise<void> {
    const canAccess =
      action === 'view'
        ? await this.canViewVerification(ctx, user, verificationId)
        : await this.canModifyVerification(ctx, user, verificationId);

    this.validatePermission(
      canAccess,
      `You cannot ${action} this verification`
    );
  }

  public static async validateProjectAccess(
    ctx: QueryCtx,
    user: User,
    projectId: Id<'projects'>,
    action: 'view' | 'modify'
  ): Promise<void> {
    const canAccess =
      action === 'view'
        ? await this.canViewProject(ctx, user, projectId)
        : await this.canModifyProject(ctx, user, projectId);

    this.validatePermission(canAccess, `You cannot ${action} this project`);
  }

  public static validateAdminAccess(user: User): void {
    this.validatePermission(this.hasAdminAccess(user), 'Admin access required');
  }

  public static validateVerifierAccess(user: User): void {
    this.validatePermission(this.isVerifier(user), 'Verifier access required');
  }
}
