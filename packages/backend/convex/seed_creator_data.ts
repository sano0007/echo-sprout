import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * PROJECT CREATOR SPECIFIC DATA SEEDING SCRIPT
 *
 * This script creates realistic sample data specifically for a project creator account:
 * - Projects owned by the specified creator
 * - Progress updates and milestones for those projects
 * - System alerts and notifications for the creator
 * - Transactions from buyers purchasing credits
 * - Verification workflows and communications
 *
 * Created for userId: j575k7hvdfr79ep5qjz6a3z3xh7rfwkr (project_creator role)
 */

export const seedCreatorSpecificData = mutation({
  args: {
    creatorUserId: v.string(), // The Convex user ID to create data for
    clearExisting: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    console.log(`🌱 Starting creator-specific data seeding for user: ${args.creatorUserId}`);

    // Verify the user exists and is a project creator
    const creator = await ctx.db.get(args.creatorUserId as any);
    if (!creator) {
      throw new Error(`User not found: ${args.creatorUserId}`);
    }
    if (creator.role !== 'project_creator') {
      throw new Error(`User is not a project creator. Current role: ${creator.role}`);
    }

    if (args.clearExisting) {
      console.log('🧹 Clearing existing creator data...');
      await clearCreatorData(ctx, args.creatorUserId);
    }

    // Step 1: Create sample buyers and verifiers if they don't exist
    const { buyers, verifiers } = await createSupportingUsers(ctx);
    console.log(`✅ Ensured ${buyers.length} buyers and ${verifiers.length} verifiers exist`);

    // Step 2: Create projects for this creator
    const projects = await createCreatorProjects(ctx, args.creatorUserId, verifiers);
    console.log(`✅ Created ${projects.length} projects for creator`);

    // Step 3: Create project milestones
    const milestones = await createProjectMilestones(ctx, projects);
    console.log(`✅ Created ${milestones.length} milestones`);

    // Step 4: Create progress updates
    const progressUpdates = await createProgressUpdates(ctx, projects, args.creatorUserId);
    console.log(`✅ Created ${progressUpdates.length} progress updates`);

    // Step 5: Create system alerts for creator's projects
    const alerts = await createCreatorAlerts(ctx, projects, args.creatorUserId);
    console.log(`✅ Created ${alerts.length} system alerts`);

    // Step 6: Create transactions (buyers purchasing credits)
    const transactions = await createCreatorTransactions(ctx, projects, buyers);
    console.log(`✅ Created ${transactions.length} credit transactions`);

    // Step 7: Create notifications for the creator
    const notifications = await createCreatorNotifications(ctx, args.creatorUserId, projects);
    console.log(`✅ Created ${notifications.length} notifications`);

    // Step 8: Create audit logs
    await createCreatorAuditLogs(ctx, args.creatorUserId, projects);
    console.log('✅ Created audit logs');

    console.log('🎉 Creator-specific data seeding completed successfully!');

    return {
      success: true,
      creatorId: args.creatorUserId,
      creatorName: `${creator.firstName} ${creator.lastName}`,
      stats: {
        projects: projects.length,
        milestones: milestones.length,
        progressUpdates: progressUpdates.length,
        alerts: alerts.length,
        transactions: transactions.length,
        notifications: notifications.length
      }
    };
  },
});

