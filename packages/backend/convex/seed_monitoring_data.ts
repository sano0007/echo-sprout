import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * COMPREHENSIVE DATA SEEDING SCRIPT FOR MONITORING & TRACKING SYSTEM
 *
 * This script creates realistic sample data for the monitoring and tracking system:
 * - Users (creators, buyers, verifiers, admins)
 * - Projects with different types and statuses
 * - Progress updates and milestones
 * - System alerts and escalations
 * - Monitoring configuration
 * - Analytics snapshots
 * - Notifications and audit logs
 */

export const seedMonitoringData = mutation({
  args: {
    clearExisting: v.optional(v.boolean()) // Optional flag to clear existing data
  },
  handler: async (ctx, args) => {
    console.log('🌱 Starting comprehensive monitoring data seeding...');

    if (args.clearExisting) {
      console.log('🧹 Clearing existing data...');
      await clearExistingData(ctx);
    }

    // Step 1: Create Users
    const users = await createUsers(ctx);
    console.log(`✅ Created ${users.length} users`);

    // Step 2: Create Projects
    const projects = await createProjects(ctx, users);
    console.log(`✅ Created ${projects.length} projects`);

    // Step 3: Create Project Milestones
    const milestones = await createProjectMilestones(ctx, projects);
    console.log(`✅ Created ${milestones.length} milestones`);

    // Step 4: Create Progress Updates
    const progressUpdates = await createProgressUpdates(ctx, projects, users);
    console.log(`✅ Created ${progressUpdates.length} progress updates`);

    // Step 5: Create System Alerts
    const alerts = await createSystemAlerts(ctx, projects, users);
    console.log(`✅ Created ${alerts.length} system alerts`);

    // Step 6: Create Monitoring Configuration
    await createMonitoringConfig(ctx);
    console.log('✅ Created monitoring configuration');

    // Step 7: Create Escalation Configuration
    await createEscalationConfig(ctx, users);
    console.log('✅ Created escalation configuration');

    // Step 8: Create Analytics Snapshots
    await createAnalyticsSnapshots(ctx);
    console.log('✅ Created analytics snapshots');

    // Step 9: Create Notifications
    const notifications = await createNotifications(ctx, users, projects);
    console.log(`✅ Created ${notifications.length} notifications`);

    // Step 10: Create Audit Logs
    await createAuditLogs(ctx, users, projects);
    console.log('✅ Created audit logs');

    // Step 11: Create Transactions for tracking
    const transactions = await createTransactions(ctx, users, projects);
    console.log(`✅ Created ${transactions.length} transactions`);

    console.log('🎉 Monitoring data seeding completed successfully!');

    return {
      success: true,
      stats: {
        users: users.length,
        projects: projects.length,
        milestones: milestones.length,
        progressUpdates: progressUpdates.length,
        alerts: alerts.length,
        notifications: notifications.length,
        transactions: transactions.length
      }
    };
  },
});

// Helper function to clear existing data
async function clearExistingData(ctx: any) {
  const tables = [
    'systemAlerts', 'projectMilestones', 'progressUpdates',
    'notifications', 'auditLogs', 'transactions', 'projects', 'users',
    'monitoringConfig', 'escalationConfig', 'analyticsSnapshots'
  ];

  for (const table of tables) {
    const docs = await ctx.db.query(table).collect();
    for (const doc of docs) {
      await ctx.db.delete(doc._id);
    }
  }
}

