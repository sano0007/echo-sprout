# EcoSprout - Carbon Credit Marketplace Platform

A comprehensive carbon credit marketplace platform connecting project developers, verifiers, and buyers in the fight
against climate change. Built with Next.js 15, TypeScript, and modern web technologies.

## 🌱 Overview

EcoSprout is a transparent carbon credit marketplace that facilitates the entire carbon credit lifecycle from project
registration to verification and trading. The platform enables:

- **Project Creators** to register and manage carbon credit projects
- **Verifiers** to review and validate projects against international standards
- **Buyers** to purchase carbon credits and track environmental impact
- **Educational Hub** for learning about carbon credits and sustainability

## ✨ Key Features

### 🏗️ Project Management

- Multi-step project registration wizard
- Comprehensive project documentation system
- Progress tracking and milestone management
- Real-time monitoring dashboards

### 🛒 Marketplace

- Browse and filter carbon credits by type, price, and verification status
- Detailed project information with impact metrics
- Secure transaction processing
- Certificate generation and management

### ✅ Verification System

- Professional verifier dashboard
- Document review and validation workflows
- Support for VCS, Gold Standard, and CCBS standards
- Structured review process with feedback mechanisms

### 📊 Impact Tracking

- Real-time project monitoring
- Environmental impact visualization
- CO₂ offset calculations
- Progress reporting and analytics

### 🎓 Educational Content

- Structured learning modules
- Step-by-step implementation guides
- Community blog and knowledge sharing
- Best practices and case studies

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v3** - Utility-first CSS framework
- **React** - UI library

### Authentication & Backend

- **Clerk** - Authentication and user management
- **Convex** - Backend-as-a-Service for real-time data

### Tools & Infrastructure

- **Bun** - Fast JavaScript runtime and package manager
- **Turbo** - Monorepo build system
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd echo-sprout/apps/web
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following environment variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Convex Database
   CONVEX_DEPLOYMENT=your_convex_deployment
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

4. **Run the development server**

   ```bash
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
apps/web/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages
│   │   ├── register/             # User registration wizard
│   │   └── login/                # User login
│   ├── marketplace/              # Carbon credit marketplace
│   ├── projects/                 # Project management
│   │   ├── register/             # Project registration wizard
│   │   └── manage/               # Project management dashboard
│   ├── verification/             # Verification system
│   │   ├── dashboard/            # Verifier dashboard
│   │   └── review/               # Project review pages
│   ├── monitoring/               # Project monitoring
│   ├── buyer-dashboard/          # Buyer impact tracking
│   ├── profile/                  # User profiles
│   ├── learn/                    # Educational content hub
│   ├── community/                # Community features
│   └── layout.tsx                # Root layout with navigation
├── components/                   # Reusable components
│   ├── Navigation.tsx            # Main navigation component
│   └── Footer.tsx                # Footer component
├── lib/                          # Utility libraries
├── public/                       # Static assets
└── styles/                       # Global styles
    └── globals.css               # Tailwind CSS imports
```

## 🎯 User Roles & Permissions

### Project Creators

- Register new carbon credit projects
- Upload project documentation
- Track project progress and milestones
- Submit verification requests
- Generate carbon credits upon approval

### Verifiers

- Review project submissions
- Validate against certification standards
- Request additional documentation
- Approve or reject projects
- Generate verification reports

### Credit Buyers

- Browse available carbon credits
- Purchase credits for offset programs
- Track environmental impact
- Download certificates
- Monitor project progress

### Administrators

- Manage platform users and roles
- Oversee verification processes
- Generate platform analytics
- Configure system settings

## 🌍 Supported Project Types

- **Reforestation & Afforestation** - Forest restoration projects
- **Renewable Energy** - Solar, wind, and hydroelectric projects
- **Energy Efficiency** - Building and industrial efficiency improvements
- **Waste Management** - Methane capture and waste-to-energy
- **Agriculture** - Sustainable farming and soil carbon sequestration
- **Blue Carbon** - Coastal ecosystem restoration

## 🔒 Security Features

- **Authentication** - Secure user authentication via Clerk
- **Data Validation** - Server-side validation for all inputs
- **Role-Based Access** - Granular permissions system
- **Document Security** - Encrypted document storage
- **Audit Trails** - Complete activity logging

## 🧪 Testing

```bash
# Run tests
bun test

# Run tests with coverage
bun test:coverage

# Run end-to-end tests
bun test:e2e
```

## 🚀 Deployment

### Production Build

```bash
bun run build
```

### Environment Setup

1. Configure production environment variables
2. Set up Clerk production instance
3. Deploy Convex backend
4. Configure domain and SSL

### Deployment Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS**
- **Google Cloud Platform**

## 📝 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing component patterns
- Implement responsive design principles
- Write descriptive component and variable names

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

### Component Development

- Create reusable components in `/components`
- Use Tailwind CSS for styling
- Implement proper TypeScript interfaces
- Follow accessibility best practices

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   bun run lint
   bun run type-check
   bun test
   ```
5. **Commit your changes**
6. **Push to your branch**
7. **Create a Pull Request**

## 📖 API Documentation

### Authentication

All authenticated routes require a valid Clerk session token.

### Project Management

- `GET /api/projects` - List projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `GET /api/projects/:id` - Get project details

### Marketplace

- `GET /api/marketplace/credits` - List available credits
- `POST /api/marketplace/purchase` - Purchase credits
- `GET /api/marketplace/certificates` - Get certificates

### Verification

- `GET /api/verification/queue` - Verification queue
- `POST /api/verification/review` - Submit review
- `PUT /api/verification/approve` - Approve project

## 🐛 Troubleshooting

### Common Issues

**Hydration Errors**

- Ensure server and client rendering match
- Use `suppressHydrationWarning` for dynamic content

**Tailwind Styles Not Loading**

- Check PostCSS configuration
- Verify Tailwind CSS imports in globals.css

**Authentication Issues**

- Verify Clerk environment variables
- Check authentication middleware setup

**Build Errors**

- Run `bun run type-check` for TypeScript errors
- Check for missing dependencies

## 📊 Performance Optimization

- **Image Optimization** - Next.js Image component
- **Code Splitting** - Automatic route-based splitting
- **Bundle Analysis** - Regular bundle size monitoring
- **Caching Strategy** - ISR and API route caching
- **Database Optimization** - Efficient Convex queries

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Carbon Credit Standards](https://verra.org/project/vcs-program/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Carbon credit standards organizations
- Environmental science community
- Open source contributors
- Climate action initiatives

---

**Made with 💚 for a sustainable future**

For questions, support, or contributions, please reach out through our community channels or create an issue in this
repository.
