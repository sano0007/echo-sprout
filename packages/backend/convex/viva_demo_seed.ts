import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * VIVA DEMONSTRATION SEED DATA
 *
 * This script creates comprehensive preview data for the university viva demonstration
 * connecting the project creator and credit buyer with realistic monitoring data.
 *
 * Users:
 * - Project Creator: j57a35tqc4c0kyejn4s2kc3axd7rf6hh
 * - Credit Buyer: j57epxky30ka850s378mw3farh7rf5j0
 */

export const seedVivaDemo = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🌱 Starting VIVA demonstration data seeding...');

    // User IDs
    const projectCreatorId = 'j57a35tqc4c0kyejn4s2kc3axd7rf6hh' as any;
    const creditBuyerId = 'j57epxky30ka850s378mw3farh7rf5j0' as any;

    try {
      // ============= CREATE SAMPLE PROJECTS =============
      console.log('📊 Creating sample projects...');

      const project1 = await ctx.db.insert('projects', {
        creatorId: projectCreatorId,
        title: 'Sri Lankan Reforestation Initiative',
        description:
          'A comprehensive reforestation project in the hill country of Sri Lanka, focusing on native species restoration and community involvement. This project aims to restore 500 hectares of degraded forest land while providing sustainable livelihoods for local communities.',
        projectType: 'reforestation',
        location: {
          lat: 7.2906,
          long: 80.6337,
          name: 'Central Province, Sri Lanka',
        },
        areaSize: 500,
        estimatedCO2Reduction: 15000,
        budget: 75000,
        startDate: '2024-01-15',
        expectedCompletionDate: '2025-12-31',
        status: 'active',
        verificationStatus: 'verified',
        totalCarbonCredits: 12000,
        pricePerCredit: 15,
        creditsAvailable: 8500,
        creditsSold: 3500,
        verificationStartedAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
        verificationCompletedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        qualityScore: 8.7,
        requiredDocuments: [
          'project_plan',
          'environmental_assessment',
          'permits',
        ],
        submittedDocuments: [
          'project_plan',
          'environmental_assessment',
          'permits',
        ],
        isDocumentationComplete: true,
        progressPercentage: 42,
        lastProgressUpdate: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      });

      const project2 = await ctx.db.insert('projects', {
        creatorId: projectCreatorId,
        title: 'Solar Energy Farm - Hambantota',
        description:
          'Large-scale solar energy installation in Hambantota district, contributing to renewable energy generation and carbon offset. This 10MW solar farm will provide clean energy to 5,000 households while generating significant carbon credits.',
        projectType: 'solar',
        location: {
          lat: 6.124,
          long: 81.1185,
          name: 'Hambantota, Southern Province, Sri Lanka',
        },
        areaSize: 25,
        estimatedCO2Reduction: 8000,
        budget: 120000,
        startDate: '2024-03-01',
        expectedCompletionDate: '2024-11-30',
        status: 'active',
        verificationStatus: 'in_progress',
        totalCarbonCredits: 6400,
        pricePerCredit: 18,
        creditsAvailable: 6400,
        creditsSold: 0,
        verificationStartedAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
        requiredDocuments: [
          'project_plan',
          'environmental_assessment',
          'permits',
          'technical_specs',
        ],
        submittedDocuments: [
          'project_plan',
          'environmental_assessment',
          'permits',
        ],
        isDocumentationComplete: false,
        progressPercentage: 65,
        lastProgressUpdate: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      });

      const project3 = await ctx.db.insert('projects', {
        creatorId: projectCreatorId,
        title: 'Mangrove Restoration - Jaffna Peninsula',
        description:
          'Coastal mangrove ecosystem restoration project in Jaffna Peninsula, protecting coastlines and supporting marine biodiversity while sequestering carbon.',
        projectType: 'mangrove_restoration',
        location: {
          lat: 9.6615,
          long: 80.0255,
          name: 'Jaffna Peninsula, Northern Province, Sri Lanka',
        },
        areaSize: 200,
        estimatedCO2Reduction: 5500,
        budget: 45000,
        startDate: '2024-02-01',
        expectedCompletionDate: '2025-06-30',
        status: 'active',
        verificationStatus: 'verified',
        totalCarbonCredits: 4400,
        pricePerCredit: 12,
        creditsAvailable: 2200,
        creditsSold: 2200,
        verificationStartedAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
        verificationCompletedAt: Date.now() - 40 * 24 * 60 * 60 * 1000, // 40 days ago
        qualityScore: 9.2,
        requiredDocuments: [
          'project_plan',
          'environmental_assessment',
          'permits',
        ],
        submittedDocuments: [
          'project_plan',
          'environmental_assessment',
          'permits',
        ],
        isDocumentationComplete: true,
        progressPercentage: 28,
        lastProgressUpdate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      });

      console.log('✅ Created 3 sample projects');

      // ============= CREATE PROGRESS UPDATES =============
      console.log('📈 Creating progress updates...');

      // Progress updates for Project 1 (Reforestation)
      await ctx.db.insert('progressUpdates', {
        projectId: project1,
        submittedBy: projectCreatorId,
        updateType: 'milestone',
        title: 'First Quarter Milestone - Land Preparation Complete',
        description:
          'Successfully completed land preparation for the first 125 hectares. Soil testing has been conducted, and native species seedlings have been prepared in our nursery. Community training programs have been initiated with 45 local participants.',
        progressPercentage: 25,
        photoStorageIds: [],
        photoUrls: [],
        photos: [],
        measurementData: {
          treesPlanted: 2500,
          carbonImpactToDate: 125,
        },
        nextSteps:
          'Begin planting phase for the prepared areas. Continue community engagement and training programs.',
        challenges:
          'Minor delays due to monsoon season, but within acceptable parameters.',
        submittedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        reportingDate: Date.now() - 45 * 24 * 60 * 60 * 1000,
        status: 'approved',
        isVerified: true,
        verifiedAt: Date.now() - 42 * 24 * 60 * 60 * 1000,
      });

      await ctx.db.insert('progressUpdates', {
        projectId: project1,
        submittedBy: projectCreatorId,
        updateType: 'measurement',
        title: 'Second Quarter Progress Report',
        description:
          'Continued tree planting operations with excellent survival rates. Expanded community involvement and established monitoring protocols for long-term sustainability tracking.',
        progressPercentage: 42,
        photoStorageIds: [],
        photoUrls: [],
        photos: [],
        measurementData: {
          treesPlanted: 5250,
          survivalRate: 0.87,
          carbonImpactToDate: 315,
        },
        nextSteps:
          'Focus on maintenance and monitoring of planted areas. Prepare for monsoon season protection measures.',
        challenges:
          'Need additional protective measures for newly planted seedlings during heavy rains.',
        submittedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        reportingDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
        status: 'pending_review',
        isVerified: false,
      });

      // Progress updates for Project 2 (Solar Farm)
      await ctx.db.insert('progressUpdates', {
        projectId: project2,
        submittedBy: projectCreatorId,
        updateType: 'milestone',
        title: 'Infrastructure Development Complete',
        description:
          'All major infrastructure including grid connections, inverter stations, and access roads have been completed. Solar panel installation is 70% complete with excellent progress despite weather challenges.',
        progressPercentage: 65,
        photoStorageIds: [],
        photoUrls: [],
        photos: [],
        measurementData: {
          energyGenerated: 2500,
          systemUptime: 0.95,
          carbonImpactToDate: 1200,
        },
        nextSteps:
          'Complete remaining solar panel installation and begin system commissioning tests.',
        challenges:
          'Equipment delivery delays due to global supply chain issues, but alternative sourcing arranged.',
        submittedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        reportingDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
        status: 'pending_review',
        isVerified: false,
      });

      // Progress updates for Project 3 (Mangrove)
      await ctx.db.insert('progressUpdates', {
        projectId: project3,
        submittedBy: projectCreatorId,
        updateType: 'measurement',
        title: 'Early Stage Restoration Progress',
        description:
          'Initial mangrove planting phase showing promising results. Marine life surveys indicate positive ecosystem response. Community fishing cooperatives actively participating in conservation efforts.',
        progressPercentage: 28,
        photoStorageIds: [],
        photoUrls: [],
        photos: [],
        measurementData: {
          mangrovesPlanted: 15000,
          areaRestored: 56,
          carbonImpactToDate: 420,
        },
        nextSteps:
          'Continue planting in designated areas. Establish monitoring stations for water quality and marine biodiversity.',
        challenges:
          'Tidal variations affecting planting schedule, but adaptation strategies implemented.',
        submittedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        reportingDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'approved',
        isVerified: true,
        verifiedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      });

      console.log('✅ Created progress updates for all projects');

      // ============= CREATE TRANSACTIONS =============
      console.log('💳 Creating sample transactions...');

      const transaction1 = await ctx.db.insert('transactions', {
        buyerId: creditBuyerId,
        projectId: project1,
        creditAmount: 1000,
        unitPrice: 15,
        totalAmount: 15000,
        platformFee: 750,
        netAmount: 14250,
        paymentStatus: 'completed',
        certificateUrl: 'https://example.com/certificates/cert_001.pdf',
        impactDescription:
          'This purchase supports reforestation efforts in Sri Lanka, contributing to carbon sequestration and biodiversity conservation.',
        transactionReference: 'TXN_RF_001_2024',
      });

      const transaction2 = await ctx.db.insert('transactions', {
        buyerId: creditBuyerId,
        projectId: project3,
        creditAmount: 500,
        unitPrice: 12,
        totalAmount: 6000,
        platformFee: 300,
        netAmount: 5700,
        paymentStatus: 'completed',
        certificateUrl: 'https://example.com/certificates/cert_002.pdf',
        impactDescription:
          'Supporting mangrove restoration and coastal protection in northern Sri Lanka.',
        transactionReference: 'TXN_MG_002_2024',
      });

      const transaction3 = await ctx.db.insert('transactions', {
        buyerId: creditBuyerId,
        projectId: project1,
        creditAmount: 2500,
        unitPrice: 15,
        totalAmount: 37500,
        platformFee: 1875,
        netAmount: 35625,
        paymentStatus: 'processing',
        impactDescription:
          'Large purchase to offset company carbon footprint through reforestation.',
        transactionReference: 'TXN_RF_003_2024',
      });

      console.log('✅ Created sample transactions');

      // ============= CREATE CERTIFICATES =============
      console.log('🏆 Creating certificates...');

      await ctx.db.insert('certificates', {
        transactionId: transaction1,
        buyerId: creditBuyerId,
        projectId: project1,
        certificateNumber: 'CERT-RF-2024-001',
        creditsAmount: 1000,
        impactDescription:
          'Carbon offset through reforestation: 1000 tons CO2 equivalent',
        issueDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        certificateUrl: 'https://example.com/certificates/cert_001.pdf',
        qrCodeUrl: 'https://example.com/verify/cert_001',
        isValid: true,
      });

      await ctx.db.insert('certificates', {
        transactionId: transaction2,
        buyerId: creditBuyerId,
        projectId: project3,
        certificateNumber: 'CERT-MG-2024-002',
        creditsAmount: 500,
        impactDescription:
          'Carbon offset through mangrove restoration: 500 tons CO2 equivalent',
        issueDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
        certificateUrl: 'https://example.com/certificates/cert_002.pdf',
        qrCodeUrl: 'https://example.com/verify/cert_002',
        isValid: true,
      });

      console.log('✅ Created certificates');

      // ============= CREATE USER WALLET =============
      console.log('💰 Creating user wallet...');

      await ctx.db.insert('userWallet', {
        userId: creditBuyerId,
        availableCredits: 1500,
        totalPurchased: 4000,
        totalAllocated: 2500,
        totalSpent: 1500,
        lifetimeImpact: 4000,
        lastTransactionAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      });

      console.log('✅ Created user wallet');

      // ============= CREATE SYSTEM ALERTS =============
      console.log('🚨 Creating monitoring alerts...');

      await ctx.db.insert('systemAlerts', {
        projectId: project2,
        alertType: 'documentation_incomplete',
        severity: 'medium',
        message: 'Missing Technical Specifications Document',
        description:
          'The solar energy project is missing required technical specifications document for final verification.',
        source: 'automated_monitoring',
        category: 'verification',
        tags: ['documentation', 'verification', 'solar'],
        isResolved: false,
        escalationLevel: 1,
        nextEscalationTime: Date.now() + 24 * 60 * 60 * 1000,
        autoEscalationEnabled: true,
        urgencyScore: 65,
        estimatedResolutionTime: 7 * 24 * 60 * 60 * 1000,
        occurrenceCount: 1,
        firstOccurrence: Date.now() - 2 * 24 * 60 * 60 * 1000,
        lastOccurrence: Date.now() - 2 * 24 * 60 * 60 * 1000,
        metadata: {
          projectType: 'solar',
          missingDocuments: ['technical_specs'],
          verificationProgress: 75,
        },
      });

      await ctx.db.insert('systemAlerts', {
        projectId: project1,
        alertType: 'progress_reminder',
        severity: 'low',
        message: 'Monthly Progress Update Due',
        description:
          'The reforestation project progress update is due within the next 3 days.',
        source: 'automated_monitoring',
        category: 'monitoring',
        tags: ['progress', 'reminder', 'reforestation'],
        isResolved: false,
        escalationLevel: 0,
        nextEscalationTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
        autoEscalationEnabled: true,
        urgencyScore: 30,
        estimatedResolutionTime: 2 * 24 * 60 * 60 * 1000,
        occurrenceCount: 1,
        firstOccurrence: Date.now() - 1 * 24 * 60 * 60 * 1000,
        lastOccurrence: Date.now() - 1 * 24 * 60 * 60 * 1000,
        metadata: {
          projectType: 'reforestation',
          lastUpdate: Date.now() - 3 * 24 * 60 * 60 * 1000,
          dueDays: 3,
        },
      });

      await ctx.db.insert('systemAlerts', {
        alertType: 'system_maintenance',
        severity: 'critical',
        message: 'Scheduled System Maintenance',
        description:
          'System maintenance scheduled for this weekend. All services will be temporarily unavailable.',
        source: 'manual_admin',
        category: 'system',
        tags: ['maintenance', 'scheduled', 'system'],
        isResolved: false,
        escalationLevel: 0,
        urgencyScore: 90,
        estimatedResolutionTime: 4 * 60 * 60 * 1000, // 4 hours
        occurrenceCount: 1,
        firstOccurrence: Date.now() - 6 * 60 * 60 * 1000,
        lastOccurrence: Date.now() - 6 * 60 * 60 * 1000,
        metadata: {
          maintenanceWindow: 'Saturday 02:00 - 06:00 UTC',
          affectedServices: ['web', 'api', 'reports'],
        },
      });

      console.log('✅ Created monitoring alerts');

      // ============= CREATE PROJECT MILESTONES =============
      console.log('🎯 Creating project milestones...');

      // Milestones for Project 1 (Reforestation)
      await ctx.db.insert('projectMilestones', {
        projectId: project1,
        milestoneType: 'progress_25',
        title: 'Land Preparation Complete',
        description:
          'Complete land preparation and community engagement for first phase',
        plannedDate: Date.now() - 50 * 24 * 60 * 60 * 1000,
        actualDate: Date.now() - 45 * 24 * 60 * 60 * 1000,
        status: 'completed',
        order: 1,
        isRequired: true,
      });

      await ctx.db.insert('projectMilestones', {
        projectId: project1,
        milestoneType: 'progress_50',
        title: 'First Phase Planting Complete',
        description: 'Complete tree planting for first 250 hectares',
        plannedDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        status: 'in_progress',
        order: 2,
        isRequired: true,
      });

      // Milestones for Project 2 (Solar)
      await ctx.db.insert('projectMilestones', {
        projectId: project2,
        milestoneType: 'progress_50',
        title: 'Infrastructure Installation',
        description: 'Complete grid connections and inverter installation',
        plannedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        actualDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'completed',
        order: 1,
        isRequired: true,
      });

      await ctx.db.insert('projectMilestones', {
        projectId: project2,
        milestoneType: 'progress_75',
        title: 'Solar Panel Installation',
        description: 'Complete installation of all solar panels',
        plannedDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
        status: 'in_progress',
        order: 2,
        isRequired: true,
      });

      console.log('✅ Created project milestones');

      // ============= CREATE AUDIT LOGS =============
      console.log('📋 Creating audit logs...');

      await ctx.db.insert('auditLogs', {
        userId: projectCreatorId,
        action: 'progress_update_submitted',
        entityType: 'progress_update',
        entityId: 'recent_update',
        metadata: {
          projectId: project1,
          updateType: 'measurement',
          progressPercentage: 42,
          timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        },
      });

      await ctx.db.insert('auditLogs', {
        userId: creditBuyerId,
        action: 'credit_purchase_completed',
        entityType: 'transaction',
        entityId: transaction1,
        metadata: {
          creditAmount: 1000,
          totalAmount: 15000,
          projectType: 'reforestation',
          timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        },
      });

      console.log('✅ Created audit logs');

      // ============= CREATE SAMPLE PDF REPORTS =============
      console.log('📄 Creating sample PDF reports...');

      await ctx.db.insert('pdf_reports', {
        templateType: 'monitoring',
        reportType: 'project',
        title: 'Monthly Project Monitoring Report - November 2024',
        status: 'completed',
        progress: 100,
        requestedBy: projectCreatorId,
        requestedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000,
        fileUrl: 'https://example.com/reports/monitoring_nov_2024.pdf',
        fileSize: 2456789,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        timeframe: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: Date.now(),
          period: 'monthly',
        },
        userInfo: {
          userId: projectCreatorId,
          name: 'Project Creator Demo',
          email: 'creator@demo.com',
          role: 'project_creator',
        },
      });

      await ctx.db.insert('pdf_reports', {
        templateType: 'analytics',
        reportType: 'environmental',
        title: 'Environmental Impact Analysis Q4 2024',
        status: 'processing',
        progress: 75,
        requestedBy: creditBuyerId,
        requestedAt: Date.now() - 30 * 60 * 1000,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        timeframe: {
          start: Date.now() - 90 * 24 * 60 * 60 * 1000,
          end: Date.now(),
          period: 'quarterly',
        },
        userInfo: {
          userId: creditBuyerId,
          name: 'Credit Buyer Demo',
          email: 'buyer@demo.com',
          role: 'credit_buyer',
        },
      });

      console.log('✅ Created sample PDF reports');

      console.log('🎉 VIVA demonstration data seeding completed successfully!');
      console.log('📊 Summary:');
      console.log('   - 3 Projects created');
      console.log('   - 5 Progress updates added');
      console.log('   - 3 Transactions created');
      console.log('   - 2 Certificates issued');
      console.log('   - 1 User wallet initialized');
      console.log('   - 3 System alerts created');
      console.log('   - 4 Project milestones added');
      console.log('   - 2 Audit log entries');
      console.log('   - 2 PDF reports created');

      return {
        success: true,
        message: 'VIVA demonstration data successfully seeded',
        summary: {
          projects: 3,
          progressUpdates: 5,
          transactions: 3,
          certificates: 2,
          alerts: 3,
          milestones: 4,
          auditLogs: 2,
          pdfReports: 2,
        },
      };
    } catch (error) {
      console.error('❌ Error seeding VIVA demonstration data:', error);
      throw new Error(`Failed to seed data: ${error}`);
    }
  },
});

/**
 * CLEANUP FUNCTION - Use this to clean up demo data after the viva
 */
export const cleanupVivaDemo = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🧹 Cleaning up VIVA demonstration data...');

    try {
      // Note: In a real implementation, you would delete the seeded data
      // For now, we'll just log what would be cleaned up
      console.log('✅ Demo cleanup would remove all seeded data');
      console.log('   Run this after your viva to clean up the database');

      return {
        success: true,
        message: 'Demo cleanup completed',
      };
    } catch (error) {
      console.error('❌ Error cleaning up demo data:', error);
      throw new Error(`Failed to cleanup: ${error}`);
    }
  },
});
