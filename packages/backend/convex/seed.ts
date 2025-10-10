import { internalMutation } from './_generated/server';
import { internal } from './_generated/api';

// Seed data for users
const seedUsers = [
  {
    email: 'green.earth@example.com',
    firstName: 'Green',
    lastName: 'Earth',
    organizationName: 'Green Earth Foundation',
    organizationType: 'Non-Profit',
    role: 'project_creator' as const,
    phoneNumber: '+1-555-0101',
    address: '123 Eco Street',
    city: 'San Francisco',
    country: 'USA',
    isVerified: true,
    clerkId: `clerk_green_earth_${Date.now()}`,
    isActive: true,
  },
  {
    email: 'solar.power@example.com',
    firstName: 'Solar',
    lastName: 'Industries',
    organizationName: 'Solar Power Co',
    organizationType: 'Corporation',
    role: 'project_creator' as const,
    phoneNumber: '+91-98765-43210',
    address: '456 Solar Avenue',
    city: 'Mumbai',
    country: 'India',
    isVerified: true,
    clerkId: `clerk_solar_power_${Date.now()}`,
    isActive: true,
  },
  {
    email: 'wind.energy@example.com',
    firstName: 'Wind',
    lastName: 'Energy',
    organizationName: 'Nordic Wind Solutions',
    organizationType: 'Corporation',
    role: 'project_creator' as const,
    phoneNumber: '+45-12345678',
    address: '789 Wind Lane',
    city: 'Copenhagen',
    country: 'Denmark',
    isVerified: true,
    clerkId: `clerk_wind_energy_${Date.now()}`,
    isActive: true,
  },
];

// Seed data for projects
const seedProjects = [
  {
    title: 'Amazon Rainforest Conservation',
    description:
      'A comprehensive reforestation project aimed at restoring 1000 hectares of degraded rainforest land in the Amazon Basin. This project focuses on native species replanting and community engagement.',
    projectType: 'reforestation' as const,
    location: {
      lat: -3.4653,
      long: -62.2159,
      name: 'Amazon Basin, Brazil',
    },
    areaSize: 1000,
    estimatedCO2Reduction: 75000,
    budget: 500000,
    startDate: '2024-01-15',
    expectedCompletionDate: '2027-01-15',
    status: 'active' as const,
    verificationStatus: 'verified' as const,
    totalCarbonCredits: 2000,
    pricePerCredit: 15,
    creditsAvailable: 1500,
    creditsSold: 500,
    requiredDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    submittedDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    isDocumentationComplete: true,
    images: [
      'https://www.arbioperu.org/wp-content/uploads/2021/10/Bosque-de-ARBIO-1024x683.jpg',
      'https://static.wixstatic.com/media/d591f0_8a621b09e6a74db5bf4d1bb1f5630fd2~mv2.jpg/v1/fill/w_640,h_514,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/d591f0_8a621b09e6a74db5bf4d1bb1f5630fd2~mv2.jpg',
      'https://news.vt.edu/content/dam/news_vt_edu/articles/2015/07/images/070815-cnre-kirstensilvius.jpeg',
    ],
  },
  {
    title: 'Solar Farm Initiative - Rajasthan',
    description:
      'Large-scale solar energy project in the Thar Desert, providing clean energy to over 50,000 households while creating local employment opportunities.',
    projectType: 'solar' as const,
    location: {
      lat: 27.0238,
      long: 74.2179,
      name: 'Rajasthan, India',
    },
    areaSize: 200,
    estimatedCO2Reduction: 45000,
    budget: 2000000,
    startDate: '2024-03-01',
    expectedCompletionDate: '2025-12-31',
    status: 'active' as const,
    verificationStatus: 'verified' as const,
    totalCarbonCredits: 1500,
    pricePerCredit: 22,
    creditsAvailable: 1200,
    creditsSold: 300,
    requiredDocuments: ['project_plan', 'technical_specs', 'permits'],
    submittedDocuments: ['project_plan', 'technical_specs', 'permits'],
    isDocumentationComplete: true,
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Offshore Wind Energy Project',
    description:
      'Modern offshore wind farm generating renewable energy equivalent to powering 100,000 homes annually, reducing dependency on fossil fuels.',
    projectType: 'wind' as const,
    location: {
      lat: 55.7558,
      long: 12.5659,
      name: 'North Sea, Denmark',
    },
    areaSize: 50,
    estimatedCO2Reduction: 120000,
    budget: 5000000,
    startDate: '2024-06-01',
    expectedCompletionDate: '2026-08-31',
    status: 'under_review' as const,
    verificationStatus: 'pending' as const,
    totalCarbonCredits: 3000,
    pricePerCredit: 18,
    creditsAvailable: 3000,
    creditsSold: 0,
    requiredDocuments: [
      'project_plan',
      'environmental_assessment',
      'technical_specs',
    ],
    submittedDocuments: ['project_plan', 'environmental_assessment'],
    isDocumentationComplete: false,
    images: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Community Biogas Development',
    description:
      'Rural biogas project converting agricultural waste into clean energy, serving 500 farming families while managing organic waste sustainably.',
    projectType: 'biogas' as const,
    location: {
      lat: 52.52,
      long: 13.405,
      name: 'Brandenburg, Germany',
    },
    areaSize: 25,
    estimatedCO2Reduction: 15000,
    budget: 300000,
    startDate: '2024-02-01',
    expectedCompletionDate: '2024-11-30',
    status: 'active' as const,
    verificationStatus: 'in_progress' as const,
    totalCarbonCredits: 800,
    pricePerCredit: 12,
    creditsAvailable: 650,
    creditsSold: 150,
    requiredDocuments: ['project_plan', 'permits', 'technical_specs'],
    submittedDocuments: ['project_plan', 'permits', 'technical_specs'],
    isDocumentationComplete: true,
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566273043309-6c7aea60a1f0?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Urban Waste-to-Energy Facility',
    description:
      'Advanced waste management facility processing 500 tons of municipal waste daily, generating clean electricity while reducing landfill impact.',
    projectType: 'waste_management' as const,
    location: {
      lat: 40.7128,
      long: -74.006,
      name: 'New York, USA',
    },
    areaSize: 15,
    estimatedCO2Reduction: 85000,
    budget: 8000000,
    startDate: '2024-04-01',
    expectedCompletionDate: '2026-03-31',
    status: 'approved' as const,
    verificationStatus: 'verified' as const,
    totalCarbonCredits: 2500,
    pricePerCredit: 25,
    creditsAvailable: 2500,
    creditsSold: 0,
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
      'technical_specs',
    ],
    isDocumentationComplete: true,
    images: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1569163364945-7ee69e10e0e1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Mangrove Ecosystem Restoration',
    description:
      'Coastal mangrove restoration protecting 800 hectares of coastline while supporting marine biodiversity and local fishing communities.',
    projectType: 'mangrove_restoration' as const,
    location: {
      lat: 13.0827,
      long: 80.2707,
      name: 'Tamil Nadu, India',
    },
    areaSize: 800,
    estimatedCO2Reduction: 35000,
    budget: 400000,
    startDate: '2024-01-01',
    expectedCompletionDate: '2025-12-31',
    status: 'active' as const,
    verificationStatus: 'verified' as const,
    totalCarbonCredits: 1200,
    pricePerCredit: 16,
    creditsAvailable: 900,
    creditsSold: 300,
    requiredDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    submittedDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    isDocumentationComplete: true,
    images: [
      'https://images.unsplash.com/photo-1582578598774-a377d4f33bb7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&h=600&fit=crop',
    ],
  },
];