// Clear existing data for this creator
async function clearCreatorData(ctx: any, creatorUserId: string) {
  // Get all projects for this creator
  const projects = await ctx.db
    .query('projects')
    .withIndex('by_creator', (q: any) => q.eq('creatorId', creatorUserId))
    .collect();

  const projectIds = projects.map((p: any) => p._id);

  // Clear related data
  const tables = [
    { table: 'progressUpdates', index: 'by_reporter', field: 'reportedBy' },
    { table: 'systemAlerts', index: 'by_project', field: 'projectId', values: projectIds },
    { table: 'projectMilestones', index: 'by_project', field: 'projectId', values: projectIds },
    { table: 'transactions', index: 'by_project', field: 'projectId', values: projectIds },
    { table: 'notifications', index: 'by_recipient', field: 'recipientId' },
  ];

  for (const { table, index, field, values } of tables) {
    if (values) {
      // Delete by project IDs
      for (const value of values) {
        const docs = await ctx.db.query(table).withIndex(index, (q: any) => q.eq(field, value)).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      }
    } else {
      // Delete by creator ID
      const docs = await ctx.db.query(table).withIndex(index, (q: any) => q.eq(field, creatorUserId)).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  }

  // Delete projects last
  for (const project of projects) {
    await ctx.db.delete(project._id);
  }
}

// Create supporting users (buyers and verifiers) if they don't exist
async function createSupportingUsers(ctx: any) {
  const buyers = [];
  const verifiers = [];

  // Check if we already have buyers and verifiers
  const existingBuyers = await ctx.db
    .query('users')
    .withIndex('by_role', (q: any) => q.eq('role', 'credit_buyer'))
    .take(2);

  const existingVerifiers = await ctx.db
    .query('users')
    .withIndex('by_role', (q: any) => q.eq('role', 'verifier'))
    .take(2);

  // Create buyers if needed
  if (existingBuyers.length < 2) {
    const buyerTemplates = [
      {
        email: 'buyer.corp@example.com',
        firstName: 'Sarah',
        lastName: 'Chen',
        organizationName: 'EcoTech Corporation',
        organizationType: 'Technology',
        clerkId: 'clerk_buyer_seed_001',
      },
      {
        email: 'buyer.fund@example.com',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        organizationName: 'Green Investment Fund',
        organizationType: 'Financial Services',
        clerkId: 'clerk_buyer_seed_002',
      }
    ];

    for (const template of buyerTemplates) {
      const buyerId = await ctx.db.insert('users', {
        ...template,
        role: 'credit_buyer',
        phoneNumber: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
        address: '123 Business District',
        city: 'New York',
        country: 'United States',
        isVerified: true,
        isActive: true,
      });
      buyers.push(buyerId);
    }
  } else {
    buyers.push(...existingBuyers.map(b => b._id));
  }

  // Create verifiers if needed
  if (existingVerifiers.length < 2) {
    const verifierTemplates = [
      {
        email: 'verifier.forest@example.com',
        firstName: 'Dr. Elena',
        lastName: 'Kowalski',
        organizationName: 'Forest Verification Services',
        verifierSpecialty: ['reforestation', 'mangrove_restoration'],
        clerkId: 'clerk_verifier_seed_001',
      },
      {
        email: 'verifier.energy@example.com',
        firstName: 'James',
        lastName: 'Thompson',
        organizationName: 'Clean Energy Certification',
        verifierSpecialty: ['solar', 'wind', 'biogas'],
        clerkId: 'clerk_verifier_seed_002',
      }
    ];

    for (const template of verifierTemplates) {
      const verifierId = await ctx.db.insert('users', {
        ...template,
        role: 'verifier',
        phoneNumber: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
        address: '456 Verification Ave',
        city: 'Portland',
        country: 'United States',
        organizationType: 'Environmental Consulting',
        isVerified: true,
        isActive: true,
      });
      verifiers.push(verifierId);
    }
  } else {
    verifiers.push(...existingVerifiers.map(v => v._id));
  }

  return { buyers, verifiers };
}

// Create realistic projects for the creator
async function createCreatorProjects(ctx: any, creatorUserId: string, verifiers: string[]) {
  const projects = [];

  const projectTemplates = [
    {
      title: 'Community Solar Gardens - Phase 1',
      description: 'Development of distributed solar installations across rural communities, providing clean energy access and carbon credit generation.',
      projectType: 'solar',
      location: { lat: 40.7128, long: -74.0060, name: 'Rural New York State' },
      areaSize: 250,
      estimatedCO2Reduction: 35000,
      budget: 1800000,
      startDate: '2024-01-15',
      expectedCompletionDate: '2025-06-30',
      status: 'active',
      verificationStatus: 'in_progress',
      totalCarbonCredits: 35000,
      pricePerCredit: 28,
      creditsAvailable: 28000,
      creditsSold: 7000,
      progressPercentage: 45,
    },
    {
      title: 'Urban Reforestation Initiative',
      description: 'Large-scale tree planting and ecosystem restoration in degraded urban areas, focusing on native species and community engagement.',
      projectType: 'reforestation',
      location: { lat: 41.8781, long: -87.6298, name: 'Chicago Metropolitan Area' },
      areaSize: 5000,
      estimatedCO2Reduction: 25000,
      budget: 950000,
      startDate: '2024-03-01',
      expectedCompletionDate: '2026-12-31',
      status: 'active',
      verificationStatus: 'verified',
      totalCarbonCredits: 25000,
      pricePerCredit: 32,
      creditsAvailable: 15000,
      creditsSold: 10000,
      progressPercentage: 30,
    },
    {
      title: 'Agricultural Biogas Development',
      description: 'Converting agricultural waste from local farms into renewable biogas energy, reducing methane emissions and creating sustainable energy.',
      projectType: 'biogas',
      location: { lat: 39.7391, long: -104.9847, name: 'Colorado Agricultural Region' },
      areaSize: 150,
      estimatedCO2Reduction: 18000,
      budget: 750000,
      startDate: '2024-02-15',
      expectedCompletionDate: '2025-08-31',
      status: 'under_review',
      verificationStatus: 'pending',
      totalCarbonCredits: 18000,
      pricePerCredit: 30,
      creditsAvailable: 18000,
      creditsSold: 0,
      progressPercentage: 20,
    },
    {
      title: 'Coastal Mangrove Restoration',
      description: 'Restoration of mangrove ecosystems along degraded coastlines to provide storm protection and carbon sequestration.',
      projectType: 'mangrove_restoration',
      location: { lat: 25.7617, long: -80.1918, name: 'South Florida Coast' },
      areaSize: 800,
      estimatedCO2Reduction: 22000,
      budget: 600000,
      startDate: '2024-04-01',
      expectedCompletionDate: '2025-12-31',
      status: 'approved',
      verificationStatus: 'pending',
      totalCarbonCredits: 22000,
      pricePerCredit: 35,
      creditsAvailable: 22000,
      creditsSold: 0,
      progressPercentage: 10,
    },
    {
      title: 'Wind Energy Cooperative',
      description: 'Community-owned wind energy project providing renewable electricity to local grid and carbon credit generation.',
      projectType: 'wind',
      location: { lat: 44.9537, long: -93.0900, name: 'Minnesota Wind Corridor' },
      areaSize: 1200,
      estimatedCO2Reduction: 45000,
      budget: 3200000,
      startDate: '2024-06-01',
      expectedCompletionDate: '2026-03-31',
      status: 'submitted',
      verificationStatus: 'pending',
      totalCarbonCredits: 45000,
      pricePerCredit: 26,
      creditsAvailable: 45000,
      creditsSold: 0,
      progressPercentage: 5,
    }
  ];

  for (let i = 0; i < projectTemplates.length; i++) {
    const template = projectTemplates[i];
    const projectId = await ctx.db.insert('projects', {
      ...template,
      creatorId: creatorUserId,
      assignedVerifierId: verifiers[i % verifiers.length],
      verificationStartedAt: template.status === 'active' ? Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000) : undefined,
      lastProgressUpdate: template.status === 'active' ? Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      requiredDocuments: ['project_plan', 'environmental_assessment', 'permits', 'technical_specs'],
      submittedDocuments: template.status === 'active' ?
        ['project_plan', 'environmental_assessment', 'permits'] :
        ['project_plan', 'environmental_assessment'],
      isDocumentationComplete: template.status === 'active',
      qualityScore: template.verificationStatus === 'verified' ? 8.5 + Math.random() * 1.5 : undefined,
    });
    projects.push(projectId);
  }

  return projects;
}

