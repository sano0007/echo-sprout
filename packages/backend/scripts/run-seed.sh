#!/bin/bash

echo "🌱 Starting database seeding process..."

# Check if we're in the right directory
if [ ! -f "convex/seed.ts" ]; then
    echo "❌ Error: Must run from packages/backend directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: convex/seed.ts"
    exit 1
fi

# Check if Convex is configured
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "   Please ensure Convex is configured"
    exit 1
fi

echo "🚀 Running seed mutation via Convex CLI..."
echo "   This will create sample users and projects in your database"
echo ""

# Run the seeding mutation using Convex CLI
npx convex run seed:seedDatabase

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seeding completed successfully!"
    echo ""
    echo "🎯 You can now:"
    echo "   1. View projects in your marketplace"
    echo "   2. Test the purchase flow with these sample projects"
    echo "   3. Use the project detail pages"
    echo ""
    echo "📊 Created sample data:"
    echo "   - 3 Organizations (Green Earth Foundation, Solar Power Co, Nordic Wind Solutions)"
    echo "   - 6 Projects (Amazon Rainforest, Solar Farm, Wind Energy, Biogas, Waste-to-Energy, Mangrove)"
else
    echo ""
    echo "💥 Seeding failed!"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Make sure Convex is running: npx convex dev"
    echo "   2. Check that you're in packages/backend directory"
    echo "   3. Verify your .env.local file has CONVEX_DEPLOYMENT set"
    echo ""
    echo "Quick fix:"
    echo "   cd packages/backend"
    echo "   npx convex dev  # In another terminal"
    echo "   ./scripts/run-seed.sh  # Run this script again"
    exit 1
fi