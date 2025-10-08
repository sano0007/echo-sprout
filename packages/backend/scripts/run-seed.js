#!/usr/bin/env node

/**
 * Database Seeding Script
 *
 * This script seeds the database with sample users and projects using Convex CLI.
 *
 * Usage:
 *   node scripts/run-seed.js
 *
 * Requirements:
 *   - Run from packages/backend directory
 *   - Have Convex configured (.env.local with CONVEX_DEPLOYMENT)
 *   - Optionally have npx convex dev running
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkEnvironment() {
  // Check if we're in the right directory
  if (!fs.existsSync('convex/seed.ts')) {
    console.error("❌ Error: Must run from packages/backend directory");
    console.error("   Current directory:", process.cwd());
    console.error("   Expected files: convex/seed.ts");
    process.exit(1);
  }

  // Check if Convex is configured
  if (!fs.existsSync('.env.local')) {
    console.error("❌ Error: .env.local file not found");
    console.error("   Please ensure Convex is configured");
    console.error("   Run: npx convex dev");
    process.exit(1);
  }

  console.log("✅ Environment checks passed");
}

async function runSeeding() {
  console.log("🌱 Starting database seeding process...");

  checkEnvironment();

  try {
    console.log("🚀 Running seed mutation via Convex CLI...");
    console.log("   This will create sample users and projects in your database");
    console.log("");

    // Run the seeding mutation using Convex CLI
    const output = execSync('npx convex run seed:seedDatabase', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log("✅ Seeding completed successfully!");
    console.log("");
    console.log("📊 Created sample data:");
    console.log("   - 3 Organizations (Green Earth Foundation, Solar Power Co, Nordic Wind Solutions)");
    console.log("   - 6 Projects (Amazon Rainforest, Solar Farm, Wind Energy, Biogas, Waste-to-Energy, Mangrove)");
    console.log("");
    console.log("🎯 You can now:");
    console.log("   1. View projects in your marketplace");
    console.log("   2. Test the purchase flow with these sample projects");
    console.log("   3. Use the project detail pages");

    // Show the actual output from Convex if it contains useful info
    if (output.trim()) {
      console.log("");
      console.log("📋 Convex output:");
      console.log(output);
    }

  } catch (error) {
    console.error("💥 Seeding failed!");
    console.error("");

    if (error.message.includes('No deployment')) {
      console.error("🔍 Issue: No Convex deployment found");
      console.error("   Solution: Start Convex development server");
      console.error("   Run: npx convex dev");
    } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
      console.error("🔍 Issue: Seed mutations not found");
      console.error("   Solution: Make sure mutations are deployed");
      console.error("   1. Run: npx convex dev");
      console.error("   2. Wait for deployment to complete");
      console.error("   3. Try seeding again");
    } else {
      console.error("🔍 Error details:", error.message);
      console.error("");
      console.error("   Troubleshooting steps:");
      console.error("   1. Ensure you're in packages/backend directory");
      console.error("   2. Run: npx convex dev");
      console.error("   3. Wait for deployment, then try again");
    }

    console.error("");
    console.error("Quick fix commands:");
    console.error("   cd packages/backend");
    console.error("   npx convex dev  # In another terminal, wait for deployment");
    console.error("   node scripts/run-seed.js  # Run this script again");

    process.exit(1);
  }
}

// Clear data function using Convex CLI
async function clearData() {
  console.log("🧹 Clearing all data...");

  checkEnvironment();

  try {
    console.log("🚀 Running clear data mutation via Convex CLI...");

    const output = execSync('npx convex run seed:clearAllData', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log("✅ Data cleared successfully!");

    if (output.trim()) {
      console.log("");
      console.log("📋 Convex output:");
      console.log(output);
    }

  } catch (error) {
    console.error("💥 Clear data failed:", error.message);
    console.error("");
    console.error("Make sure Convex is running: npx convex dev");
    process.exit(1);
  }
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'clear') {
  clearData();
} else if (command === 'seed' || !command) {
  runSeeding();
} else {
  console.log("Usage:");
  console.log("  node scripts/run-seed.js [command]");
  console.log("");
  console.log("Commands:");
  console.log("  seed (default)  - Seed the database with sample data");
  console.log("  clear          - Clear all data from database");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/run-seed.js");
  console.log("  node scripts/run-seed.js seed");
  console.log("  node scripts/run-seed.js clear");
  console.log("");
  console.log("Prerequisites:");
  console.log("  1. cd packages/backend");
  console.log("  2. npx convex dev  # In another terminal");
  console.log("  3. Wait for deployment to complete");
  console.log("  4. Run this script");
}