// Create project milestones
async function createProjectMilestones(ctx: any, projects: string[]) {
  const milestones = [];
  const milestoneTypes = ['setup', 'progress_25', 'progress_50', 'progress_75', 'impact_first', 'verification', 'completion'];

  for (const projectId of projects) {
    const project = await ctx.db.get(projectId);
    const startDate = new Date(project.startDate).getTime();
    const endDate = new Date(project.expectedCompletionDate).getTime();
    const duration = endDate - startDate;

    for (let i = 0; i < milestoneTypes.length; i++) {
      const milestoneType = milestoneTypes[i];
      const plannedDate = startDate + (duration * (i + 1) / milestoneTypes.length);

      let status = 'pending';
      let actualDate;

      if (project.progressPercentage >= ((i + 1) * 100 / milestoneTypes.length)) {
        status = 'completed';
        actualDate = plannedDate - (Math.random() * 7 * 24 * 60 * 60 * 1000);
      } else if (project.progressPercentage >= (i * 100 / milestoneTypes.length)) {
        status = 'in_progress';
      } else if (plannedDate < Date.now()) {
        status = 'delayed';
      }

      const milestoneId = await ctx.db.insert('projectMilestones', {
        projectId,
        milestoneType,
        title: getMilestoneTitle(milestoneType, project.projectType),
        description: getMilestoneDescription(milestoneType, project.projectType),
        plannedDate,
        actualDate,
        status,
        delayReason: status === 'delayed' ? getDelayReason() : undefined,
        order: i + 1,
        isRequired: true,
      });
      milestones.push(milestoneId);
    }
  }

  return milestones;
}

