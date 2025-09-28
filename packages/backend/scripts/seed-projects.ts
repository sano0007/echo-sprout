import { ConvexHttpClient } from 'convex/browser';

// Initialize the Convex client - you'll need to set this URL
const client = new ConvexHttpClient(process.env.CONVEX_URL || '');

interface SeedProject {
  title: string;
  description: string;
  projectType:
    | 'reforestation'
    | 'solar'
    | 'wind'
    | 'biogas'
    | 'waste_management'
    | 'mangrove_restoration';
  location: {
    lat: number;
    long: number;
    name: string;
  };
  areaSize: number;
  estimatedCO2Reduction: number;
  budget: number;
  startDate: string;
  expectedCompletionDate: string;
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'active'
    | 'completed'
    | 'suspended';
  verificationStatus:
    | 'pending'
    | 'in_progress'
    | 'verified'
    | 'rejected'
    | 'revision_required';
  totalCarbonCredits: number;
  pricePerCredit: number;
  creditsAvailable: number;
  creditsSold: number;
  requiredDocuments: string[];
  submittedDocuments: string[];
  isDocumentationComplete: boolean;
}

const seedProjects: SeedProject[] = [
  {
    title: 'Amazon Rainforest Conservation',
    description:
      'A comprehensive reforestation project aimed at restoring 1000 hectares of degraded rainforest land in the Amazon Basin. This project focuses on native species replanting and community engagement.',
    projectType: 'reforestation',
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
    status: 'active',
    verificationStatus: 'verified',
    totalCarbonCredits: 2000,
    pricePerCredit: 15,
    creditsAvailable: 1500,
    creditsSold: 500,
    requiredDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    submittedDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    isDocumentationComplete: true,
  },
  {
    title: 'Solar Farm Initiative - Rajasthan',
    description:
      'Large-scale solar energy project in the Thar Desert, providing clean energy to over 50,000 households while creating local employment opportunities.',
    projectType: 'solar',
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
    status: 'active',
    verificationStatus: 'verified',
    totalCarbonCredits: 1500,
    pricePerCredit: 22,
    creditsAvailable: 1200,
    creditsSold: 300,
    requiredDocuments: ['project_plan', 'technical_specs', 'permits'],
    submittedDocuments: ['project_plan', 'technical_specs', 'permits'],
    isDocumentationComplete: true,
  },
  {
    title: 'Offshore Wind Energy Project',
    description:
      'Modern offshore wind farm generating renewable energy equivalent to powering 100,000 homes annually, reducing dependency on fossil fuels.',
    projectType: 'wind',
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
    status: 'under_review',
    verificationStatus: 'pending',
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
  },
  {
    title: 'Community Biogas Development',
    description:
      'Rural biogas project converting agricultural waste into clean energy, serving 500 farming families while managing organic waste sustainably.',
    projectType: 'biogas',
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
    status: 'active',
    verificationStatus: 'in_progress',
    totalCarbonCredits: 800,
    pricePerCredit: 12,
    creditsAvailable: 650,
    creditsSold: 150,
    requiredDocuments: ['project_plan', 'permits', 'technical_specs'],
    submittedDocuments: ['project_plan', 'permits', 'technical_specs'],
    isDocumentationComplete: true,
  },
  {
    title: 'Urban Waste-to-Energy Facility',
    description:
      'Advanced waste management facility processing 500 tons of municipal waste daily, generating clean electricity while reducing landfill impact.',
    projectType: 'waste_management',
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
    status: 'approved',
    verificationStatus: 'verified',
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
  },
  {
    title: 'Mangrove Ecosystem Restoration',
    description:
      'Coastal mangrove restoration protecting 800 hectares of coastline while supporting marine biodiversity and local fishing communities.',
    projectType: 'mangrove_restoration',
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
    status: 'active',
    verificationStatus: 'verified',
    totalCarbonCredits: 1200,
    pricePerCredit: 16,
    creditsAvailable: 900,
    creditsSold: 300,
    requiredDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    submittedDocuments: ['project_plan', 'environmental_assessment', 'permits'],
    isDocumentationComplete: true,
  },
];

// Function to create a user (project creator)
async function createUser(userData: any) {
  try {
    // This would need to be adapted based on your user creation API
    console.log('Creating user:', userData.email);
    // You'll need to implement the actual user creation logic here
    return { _id: `user_${Math.random().toString(36).substr(2, 9)}` };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Function to seed a single project
async function seedProject(projectData: SeedProject, creatorId: string) {
  try {
    console.log(`Seeding project: ${projectData.title}`);

    // You'll need to call your Convex mutation here
    // This is a placeholder - you'll need to implement the actual Convex call
    const result = await client.mutation('projects:create' as any, {
      creatorId,
      ...projectData,
    });

    console.log(`✅ Successfully created project: ${projectData.title}`);
    return result;
  } catch (error) {
    console.error(`❌ Error creating project ${projectData.title}:`, error);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample users first (project creators)
    const users = await Promise.all([
      createUser({
        email: 'green.earth@example.com',
        firstName: 'Green',
        lastName: 'Earth',
        organizationName: 'Green Earth Foundation',
        role: 'project_creator',
        phoneNumber: '+1-555-0101',
        address: '123 Eco Street',
        city: 'San Francisco',
        country: 'USA',
        isVerified: true,
        clerkId: `clerk_${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
      }),
      createUser({
        email: 'solar.power@example.com',
        firstName: 'Solar',
        lastName: 'Industries',
        organizationName: 'Solar Power Co',
        role: 'project_creator',
        phoneNumber: '+91-98765-43210',
        address: '456 Solar Avenue',
        city: 'Mumbai',
        country: 'India',
        isVerified: true,
        clerkId: `clerk_${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
      }),
    ]);

    // Seed projects with different creators
    const projectPromises = seedProjects.map((project, index) => {
      const creatorId = users[index % users.length]!._id;
      return seedProject(project, creatorId);
    });

    await Promise.all(projectPromises);

    console.log('🎉 Database seeding completed successfully!');
    console.log(
      `📊 Created ${users.length} users and ${seedProjects.length} projects`
    );
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    process.exit(1);
  }
}

// Execute the seeding if this file is run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase, seedProjects };