export const seedDatabase = internalMutation({
  handler: async (ctx) => {
    console.log('🌱 Starting database seeding...');

    try {
      // Clear existing data
      console.log('🧹 Clearing existing data...');

      // Delete existing projects
      const existingProjects = await ctx.db.query('projects').collect();
      for (const project of existingProjects) {
        await ctx.db.delete(project._id);
      }

      // Get existing users for project creation
      console.log('👥 Finding existing users...');
      const existingUsers = await ctx.db.query('users').collect();

      if (existingUsers.length === 0) {
        throw new Error(
          'No users found in database. Please create users first before seeding projects.'
        );
      }

      console.log(
        `Found ${existingUsers.length} existing users for project creation`
      );

      // Create projects
      console.log('🏗️ Creating projects...');
      const createdProjects = [];

      for (let i = 0; i < seedProjects.length; i++) {
        const projectData = seedProjects[i];
        const creatorId = existingUsers[i % existingUsers.length]._id;

        const projectId = await ctx.runMutation(
          internal.projects.createProjectForSeeding,
          {
            creatorId,
            ...projectData,
          }
        );

        createdProjects.push(projectId);
        console.log(`✅ Created project: ${projectData.title}`);
      }

      const result = {
        message: '🎉 Database seeding completed successfully!',
        summary: {
          usersFound: existingUsers.length,
          projectsCreated: createdProjects.length,
        },
        projectIds: createdProjects,
      };

      console.log(result.message);
      console.log(
        `📊 Found ${result.summary.usersFound} existing users and created ${result.summary.projectsCreated} projects`
      );

      return result;
    } catch (error) {
      console.error('💥 Database seeding failed:', error);
      throw error;
    }
  },
});

// Helper function to clear all data (use with caution!)
export const clearAllData = internalMutation({
  handler: async (ctx) => {
    console.log('🧹 Clearing all data...');

    // Delete all projects
    const projects = await ctx.db.query('projects').collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    // Delete all users
    const users = await ctx.db.query('users').collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // Delete all transactions
    const transactions = await ctx.db.query('transactions').collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    return {
      message: 'All data cleared successfully',
      deletedCounts: {
        projects: projects.length,
        users: users.length,
        transactions: transactions.length,
      },
    };
  },
});