// Create realistic users with different roles
async function createUsers(ctx: any) {
  const users = [];

  // Admin users
  const admin1 = await ctx.db.insert('users', {
    email: 'admin@ecosprout.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'admin',
    organizationName: 'EcoSprout Platform',
    organizationType: 'Technology',
    phoneNumber: '+1-555-0101',
    address: '123 Green Tech Blvd',
    city: 'San Francisco',
    country: 'United States',
    isVerified: true,
    clerkId: 'clerk_admin_001',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    notificationPreferences: {
      channels: ['email', 'in_app'],
      alertTypes: {
        progress_reminders: true,
        milestone_delays: true,
        system_alerts: true,
        escalations: true,
        weekly_reports: true,
      },
      frequency: {
        immediate: true,
        hourly: false,
        daily: true,
        weekly: true,
      },
    },
  });
  users.push(admin1);

  // Verifiers
  const verifier1 = await ctx.db.insert('users', {
    email: 'verifier.forest@ecosprout.com',
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    role: 'verifier',
    organizationName: 'Forest Verification Services',
    organizationType: 'Environmental Consulting',
    phoneNumber: '+1-555-0201',
    address: '456 Verification Ave',
    city: 'Portland',
    country: 'United States',
    isVerified: true,
    clerkId: 'clerk_verifier_001',
    verifierSpecialty: ['reforestation', 'mangrove_restoration'],
    isActive: true,
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  });
  users.push(verifier1);

  const verifier2 = await ctx.db.insert('users', {
    email: 'verifier.energy@ecosprout.com',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    role: 'verifier',
    organizationName: 'Clean Energy Certification',
    organizationType: 'Environmental Consulting',
    phoneNumber: '+1-555-0202',
    address: '789 Solar Street',
    city: 'Austin',
    country: 'United States',
    isVerified: true,
    clerkId: 'clerk_verifier_002',
    verifierSpecialty: ['solar', 'wind'],
    isActive: true,
  });
  users.push(verifier2);

  // Project Creators
  const creators = [
    {
      email: 'creator.amazon@rainforest.org',
      firstName: 'Carlos',
      lastName: 'Silva',
      organizationName: 'Amazon Reforestation Initiative',
      organizationType: 'Non-Profit',
      address: 'Manaus, Amazonas',
      city: 'Manaus',
      country: 'Brazil',
      clerkId: 'clerk_creator_001',
    },
    {
      email: 'creator.solar@cleanenergy.com',
      firstName: 'Aisha',
      lastName: 'Patel',
      organizationName: 'Solar Solutions India',
      organizationType: 'Private Company',
      address: 'Delhi Green Park',
      city: 'New Delhi',
      country: 'India',
      clerkId: 'clerk_creator_002',
    },
    {
      email: 'creator.mangrove@coastal.org',
      firstName: 'James',
      lastName: 'Thompson',
      organizationName: 'Coastal Restoration Foundation',
      organizationType: 'Non-Profit',
      address: 'Miami Coast Blvd',
      city: 'Miami',
      country: 'United States',
      clerkId: 'clerk_creator_003',
    }
  ];

  for (const creator of creators) {
    const creatorId = await ctx.db.insert('users', {
      ...creator,
      role: 'project_creator',
      phoneNumber: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
      isVerified: true,
      isActive: true,
      lastLoginAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    });
    users.push(creatorId);
  }

  // Credit Buyers
  const buyers = [
    {
      email: 'buyer.corp@techcorp.com',
      firstName: 'Lisa',
      lastName: 'Wang',
      organizationName: 'TechCorp Inc.',
      organizationType: 'Technology Corporation',
      address: '100 Corporate Plaza',
      city: 'Seattle',
      country: 'United States',
      clerkId: 'clerk_buyer_001',
    },
    {
      email: 'buyer.bank@greenbank.com',
      firstName: 'David',
      lastName: 'Miller',
      organizationName: 'Green Investment Bank',
      organizationType: 'Financial Services',
      address: '200 Financial District',
      city: 'London',
      country: 'United Kingdom',
      clerkId: 'clerk_buyer_002',
    }
  ];

  for (const buyer of buyers) {
    const buyerId = await ctx.db.insert('users', {
      ...buyer,
      role: 'credit_buyer',
      phoneNumber: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
      isVerified: true,
      isActive: true,
    });
    users.push(buyerId);
  }

  return users;
}

