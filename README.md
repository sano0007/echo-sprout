# EcoSprout - Carbon Credit Marketplace Platform

A comprehensive carbon credit marketplace platform connecting project developers, verifiers, and buyers in the fight
against climate change.

## 🌱 About

EcoSprout is a transparent carbon credit marketplace that facilitates the entire carbon credit lifecycle from project
registration to verification and trading. Built as a modern web application using Next.js, TypeScript, and cutting-edge
technologies.

### Key Stakeholders

- **Project Creators** - Register and manage carbon credit projects
- **Verifiers** - Review and validate projects against international standards
- **Buyers** - Purchase carbon credits and track environmental impact
- **Community** - Access educational content and resources

## 🏗️ Architecture

This is a monorepo built with Turbo containing:

- **`apps/web`** - Main Next.js web application
- **`packages/`** - Shared packages and utilities

## 🚀 Quick Start

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd echo-sprout
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

4. **Run the development server**

   ```bash
   cd apps/web
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
echo-sprout/
├── apps/
│   └── web/                      # Main Next.js application
│       ├── app/                  # Next.js App Router pages
│       ├── components/           # React components
│       ├── lib/                  # Utility libraries
│       └── README.md            # Detailed web app documentation
├── packages/                     # Shared packages
├── turbo.json                   # Turbo configuration
└── README.md                    # This file
```

## ✨ Features Overview

### 🏗️ Project Management

- Multi-step project registration wizard
- Real-time progress tracking
- Document management system
- Milestone and reporting tools

### 🛒 Marketplace

- Credit browsing and filtering
- Secure transaction processing
- Impact metrics and certificates
- Price tracking and analytics

### ✅ Verification System

- Professional verifier dashboard
- Standards compliance (VCS, Gold Standard, CCBS)
- Review workflows and feedback
- Automated validation tools

### 📊 Monitoring & Analytics

- Real-time project monitoring
- Environmental impact visualization
- CO₂ offset calculations
- Progress reporting dashboards

### 🎓 Educational Hub

- Structured learning modules
- Implementation guides
- Community blog and forums
- Best practices library

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, React
- **Authentication**: Clerk
- **Backend**: Convex (Backend-as-a-Service)
- **Build System**: Turbo (monorepo)
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v3

## 📚 Documentation

For detailed documentation about the web application, including:

- Complete feature documentation
- API reference
- Development guidelines
- Deployment instructions
- Troubleshooting guide

**See: [`apps/web/README.md`](./apps/web/README.md)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`bun run lint`, `bun run type-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🌍 Environmental Impact

EcoSprout aims to accelerate climate action by:

- Making carbon credit markets more transparent and accessible
- Supporting project developers with better tools and resources
- Enabling buyers to make informed decisions about carbon offsets
- Fostering a community of climate action advocates

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Carbon credit standards organizations
- Environmental science community
- Climate action initiatives
- Open source contributors

---

**Made with 💚 for a sustainable future**