// Create progress updates
async function createProgressUpdates(ctx: any, projects: string[], creatorUserId: string) {
  const progressUpdates = [];

  for (const projectId of projects) {
    const project = await ctx.db.get(projectId);

    if (project.status === 'active') {
      // Create 4-6 progress updates for active projects
      const updateCount = Math.floor(Math.random() * 3) + 4;

      for (let i = 0; i < updateCount; i++) {
        const reportingDate = Date.now() - ((updateCount - i) * 14 * 24 * 60 * 60 * 1000); // Bi-weekly updates

        const updateId = await ctx.db.insert('progressUpdates', {
          projectId,
          reportedBy: creatorUserId,
          updateType: getUpdateType(i, updateCount),
          title: `${project.title} - Progress Update ${i + 1}`,
          description: getProgressDescription(project.projectType, i + 1),
          progressPercentage: Math.min(100, (i + 1) * (project.progressPercentage / updateCount) + Math.random() * 5),
          measurementData: getMeasurementData(project.projectType),
          location: project.location,
          photos: [
            {
              cloudinary_public_id: `progress_${projectId}_${i + 1}`,
              cloudinary_url: `https://res.cloudinary.com/demo/image/upload/v1234567890/progress_${projectId}_${i + 1}.jpg`
            }
          ],
          reportingDate,
          carbonImpactToDate: Math.floor((project.estimatedCO2Reduction * (i + 1)) / updateCount),
          isVerified: i < updateCount - 1,
          verifiedBy: i < updateCount - 1 ? project.assignedVerifierId : undefined,
          verifiedAt: i < updateCount - 1 ? reportingDate + (48 * 60 * 60 * 1000) : undefined,
        });
        progressUpdates.push(updateId);
      }
    } else if (project.status === 'under_review' || project.status === 'approved') {
      // Create 1-2 updates for newer projects
      for (let i = 0; i < 2; i++) {
        const reportingDate = Date.now() - ((2 - i) * 21 * 24 * 60 * 60 * 1000);

        const updateId = await ctx.db.insert('progressUpdates', {
          projectId,
          reportedBy: creatorUserId,
          updateType: 'milestone',
          title: `${project.title} - Initial Setup Update ${i + 1}`,
          description: getInitialProgressDescription(project.projectType),
          progressPercentage: (i + 1) * 10,
          location: project.location,
          photos: [{
            cloudinary_public_id: `setup_${projectId}_${i + 1}`,
            cloudinary_url: `https://res.cloudinary.com/demo/image/upload/setup_${projectId}_${i + 1}.jpg`
          }],
          reportingDate,
          carbonImpactToDate: 0,
          isVerified: false,
        });
        progressUpdates.push(updateId);
      }
    }
  }

  return progressUpdates;
}