// Create projects with different types and statuses
async function createProjects(ctx: any, users: string[]) {
  const creators = users.slice(2, 5); // Take creator users
  const verifiers = users.slice(1, 3); // Take verifier users
  const projects = [];

  const projectTemplates = [
    {
      title: 'Amazon Rainforest Restoration - Phase 1',
      description: 'Large-scale reforestation project in the Brazilian Amazon, focusing on native species restoration and biodiversity conservation.',
      projectType: 'reforestation',
      location: { lat: -3.4653, long: -62.2159, name: 'Manaus, Brazil' },
      areaSize: 10000, // hectares
      estimatedCO2Reduction: 50000,
      budget: 2500000,
      startDate: '2024-01-15',
      expectedCompletionDate: '2026-12-31',
      status: 'active',
      verificationStatus: 'verified',
      totalCarbonCredits: 50000,
      pricePerCredit: 25,
      creditsAvailable: 35000,
      creditsSold: 15000,
      progressPercentage: 35,
    },
    {
      title: 'Solar Farm Development - Maharashtra',
      description: 'Construction of a 100MW solar photovoltaic farm in rural Maharashtra, providing clean energy to 50,000 households.',
      projectType: 'solar',
      location: { lat: 19.7515, long: 75.7139, name: 'Maharashtra, India' },
      areaSize: 500, // hectares
      estimatedCO2Reduction: 75000,
      budget: 5000000,
      startDate: '2024-03-01',
      expectedCompletionDate: '2025-08-31',
      status: 'active',
      verificationStatus: 'in_progress',
      totalCarbonCredits: 75000,
      pricePerCredit: 30,
      creditsAvailable: 75000,
      creditsSold: 0,
      progressPercentage: 60,
    },
    {
      title: 'Mangrove Restoration - Florida Coast',
      description: 'Coastal mangrove ecosystem restoration to protect against storm surge and provide habitat for marine life.',
      projectType: 'mangrove_restoration',
      location: { lat: 25.7617, long: -80.1918, name: 'Miami, Florida' },
      areaSize: 1200, // hectares
      estimatedCO2Reduction: 25000,
      budget: 800000,
      startDate: '2024-02-01',
      expectedCompletionDate: '2025-12-31',
      status: 'under_review',
      verificationStatus: 'pending',
      totalCarbonCredits: 25000,
      pricePerCredit: 35,
      creditsAvailable: 25000,
      creditsSold: 0,
      progressPercentage: 15,
    },
    {
      title: 'Wind Energy Project - Texas Plains',
      description: 'Development of 50MW wind energy facility in West Texas, contributing to renewable energy grid.',
      projectType: 'wind',
      location: { lat: 32.7767, long: -96.7970, name: 'Texas, USA' },
      areaSize: 2000, // hectares
      estimatedCO2Reduction: 40000,
      budget: 3200000,
      startDate: '2024-06-01',
      expectedCompletionDate: '2025-12-31',
      status: 'approved',
      verificationStatus: 'pending',
      totalCarbonCredits: 40000,
      pricePerCredit: 28,
      creditsAvailable: 40000,
      creditsSold: 0,
      progressPercentage: 5,
    },
    {
      title: 'Biogas from Agricultural Waste',
      description: 'Converting agricultural waste into biogas energy, reducing methane emissions and producing renewable energy.',
      projectType: 'biogas',
      location: { lat: 52.5200, long: 13.4050, name: 'Brandenburg, Germany' },
      areaSize: 100, // hectares
      estimatedCO2Reduction: 15000,
      budget: 1200000,
      startDate: '2024-04-01',
      expectedCompletionDate: '2025-06-30',
      status: 'completed',
      verificationStatus: 'verified',
      actualCompletionDate: '2024-11-15',
      totalCarbonCredits: 15000,
      pricePerCredit: 32,
      creditsAvailable: 0,
      creditsSold: 15000,
      progressPercentage: 100,
    }
  ];

  for (let i = 0; i < projectTemplates.length; i++) {
    const template = projectTemplates[i];
    const projectId = await ctx.db.insert('projects', {
      ...template,
      creatorId: creators[i % creators.length],
      assignedVerifierId: verifiers[i % verifiers.length],
      verificationStartedAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastProgressUpdate: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
      requiredDocuments: ['project_plan', 'environmental_assessment', 'permits', 'technical_specs'],
      submittedDocuments: template.status === 'completed' ?
        ['project_plan', 'environmental_assessment', 'permits', 'technical_specs'] :
        ['project_plan', 'environmental_assessment'],
      isDocumentationComplete: template.status === 'completed',
      qualityScore: template.status === 'completed' ? 9.2 : undefined,
    });
    projects.push(projectId);
  }

  return projects;
}

// Create project milestones with realistic timelines
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

      // Determine status based on project progress
      let status = 'pending';
      let actualDate;

      if (project.progressPercentage >= ((i + 1) * 100 / milestoneTypes.length)) {
        status = 'completed';
        actualDate = plannedDate - (Math.random() * 7 * 24 * 60 * 60 * 1000); // Completed within a week of planned
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
        delayReason: status === 'delayed' ? 'Weather conditions delayed progress' : undefined,
        impactOnTimeline: status === 'delayed' ? 'Minor delay, adjusting subsequent milestones' : undefined,
        order: i + 1,
        isRequired: true,
      });
      milestones.push(milestoneId);
    }
  }

  return milestones;
}