// Create system alerts for creator's projects
async function createCreatorAlerts(ctx: any, projects: string[], creatorUserId: string) {
  const alerts = [];

  for (const projectId of projects) {
    const project = await ctx.db.get(projectId);

    // Create different types of alerts based on project status
    if (project.status === 'active') {
      // Progress reminder for active projects
      const alertId = await ctx.db.insert('systemAlerts', {
        projectId,
        alertType: 'progress_reminder',
        severity: 'low',
        message: 'Monthly progress report due in 5 days',
        description: `Progress report for "${project.title}" is due soon. Please submit your latest measurements and photos.`,
        source: 'system',
        category: 'monitoring',
        tags: ['progress', 'reminder'],
        isResolved: false,
        escalationLevel: 0,
        urgencyScore: 25,
        occurrenceCount: 1,
        firstOccurrence: Date.now() - (5 * 24 * 60 * 60 * 1000),
        lastOccurrence: Date.now() - (5 * 24 * 60 * 60 * 1000),
        nextEscalationTime: Date.now() + (3 * 24 * 60 * 60 * 1000),
      });
      alerts.push(alertId);
    }

    if (project.status === 'under_review') {
      // Documentation request for projects under review
      const alertId = await ctx.db.insert('systemAlerts', {
        projectId,
        alertType: 'quality_concern',
        severity: 'medium',
        message: 'Additional documentation required',
        description: `Verifier has requested additional technical specifications for "${project.title}".`,
        source: 'system',
        category: 'verification',
        tags: ['documentation', 'verification'],
        isResolved: false,
        escalationLevel: 1,
        urgencyScore: 60,
        occurrenceCount: 1,
        firstOccurrence: Date.now() - (2 * 24 * 60 * 60 * 1000),
        lastOccurrence: Date.now() - (2 * 24 * 60 * 60 * 1000),
        nextEscalationTime: Date.now() + (24 * 60 * 60 * 1000),
      });
      alerts.push(alertId);
    }

    // Random milestone delay for some projects
    if (Math.random() > 0.7) {
      const alertId = await ctx.db.insert('systemAlerts', {
        projectId,
        alertType: 'milestone_delay',
        severity: 'high',
        message: 'Project milestone behind schedule',
        description: `The "progress_50" milestone for "${project.title}" is 10 days behind the planned schedule.`,
        source: 'system',
        category: 'monitoring',
        tags: ['milestone', 'delay'],
        isResolved: Math.random() > 0.5,
        resolvedAt: Math.random() > 0.5 ? Date.now() - (24 * 60 * 60 * 1000) : undefined,
        resolutionNotes: Math.random() > 0.5 ? 'Delay addressed through revised timeline and additional resources' : undefined,
        escalationLevel: 2,
        urgencyScore: 80,
        occurrenceCount: 1,
        firstOccurrence: Date.now() - (10 * 24 * 60 * 60 * 1000),
        lastOccurrence: Date.now() - (10 * 24 * 60 * 60 * 1000),
      });
      alerts.push(alertId);
    }
  }

  return alerts;
}

// Create transactions (buyers purchasing credits)
async function createCreatorTransactions(ctx: any, projects: string[], buyers: string[]) {
  const transactions = [];

  for (const projectId of projects) {
    const project = await ctx.db.get(projectId);

    if (project.creditsSold > 0) {
      // Create transactions for sold credits
      const numTransactions = Math.min(3, Math.ceil(project.creditsSold / 1000));

      for (let i = 0; i < numTransactions; i++) {
        const buyer = buyers[Math.floor(Math.random() * buyers.length)];
        const creditAmount = Math.floor(project.creditsSold / numTransactions);
        const totalAmount = creditAmount * project.pricePerCredit;

        const transactionId = await ctx.db.insert('transactions', {
          buyerId: buyer,
          projectId,
          creditAmount,
          unitPrice: project.pricePerCredit,
          totalAmount,
          platformFee: totalAmount * 0.05,
          netAmount: totalAmount * 0.95,
          paymentStatus: 'completed',
          transactionReference: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          impactDescription: `Purchase of ${creditAmount} carbon credits from ${project.title}, contributing to ${project.estimatedCO2Reduction}kg CO2 reduction.`,
          certificateUrl: `https://certificates.ecosprout.com/cert_${projectId}_${i + 1}.pdf`
        });
        transactions.push(transactionId);
      }
    }
  }

  return transactions;
}