// Create realistic progress updates
async function createProgressUpdates(ctx: any, projects: string[], users: string[]) {
  const progressUpdates = [];

  for (const projectId of projects) {
    const project = await ctx.db.get(projectId);
    const creators = users.filter(async (userId) => {
      const user = await ctx.db.get(userId);
      return user.role === 'project_creator';
    });

    // Create 3-5 progress updates per project
    const updateCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < updateCount; i++) {
      const reportingDate = Date.now() - ((updateCount - i) * 7 * 24 * 60 * 60 * 1000); // Weekly updates

      const updateId = await ctx.db.insert('progressUpdates', {
        projectId,
        reportedBy: project.creatorId,
        updateType: i === updateCount - 1 ? 'milestone' : ['measurement', 'photo', 'issue'][Math.floor(Math.random() * 3)],
        title: `Progress Update ${i + 1} - ${project.title}`,
        description: getProgressDescription(project.projectType, i + 1),
        progressPercentage: Math.min(100, (i + 1) * 20 + Math.random() * 10),
        measurementData: getMeasurementData(project.projectType),
        location: project.location,
        photos: [
          {
            cloudinary_public_id: `progress_${projectId}_${i + 1}_1`,
            cloudinary_url: `https://res.cloudinary.com/demo/image/upload/v1234567890/progress_${projectId}_${i + 1}_1.jpg`
          }
        ],
        reportingDate,
        carbonImpactToDate: Math.floor((project.estimatedCO2Reduction * (i + 1)) / updateCount),
        isVerified: i < updateCount - 1, // Latest update not yet verified
        verifiedBy: i < updateCount - 1 ? users[1] : undefined, // Verifier
        verifiedAt: i < updateCount - 1 ? reportingDate + (24 * 60 * 60 * 1000) : undefined,
      });
      progressUpdates.push(updateId);
    }
  }

  return progressUpdates;
}

// Create system alerts with different severity levels
async function createSystemAlerts(ctx: any, projects: string[], users: string[]) {
  const alerts = [];
  const alertTypes = [
    'progress_reminder',
    'overdue_warning',
    'milestone_delay',
    'impact_shortfall',
    'quality_concern'
  ];

  // Create alerts for different scenarios
  for (let i = 0; i < 15; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

    const alertId = await ctx.db.insert('systemAlerts', {
      projectId: project,
      alertType,
      severity: getSeverityForAlert(alertType),
      message: getAlertMessage(alertType),
      description: getAlertDescription(alertType),
      source: 'system',
      category: 'monitoring',
      tags: [alertType, 'automated'],
      isResolved: Math.random() > 0.3, // 70% of alerts are resolved
      resolvedAt: Math.random() > 0.3 ? Date.now() - (Math.random() * 48 * 60 * 60 * 1000) : undefined,
      resolvedBy: Math.random() > 0.3 ? users[0] : undefined, // Admin resolves
      resolutionNotes: Math.random() > 0.3 ? 'Issue resolved through stakeholder communication' : undefined,
      escalationLevel: Math.floor(Math.random() * 3),
      lastEscalationTime: Date.now() - (Math.random() * 24 * 60 * 60 * 1000),
      nextEscalationTime: Math.random() > 0.7 ? Date.now() + (12 * 60 * 60 * 1000) : undefined,
      urgencyScore: Math.floor(Math.random() * 100),
      occurrenceCount: Math.floor(Math.random() * 5) + 1,
      firstOccurrence: Date.now() - (Math.random() * 168 * 60 * 60 * 1000), // Within last week
      lastOccurrence: Date.now() - (Math.random() * 24 * 60 * 60 * 1000),
      metadata: {
        projectType: 'reforestation',
        expectedCompletion: '2025-12-31',
        currentProgress: 35
      }
    });
    alerts.push(alertId);
  }

  return alerts;
}

// Create monitoring configuration
async function createMonitoringConfig(ctx: any) {
  const projectTypes = ['reforestation', 'solar', 'wind', 'biogas', 'waste_management', 'mangrove_restoration'];

  for (const projectType of projectTypes) {
    // Reminder schedule configuration
    await ctx.db.insert('monitoringConfig', {
      projectType,
      configKey: 'reminder_schedule',
      configValue: {
        progressReports: {
          reminderDays: [7, 3, 1], // Days before deadline
          frequency: 'monthly',
          escalationThreshold: 3 // Days overdue before escalation
        },
        milestones: {
          reminderDays: [14, 7, 3],
          delayToleranceDays: 5
        }
      },
      isActive: true,
      description: 'Automated reminder schedule for progress reports and milestones'
    });

    // Threshold configuration
    await ctx.db.insert('monitoringConfig', {
      projectType,
      configKey: 'thresholds',
      configValue: {
        progressVariance: 20, // % deviation from expected progress
        impactShortfall: 15, // % below expected impact
        qualityScore: 7.0, // Minimum quality score
        timelineDelay: 30 // Days behind schedule threshold
      },
      isActive: true,
      description: 'Monitoring thresholds for automatic alert generation'
    });
  }
}

// Create escalation configuration
async function createEscalationConfig(ctx: any, users: string[]) {
  const alertTypes = ['progress_reminder', 'overdue_warning', 'milestone_delay', 'impact_shortfall', 'quality_concern'];
  const severities = ['low', 'medium', 'high', 'critical'];

  for (const alertType of alertTypes) {
    for (const severity of severities) {
      await ctx.db.insert('escalationConfig', {
        alertType,
        severity,
        rules: {
          escalationChain: [
            {
              level: 1,
              roles: ['project_creator'],
              delayMinutes: severity === 'critical' ? 30 : 120,
            },
            {
              level: 2,
              roles: ['verifier'],
              delayMinutes: severity === 'critical' ? 60 : 240,
            },
            {
              level: 3,
              roles: ['admin'],
              delayMinutes: severity === 'critical' ? 120 : 480,
              specificUsers: [users[0]] // Specific admin
            }
          ],
          maxEscalationLevel: 3,
          autoEscalationEnabled: true,
          businessHoursOnly: severity === 'low',
          cooldownPeriod: severity === 'critical' ? 60 : 240
        },
        createdBy: users[0],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }
}

// Create analytics snapshots
async function createAnalyticsSnapshots(ctx: any) {
  const types = ['daily', 'weekly', 'monthly'];

  for (const type of types) {
    await ctx.db.insert('analyticsSnapshots', {
      date: Date.now() - (24 * 60 * 60 * 1000), // Yesterday
      type,
      projectData: {
        totalActive: 15,
        totalCompleted: 5,
        totalOverdue: 3,
        averageProgress: 67,
        totalCarbonCredits: 205000,
        totalFunding: 12700000
      },
      userData: {
        totalUsers: 25,
        activeCreators: 8,
        activeBuyers: 12,
        activeVerifiers: 5
      },
      transactionData: {
        totalTransactions: 45,
        totalVolume: 850000,
        averageTransactionSize: 18888,
        totalRevenue: 85000
      },
      impactData: {
        totalCO2Reduced: 255000,
        treesPlanted: 125000,
        energyGenerated: 45000,
        areaRestored: 13700
      },
      timestamp: Date.now()
    });
  }
}

// Create notifications
async function createNotifications(ctx: any, users: string[], projects: string[]) {
  const notifications = [];
  const notificationTypes = [
    'progress_reminder',
    'milestone_alert',
    'verification_update',
    'system_alert',
    'escalation_notice'
  ];

  for (let i = 0; i < 20; i++) {
    const recipientId = users[Math.floor(Math.random() * users.length)];
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

    const notificationId = await ctx.db.insert('notifications', {
      recipientId,
      senderId: users[0], // Admin as sender
      subject: getNotificationSubject(type),
      message: getNotificationMessage(type),
      type,
      severity: Math.random() > 0.7 ? 'high' : 'normal',
      category: 'monitoring',
      channels: ['email', 'in_app'],
      sentAt: Date.now() - (Math.random() * 24 * 60 * 60 * 1000),
      deliveredAt: Date.now() - (Math.random() * 23 * 60 * 60 * 1000),
      readAt: Math.random() > 0.4 ? Date.now() - (Math.random() * 22 * 60 * 60 * 1000) : undefined,
      retryCount: 0,
      deliveryStatus: 'delivered',
      priority: Math.random() > 0.8 ? 'high' : 'normal',
      relatedEntityId: projects[Math.floor(Math.random() * projects.length)],
      relatedEntityType: 'project',
      isRead: Math.random() > 0.4,
      metadata: {
        alertId: 'alert_' + Math.floor(Math.random() * 1000),
        projectType: 'reforestation'
      }
    });
    notifications.push(notificationId);
  }

  return notifications;
}

// Create audit logs
async function createAuditLogs(ctx: any, users: string[], projects: string[]) {
  const actions = [
    'project_created',
    'progress_updated',
    'milestone_completed',
    'alert_generated',
    'alert_resolved',
    'verification_started',
    'verification_completed'
  ];

  for (let i = 0; i < 30; i++) {
    await ctx.db.insert('auditLogs', {
      userId: users[Math.floor(Math.random() * users.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      entityType: 'project',
      entityId: projects[Math.floor(Math.random() * projects.length)],
      oldValues: { status: 'active', progress: 30 },
      newValues: { status: 'active', progress: 45 },
      metadata: {
        timestamp: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Chrome/91.0.4472.124)'
      },
      severity: 'info'
    });
  }
}

// Create transactions for buyers
async function createTransactions(ctx: any, users: string[], projects: string[]) {
  const transactions = [];

  // Get buyer users
  const buyerUsers = [];
  for (const userId of users) {
    const user = await ctx.db.get(userId);
    if (user && user.role === 'credit_buyer') {
      buyerUsers.push(userId);
    }
  }

  for (let i = 0; i < 10; i++) {
    const buyer = buyerUsers[Math.floor(Math.random() * buyerUsers.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const creditAmount = Math.floor(Math.random() * 1000) + 100;
    const unitPrice = 25 + Math.random() * 15; // $25-40 per credit
    const totalAmount = creditAmount * unitPrice;

    const transactionId = await ctx.db.insert('transactions', {
      buyerId: buyer,
      projectId: project,
      creditAmount,
      unitPrice,
      totalAmount,
      platformFee: totalAmount * 0.05,
      netAmount: totalAmount * 0.95,
      paymentStatus: Math.random() > 0.1 ? 'completed' : 'pending',
      transactionReference: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      impactDescription: `Purchase of ${creditAmount} carbon credits contributing to environmental restoration.`,
      certificateUrl: `https://certificates.ecosprout.com/cert_${Math.floor(Math.random() * 10000)}.pdf`
    });
    transactions.push(transactionId);
  }

  return transactions;
}

// Helper functions for generating realistic content

function getMilestoneTitle(type: string, projectType: string): string {
  const titles: Record<string, Record<string, string>> = {
    setup: {
      reforestation: 'Land acquisition and permits obtained',
      solar: 'Site preparation and permits completed',
      wind: 'Environmental assessments and permits finalized',
      mangrove_restoration: 'Site survey and community engagement completed'
    },
    progress_25: {
      reforestation: '25% of planned area prepared for planting',
      solar: '25% of solar panels installed',
      wind: 'Foundation and infrastructure 25% complete',
      mangrove_restoration: '25% of coastline restoration completed'
    },
    progress_50: {
      reforestation: '50% of trees planted and established',
      solar: '50% of installation and grid connection complete',
      wind: '50% of turbines installed and operational',
      mangrove_restoration: '50% of mangrove seedlings planted'
    },
    progress_75: {
      reforestation: '75% of project area reforested',
      solar: '75% operational with grid integration',
      wind: '75% of capacity generating clean energy',
      mangrove_restoration: '75% of ecosystem restoration complete'
    },
    impact_first: {
      reforestation: 'First carbon sequestration measurements recorded',
      solar: 'First clean energy generation milestone',
      wind: 'First renewable energy production achieved',
      mangrove_restoration: 'First coastal protection benefits measured'
    },
    verification: {
      reforestation: 'Third-party verification of carbon sequestration',
      solar: 'Energy output verification and certification',
      wind: 'Renewable energy production certified',
      mangrove_restoration: 'Ecosystem restoration impact verified'
    },
    completion: {
      reforestation: 'Project completion and long-term monitoring established',
      solar: 'Full operational capacity and handover completed',
      wind: 'Project completion and maintenance protocols established',
      mangrove_restoration: 'Restoration complete with monitoring system in place'
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

function getProgressDescription(projectType: string, updateNumber: number): string {
  const descriptions: Record<string, string[]> = {
    reforestation: [
      'Site preparation completed with soil analysis and native species selection',
      'First phase of tree planting initiated with community involvement',
      'Seedling survival rate monitoring shows 85% success rate',
      'Canopy development progressing well with biodiversity increases',
      'Carbon sequestration measurements exceed initial projections'
    ],
    solar: [
      'Ground preparation and electrical infrastructure installation started',
      'Solar panel mounting and initial electrical connections completed',
      'Grid integration testing and inverter commissioning underway',
      'System optimization and performance monitoring implemented',
      'Full operational capacity achieved with excellent energy output'
    ]
  };

  return descriptions[projectType]?.[updateNumber - 1] || `Progress update ${updateNumber} for ${projectType} project showing continued advancement.`;
}

function getMeasurementData(projectType: string): any {
  const baseData = {
    carbonImpactToDate: Math.floor(Math.random() * 10000) + 1000,
  };

  switch (projectType) {
    case 'reforestation':
      return {
        ...baseData,
        treesPlanted: Math.floor(Math.random() * 5000) + 1000,
        survivalRate: 75 + Math.random() * 20, // 75-95%
        areaRestored: Math.floor(Math.random() * 100) + 50
      };
    case 'solar':
      return {
        ...baseData,
        energyGenerated: Math.floor(Math.random() * 50000) + 10000, // kWh
        systemUptime: 85 + Math.random() * 15 // 85-100%
      };
    case 'mangrove_restoration':
      return {
        ...baseData,
        mangrovesPlanted: Math.floor(Math.random() * 2000) + 500,
        areaRestored: Math.floor(Math.random() * 50) + 20
      };
    default:
      return baseData;
  }
}

function getSeverityForAlert(alertType: string): string {
  const severityMap: Record<string, string> = {
    progress_reminder: 'low',
    overdue_warning: 'medium',
    milestone_delay: 'high',
    impact_shortfall: 'high',
    quality_concern: 'critical'
  };
  return severityMap[alertType] || 'medium';
}

function getAlertMessage(alertType: string): string {
  const messages: Record<string, string> = {
    progress_reminder: 'Monthly progress report is due in 3 days',
    overdue_warning: 'Progress report is 5 days overdue',
    milestone_delay: 'Project milestone is behind schedule',
    impact_shortfall: 'Carbon impact below projected targets',
    quality_concern: 'Project documentation quality requires attention'
  };
  return messages[alertType] || 'System alert requires attention';
}

function getAlertDescription(alertType: string): string {
  const descriptions: Record<string, string> = {
    progress_reminder: 'Automated reminder for upcoming progress report deadline',
    overdue_warning: 'Progress report submission is overdue and requires immediate attention',
    milestone_delay: 'Project milestone has not been completed within the planned timeframe',
    impact_shortfall: 'Current environmental impact measurements are below expected targets',
    quality_concern: 'Project documentation or evidence quality does not meet verification standards'
  };
  return descriptions[alertType] || 'System generated alert requiring stakeholder attention';
}

function getNotificationSubject(type: string): string {
  const subjects: Record<string, string> = {
    progress_reminder: 'Progress Report Due Soon',
    milestone_alert: 'Milestone Update Required',
    verification_update: 'Verification Status Update',
    system_alert: 'System Alert Notification',
    escalation_notice: 'Escalated Issue Requires Attention'
  };
  return subjects[type] || 'Platform Notification';
}

function getNotificationMessage(type: string): string {
  const messages: Record<string, string> = {
    progress_reminder: 'Your monthly progress report is due in 3 days. Please submit your update with photos and measurements.',
    milestone_alert: 'A project milestone requires your attention. Please review and update the milestone status.',
    verification_update: 'The verification status of your project has been updated. Please check the verification dashboard.',
    system_alert: 'A system alert has been generated for one of your projects. Please review the alert details.',
    escalation_notice: 'An issue has been escalated and requires immediate attention. Please address this priority item.'
  };
  return messages[type] || 'You have a new notification from the EcoSprout platform.';
}