// Create notifications for the creator
async function createCreatorNotifications(ctx: any, creatorUserId: string, projects: string[]) {
  const notifications = [];

  const notificationTemplates = [
    {
      type: 'progress_reminder',
      subject: 'Progress Report Reminder',
      message: 'Your monthly progress report for "Community Solar Gardens - Phase 1" is due in 3 days.',
      severity: 'normal',
      category: 'monitoring'
    },
    {
      type: 'verification_update',
      subject: 'Verification Status Update',
      message: 'Your project "Urban Reforestation Initiative" has been successfully verified and approved.',
      severity: 'normal',
      category: 'verification'
    },
    {
      type: 'transaction_notification',
      subject: 'Credit Purchase Notification',
      message: 'EcoTech Corporation has purchased 1,000 carbon credits from your "Community Solar Gardens" project.',
      severity: 'normal',
      category: 'transactions'
    },
    {
      type: 'milestone_alert',
      subject: 'Milestone Achievement',
      message: 'Congratulations! You have reached the 50% completion milestone for "Urban Reforestation Initiative".',
      severity: 'normal',
      category: 'monitoring'
    },
    {
      type: 'system_alert',
      subject: 'Documentation Request',
      message: 'Additional technical specifications are required for "Agricultural Biogas Development" verification.',
      severity: 'high',
      category: 'verification'
    }
  ];

  for (const template of notificationTemplates) {
    const notificationId = await ctx.db.insert('notifications', {
      recipientId: creatorUserId,
      subject: template.subject,
      message: template.message,
      type: template.type,
      severity: template.severity,
      category: template.category,
      channels: ['email', 'in_app'],
      sentAt: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
      deliveredAt: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000) + (60 * 1000),
      readAt: Math.random() > 0.3 ? Date.now() - (Math.random() * 6 * 24 * 60 * 60 * 1000) : undefined,
      retryCount: 0,
      deliveryStatus: 'delivered',
      priority: template.severity === 'high' ? 'high' : 'normal',
      relatedEntityId: projects[Math.floor(Math.random() * projects.length)],
      relatedEntityType: 'project',
      isRead: Math.random() > 0.3,
    });
    notifications.push(notificationId);
  }

  return notifications;
}

// Create audit logs
async function createCreatorAuditLogs(ctx: any, creatorUserId: string, projects: string[]) {
  const actions = [
    'project_created',
    'progress_updated',
    'milestone_completed',
    'document_uploaded',
    'project_submitted',
    'verification_requested'
  ];

  for (let i = 0; i < 15; i++) {
    await ctx.db.insert('auditLogs', {
      userId: creatorUserId,
      action: actions[Math.floor(Math.random() * actions.length)],
      entityType: 'project',
      entityId: projects[Math.floor(Math.random() * projects.length)],
      oldValues: { status: 'draft', progress: 20 },
      newValues: { status: 'active', progress: 35 },
      metadata: {
        timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (creator dashboard)'
      },
      severity: 'info'
    });
  }
}

// Helper functions with type safety
function getMilestoneTitle(type: string, projectType: string): string {
  const titles: Record<string, Record<string, string>> = {
    setup: {
      solar: 'Site preparation and permits completed',
      reforestation: 'Land acquisition and permits obtained',
      biogas: 'Equipment procurement and site setup',
      mangrove_restoration: 'Site survey and community engagement completed',
      wind: 'Environmental assessments and permits finalized'
    },
    progress_25: {
      solar: '25% of solar panels installed',
      reforestation: '25% of planned area prepared for planting',
      biogas: 'Digester construction 25% complete',
      mangrove_restoration: '25% of coastline restoration completed',
      wind: 'Foundation and infrastructure 25% complete'
    },
    progress_50: {
      solar: '50% of installation and grid connection complete',
      reforestation: '50% of trees planted and established',
      biogas: 'Biogas system 50% operational',
      mangrove_restoration: '50% of mangrove seedlings planted',
      wind: '50% of turbines installed and operational'
    }
  };

  return titles[type]?.[projectType] || `${type} milestone for ${projectType} project`;
}

function getMilestoneDescription(type: string, projectType: string): string {
  const descriptions: Record<string, string> = {
    setup: 'Initial project setup including permits, land acquisition, and stakeholder engagement',
    progress_25: 'First quarter completion with initial implementation phase',
    progress_50: 'Halfway point reached with significant infrastructure development',
    progress_75: 'Three-quarters complete with major systems operational',
    impact_first: 'First measurable environmental impact achieved',
    verification: 'Independent verification of project outcomes and impact',
    completion: 'Project successfully completed with all objectives met'
  };

  return descriptions[type] || `Milestone description for ${type}`;
}

function getUpdateType(index: number, total: number): string {
  if (index === 0) return 'milestone';
  if (index === total - 1) return 'measurement';
  return ['measurement', 'photo', 'milestone'][Math.floor(Math.random() * 3)];
}

function getProgressDescription(projectType: string, updateNumber: number): string {
  const descriptions: Record<string, string[]> = {
    solar: [
      'Site preparation and electrical infrastructure installation progressing well',
      'Solar panel mounting systems installation completed for first section',
      'Electrical connections and grid integration testing underway',
      'System commissioning and performance monitoring implemented',
      'Full operational capacity achieved with excellent energy output'
    ],
    reforestation: [
      'Site preparation completed with soil analysis and native species selection',
      'First phase of tree planting initiated with strong community involvement',
      'Seedling survival rate monitoring shows excellent 90% success rate',
      'Canopy development progressing well with increased biodiversity',
      'Carbon sequestration measurements exceed initial projections'
    ],
    biogas: [
      'Equipment installation and digester construction underway',
      'Gas collection system assembly and testing completed',
      'First biogas production achieved with quality testing',
      'System optimization and efficiency improvements implemented',
      'Full operational capacity with consistent gas production'
    ]
  };

  return descriptions[projectType]?.[updateNumber - 1] ||
    `Progress update ${updateNumber} showing continued advancement in ${projectType} development.`;
}

function getInitialProgressDescription(projectType: string): string {
  const descriptions: Record<string, string> = {
    solar: 'Initial site preparation and permit acquisition completed. Environmental impact assessment approved.',
    reforestation: 'Land survey and soil analysis completed. Native species selection finalized with local experts.',
    biogas: 'Site preparation and equipment procurement underway. Local farmer partnerships established.',
    mangrove_restoration: 'Coastal site assessment completed. Community engagement sessions successfully conducted.',
    wind: 'Environmental impact assessments completed. Wind resource analysis confirms excellent potential.'
  };

  return descriptions[projectType] || 'Initial project setup and planning phase completed successfully.';
}

function getMeasurementData(projectType: string): any {
  switch (projectType) {
    case 'solar':
      return {
        carbonImpactToDate: Math.floor(Math.random() * 8000) + 2000,
        energyGenerated: Math.floor(Math.random() * 25000) + 5000,
        systemUptime: 85 + Math.random() * 15
      };
    case 'reforestation':
      return {
        carbonImpactToDate: Math.floor(Math.random() * 5000) + 1000,
        treesPlanted: Math.floor(Math.random() * 3000) + 500,
        survivalRate: 80 + Math.random() * 15,
        areaRestored: Math.floor(Math.random() * 80) + 20
      };
    case 'biogas':
      return {
        carbonImpactToDate: Math.floor(Math.random() * 4000) + 800,
        gasProduced: Math.floor(Math.random() * 15000) + 3000
      };
    case 'mangrove_restoration':
      return {
        carbonImpactToDate: Math.floor(Math.random() * 3000) + 600,
        mangrovesPlanted: Math.floor(Math.random() * 1500) + 300,
        areaRestored: Math.floor(Math.random() * 40) + 10
      };
    case 'wind':
      return {
        carbonImpactToDate: Math.floor(Math.random() * 10000) + 2000,
        energyGenerated: Math.floor(Math.random() * 35000) + 8000,
        systemUptime: 75 + Math.random() * 25
      };
    default:
      return {
        carbonImpactToDate: Math.floor(Math.random() * 5000) + 1000
      };
  }
}

function getDelayReason(): string {
  const reasons = [
    'Weather conditions delayed construction progress',
    'Equipment delivery postponed due to supply chain issues',
    'Additional environmental permits required',
    'Community consultation process extended',
    'Technical specifications under review'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}