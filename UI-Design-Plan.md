# EcoSprout UI/UX Design Plan
*Comprehensive Dashboard Design Specifications*

Created: September 27, 2025

---

## Table of Contents
1. [Design System Overview](#design-system-overview)
2. [Color Palette & Typography](#color-palette--typography)
3. [Component Library](#component-library)
4. [Project Creator Dashboard](#project-creator-dashboard)
5. [Credit Buyer Dashboard](#credit-buyer-dashboard)
6. [Verifier Dashboard](#verifier-dashboard)
7. [System Administrator Dashboard](#system-administrator-dashboard)
8. [Additional Systems](#additional-systems)
9. [Responsive Design Guidelines](#responsive-design-guidelines)
10. [Accessibility Standards](#accessibility-standards)
11. [Implementation Guidelines](#implementation-guidelines)

---

## Design System Overview

### Core Design Principles
- **Sustainability First**: Visual language that reflects environmental consciousness
- **Trust & Transparency**: Clear information hierarchy and verification indicators
- **Efficiency**: Streamlined workflows with minimal cognitive load
- **Accessibility**: WCAG 2.1 AA compliance across all interfaces
- **Consistency**: Unified experience across all user roles

### Technology Stack Integration
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Icons**: Lucide React icon library
- **Charts**: shadcn/ui charts for data visualization
- **Framework**: Next.js 15 with TypeScript
- **State Management**: Zustand for complex state scenarios

---

## Color Palette & Typography

### Primary Color System
Based on the provided color palette:

```css
/* Primary Colors */
--rich-black: #0B0B0B        /* Primary text, navigation */
--dark: #2C2C2C              /* Secondary text, borders */
--bangladesh-green: #006A4E   /* Primary CTAs, success states */
--mountain-meadow: #2ECC71    /* Secondary actions, progress */
--caribbean-green: #00F5B8    /* Accents, highlights */
--anti-flash-white: #F1F2F6   /* Backgrounds, cards */

/* Semantic Colors */
--success: var(--bangladesh-green)
--warning: #F39C12
--error: #E74C3C
--info: #3498DB
```

### Typography Scale
```css
/* Font Families */
--font-primary: 'Inter', system-ui, sans-serif
--font-mono: 'JetBrains Mono', monospace

/* Type Scale */
--text-xs: 0.75rem     /* 12px */
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem   /* 30px */
--text-4xl: 2.25rem    /* 36px */
```

---

## Component Library

### Core UI Components (shadcn/ui based)

#### 1. Navigation Components
```typescript
// Primary Navigation
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[];
}

// Sidebar Navigation
<Navigation
  items={navItems}
  collapsed={isCollapsed}
  userRole="project-creator"
  className="bg-rich-black text-anti-flash-white"
/>
```

#### 2. Dashboard Cards
```typescript
// Metric Card
<Card className="p-6 bg-anti-flash-white border-bangladesh-green/20">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-dark flex items-center gap-2">
      <TrendingUp className="h-4 w-4" />
      Total Credits Sold
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-rich-black">1,234</div>
    <p className="text-xs text-mountain-meadow">+20.1% from last month</p>
  </CardContent>
</Card>
```

#### 3. Data Tables
```typescript
// Project Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Project Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Credits Available</TableHead>
      <TableHead>Price</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {projects.map((project) => (
      <TableRow key={project.id}>
        <TableCell className="font-medium">{project.name}</TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(project.status)}>
            {project.status}
          </Badge>
        </TableCell>
        <TableCell>{project.creditsAvailable}</TableCell>
        <TableCell>${project.price}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### 4. Status Indicators
```typescript
// Verification Status Badge
const statusConfig = {
  pending: { color: 'warning', icon: Clock },
  in_review: { color: 'info', icon: Eye },
  approved: { color: 'success', icon: CheckCircle },
  rejected: { color: 'error', icon: XCircle }
};

<Badge
  variant={statusConfig[status].color}
  className="flex items-center gap-1"
>
  <statusConfig[status].icon className="h-3 w-3" />
  {status.replace('_', ' ').toUpperCase()}
</Badge>
```

#### 5. Progress Components
```typescript
// Project Progress Bar
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Project Progress</span>
    <span>65%</span>
  </div>
  <Progress value={65} className="h-2" />
  <div className="flex justify-between text-xs text-dark">
    <span>Started: Jan 2025</span>
    <span>Est. Completion: Dec 2025</span>
  </div>
</div>
```

---

## Project Creator Dashboard

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ Header: Logo, User Menu, Notifications             │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────────────────────────────────┐ │
│ │         │ │                                     │ │
│ │ Side    │ │ Main Content Area                   │ │
│ │ Nav     │ │                                     │ │
│ │         │ │                                     │ │
│ │         │ │                                     │ │
│ └─────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 1. Dashboard Overview Page
```typescript
// Key Metrics Section
const MetricsGrid = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <MetricCard
      title="Active Projects"
      value="8"
      change="+2"
      changeType="positive"
      icon={FolderOpen}
    />
    <MetricCard
      title="Total Credits Sold"
      value="12,453"
      change="+1,234"
      changeType="positive"
      icon={TrendingUp}
    />
    <MetricCard
      title="Revenue This Month"
      value="$18,750"
      change="+15%"
      changeType="positive"
      icon={DollarSign}
    />
    <MetricCard
      title="Pending Verifications"
      value="3"
      change="0"
      changeType="neutral"
      icon={Clock}
    />
  </div>
);

// Recent Activity Feed
const ActivityFeed = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="rounded-full bg-bangladesh-green/10 p-2">
              <activity.icon className="h-4 w-4 text-bangladesh-green" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-dark">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
```

### 2. Project Management Interface
```typescript
// Project Creation Wizard
const ProjectWizard = () => {
  const steps = [
    { id: 'basic', title: 'Basic Information', icon: FileText },
    { id: 'details', title: 'Project Details', icon: MapPin },
    { id: 'impact', title: 'Environmental Impact', icon: Leaf },
    { id: 'timeline', title: 'Timeline & Milestones', icon: Calendar },
    { id: 'documents', title: 'Documentation', icon: Upload },
    { id: 'review', title: 'Review & Submit', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">
      <StepperNavigation steps={steps} currentStep={currentStep} />
      <Card className="p-6">
        {renderStepContent(currentStep)}
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          {isLastStep ? 'Submit for Verification' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
```

### 3. Progress Reporting Interface
```typescript
// Monthly Report Form
const ProgressReportForm = () => (
  <form className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={form.control}
        name="projectStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="completionPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Completion Percentage</FormLabel>
            <FormControl>
              <Input type="number" min="0" max="100" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>

    <ImageUploadField
      name="progressPhotos"
      label="Progress Photos"
      description="Upload photos showing current project status"
      multiple
    />

    <MetricsInputSection />

    <Button type="submit" className="w-full">
      Submit Progress Report
    </Button>
  </form>
);
```

### 4. Revenue Analytics Dashboard
```typescript
// Revenue Charts
const RevenueAnalytics = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--bangladesh-green)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credits Sold by Project</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={creditsByProject}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {creditsByProject.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);
```

### Navigation Structure
```typescript
const creatorNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/creator/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Projects',
    href: '/creator/projects',
    icon: FolderOpen,
    children: [
      { label: 'All Projects', href: '/creator/projects', icon: List },
      { label: 'Create New', href: '/creator/projects/new', icon: Plus },
      { label: 'Drafts', href: '/creator/projects/drafts', icon: FileText }
    ]
  },
  {
    label: 'Progress Reports',
    href: '/creator/reports',
    icon: BarChart3,
    badge: 2 // pending reports
  },
  {
    label: 'Revenue',
    href: '/creator/revenue',
    icon: DollarSign
  },
  {
    label: 'Messages',
    href: '/creator/messages',
    icon: MessageSquare,
    badge: 5 // unread messages
  },
  {
    label: 'Settings',
    href: '/creator/settings',
    icon: Settings
  }
];
```

---

## Credit Buyer Dashboard

### Layout & Key Features

### 1. Marketplace Browse Interface
```typescript
// Marketplace Grid
const MarketplaceGrid = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="flex items-center space-x-2">
        <FilterDropdown />
        <SortDropdown />
        <ViewToggle view={view} onViewChange={setView} />
      </div>
    </div>

    <div className={cn(
      "grid gap-6",
      view === 'grid' ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
    )}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} view={view} />
      ))}
    </div>
  </div>
);

// Project Card Component
const ProjectCard = ({ project, view }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="aspect-video relative">
      <Image
        src={project.image}
        alt={project.name}
        fill
        className="object-cover"
      />
      <Badge className="absolute top-2 right-2 bg-bangladesh-green">
        Verified
      </Badge>
    </div>
    <CardContent className="p-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{project.name}</h3>
        <p className="text-sm text-dark line-clamp-2">{project.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">${project.pricePerCredit}/credit</span>
          <span className="text-sm text-dark">{project.creditsAvailable} available</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-dark">
          <MapPin className="h-4 w-4" />
          {project.location}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button className="flex-1" onClick={() => openProjectDetails(project.id)}>
          View Details
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);
```

### 2. Purchase Flow Interface
```typescript
// Purchase Modal
const PurchaseModal = ({ project, isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Purchase Carbon Credits</DialogTitle>
        <DialogDescription>{project.name}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="quantity">Number of Credits</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={project.creditsAvailable}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Total Cost</Label>
            <div className="text-2xl font-bold text-bangladesh-green">
              ${(quantity * project.pricePerCredit).toFixed(2)}
            </div>
          </div>
        </div>

        <Card className="bg-anti-flash-white">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Environmental Impact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>CO₂ Offset:</span>
                <span className="font-medium">{quantity} tons</span>
              </div>
              <div className="flex justify-between">
                <span>Equivalent to:</span>
                <span className="font-medium">{calculateEquivalent(quantity)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <PaymentMethodSelector />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handlePurchase}>
          Complete Purchase
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

### 3. Impact Tracking Dashboard
```typescript
// Impact Overview
const ImpactDashboard = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark">Total CO₂ Offset</p>
              <p className="text-3xl font-bold text-bangladesh-green">
                {totalOffset} tons
              </p>
            </div>
            <Leaf className="h-8 w-8 text-mountain-meadow" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark">Projects Supported</p>
              <p className="text-3xl font-bold text-bangladesh-green">
                {projectsSupported}
              </p>
            </div>
            <TreePine className="h-8 w-8 text-mountain-meadow" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark">Total Investment</p>
              <p className="text-3xl font-bold text-bangladesh-green">
                ${totalInvestment}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-mountain-meadow" />
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Impact Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ImpactChart data={impactData} />
      </CardContent>
    </Card>
  </div>
);
```

### 4. Certificate Management
```typescript
// Certificate Library
const CertificateLibrary = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">My Certificates</h2>
      <Button variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Download All
      </Button>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert) => (
        <Card key={cert.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="aspect-[3/4] bg-gradient-to-br from-bangladesh-green to-mountain-meadow rounded-lg p-4 text-white mb-4">
              <div className="text-center space-y-2">
                <Award className="h-8 w-8 mx-auto" />
                <h3 className="font-bold text-lg">Carbon Credit Certificate</h3>
                <p className="text-sm opacity-90">{cert.projectName}</p>
                <div className="bg-white/20 rounded-lg p-2 mt-4">
                  <p className="text-2xl font-bold">{cert.credits}</p>
                  <p className="text-xs">tons CO₂ offset</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">{cert.projectName}</p>
              <p className="text-sm text-dark">Issued: {cert.issueDate}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
```

### Navigation Structure
```typescript
const buyerNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/buyer/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Marketplace',
    href: '/buyer/marketplace',
    icon: ShoppingCart
  },
  {
    label: 'My Portfolio',
    href: '/buyer/portfolio',
    icon: PieChart,
    children: [
      { label: 'Overview', href: '/buyer/portfolio', icon: BarChart },
      { label: 'Certificates', href: '/buyer/certificates', icon: Award },
      { label: 'Impact Tracking', href: '/buyer/impact', icon: Leaf }
    ]
  },
  {
    label: 'Purchase History',
    href: '/buyer/history',
    icon: History
  },
  {
    label: 'Watchlist',
    href: '/buyer/watchlist',
    icon: Heart,
    badge: 3
  },
  {
    label: 'Settings',
    href: '/buyer/settings',
    icon: Settings
  }
];
```

---

## Verifier Dashboard

### 1. Verification Queue Management
```typescript
// Queue Overview
const VerificationQueue = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-4">
      <QueueMetric
        title="Pending Review"
        count={pendingCount}
        icon={Clock}
        color="warning"
      />
      <QueueMetric
        title="In Progress"
        count={inProgressCount}
        icon={Eye}
        color="info"
      />
      <QueueMetric
        title="Completed Today"
        count={completedTodayCount}
        icon={CheckCircle}
        color="success"
      />
      <QueueMetric
        title="Average Review Time"
        count={`${avgReviewTime}h`}
        icon={Timer}
        color="neutral"
      />
    </div>

    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Verification Queue</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="submitted">Date Submitted</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <QueueTable projects={queueProjects} />
      </CardContent>
    </Card>
  </div>
);

// Queue Table Component
const QueueTable = ({ projects }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Project</TableHead>
        <TableHead>Creator</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Submitted</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {projects.map((project) => (
        <TableRow key={project.id}>
          <TableCell>
            <div>
              <p className="font-medium">{project.name}</p>
              <p className="text-sm text-dark">{project.location}</p>
            </div>
          </TableCell>
          <TableCell>{project.creatorName}</TableCell>
          <TableCell>
            <Badge variant="outline">{project.type}</Badge>
          </TableCell>
          <TableCell>{formatDate(project.submittedAt)}</TableCell>
          <TableCell>
            <PriorityBadge priority={project.priority} />
          </TableCell>
          <TableCell>
            <StatusBadge status={project.status} />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => startReview(project.id)}>
                Start Review
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
```

### 2. Document Review Interface
```typescript
// Document Review Workspace
const DocumentReviewWorkspace = ({ project }) => (
  <div className="h-screen flex">
    {/* Document Viewer */}
    <div className="flex-1 bg-white">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{project.name}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download All
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </div>

      <DocumentViewer
        documents={project.documents}
        annotations={annotations}
        onAnnotate={handleAnnotation}
      />
    </div>

    {/* Review Panel */}
    <div className="w-96 border-l bg-anti-flash-white">
      <ReviewPanel
        project={project}
        checklist={verificationChecklist}
        onUpdateChecklist={updateChecklist}
        onSubmitReview={submitReview}
      />
    </div>
  </div>
);

// Review Panel Component
const ReviewPanel = ({ project, checklist, onUpdateChecklist, onSubmitReview }) => (
  <div className="h-full flex flex-col">
    <div className="p-4 border-b">
      <h3 className="font-semibold">Verification Checklist</h3>
      <p className="text-sm text-dark">
        {checklist.filter(item => item.completed).length} of {checklist.length} completed
      </p>
    </div>

    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {checklist.map((item) => (
        <ChecklistItem
          key={item.id}
          item={item}
          onUpdate={(updates) => onUpdateChecklist(item.id, updates)}
        />
      ))}
    </div>

    <div className="p-4 border-t space-y-4">
      <QualityScoreCalculator checklist={checklist} />

      <div className="space-y-2">
        <Label htmlFor="verifierNotes">Verifier Notes</Label>
        <Textarea
          id="verifierNotes"
          placeholder="Add any additional notes or observations..."
          value={verifierNotes}
          onChange={(e) => setVerifierNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onSubmitReview('rejected')}
        >
          Reject
        </Button>
        <Button
          className="flex-1"
          onClick={() => onSubmitReview('approved')}
          disabled={!isReviewComplete}
        >
          Approve
        </Button>
      </div>
    </div>
  </div>
);
```

### 3. Communication Center
```typescript
// Message Thread Interface
const MessageThread = ({ projectId }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Project Communication</CardTitle>
        <Badge variant="outline">{project.name}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isFromVerifier={message.senderId === currentVerifierId}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Image className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={sendMessage}>
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);
```

### Navigation Structure
```typescript
const verifierNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/verifier/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Verification Queue',
    href: '/verifier/queue',
    icon: Clock,
    badge: 12 // pending verifications
  },
  {
    label: 'In Review',
    href: '/verifier/review',
    icon: Eye,
    badge: 3 // currently reviewing
  },
  {
    label: 'Completed',
    href: '/verifier/completed',
    icon: CheckCircle
  },
  {
    label: 'Messages',
    href: '/verifier/messages',
    icon: MessageSquare,
    badge: 7 // unread messages
  },
  {
    label: 'Reports',
    href: '/verifier/reports',
    icon: FileText
  },
  {
    label: 'Guidelines',
    href: '/verifier/guidelines',
    icon: BookOpen
  }
];
```

---

## System Administrator Dashboard

### 1. System Overview Dashboard
```typescript
// Admin Overview
const AdminDashboard = () => (
  <div className="space-y-6">
    {/* System Health Metrics */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SystemMetric
        title="System Uptime"
        value="99.9%"
        icon={Activity}
        status="healthy"
      />
      <SystemMetric
        title="Active Users"
        value="2,847"
        icon={Users}
        status="healthy"
        trend="+12%"
      />
      <SystemMetric
        title="Pending Support Tickets"
        value="23"
        icon={AlertCircle}
        status="warning"
      />
      <SystemMetric
        title="Server Response Time"
        value="245ms"
        icon={Zap}
        status="healthy"
      />
    </div>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Button className="h-20 flex-col">
            <UserPlus className="h-6 w-6 mb-2" />
            Create User
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Settings className="h-6 w-6 mb-2" />
            System Settings
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <MessageSquare className="h-6 w-6 mb-2" />
            Support Center
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Recent Activity & Alerts */}
    <div className="grid gap-6 lg:grid-cols-2">
      <RecentActivity />
      <SystemAlerts />
    </div>
  </div>
);
```

### 2. User Management Interface
```typescript
// User Management Table
const UserManagementTable = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="project-creator">Project Creators</SelectItem>
            <SelectItem value="credit-buyer">Credit Buyers</SelectItem>
            <SelectItem value="verifier">Verifiers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button>
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-dark">{user.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              <StatusBadge status={user.status} />
            </TableCell>
            <TableCell>{formatDate(user.joinedAt)}</TableCell>
            <TableCell>{formatDate(user.lastActiveAt)}</TableCell>
            <TableCell>
              <UserActionsDropdown user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
```

### 3. Platform Analytics
```typescript
// Analytics Dashboard
const PlatformAnalytics = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard
        title="Total Projects"
        value="1,247"
        change="+15%"
        period="vs last month"
      />
      <AnalyticsCard
        title="Credits Traded"
        value="456,789"
        change="+23%"
        period="vs last month"
      />
      <AnalyticsCard
        title="Platform Revenue"
        value="$89,456"
        change="+18%"
        period="vs last month"
      />
      <AnalyticsCard
        title="User Growth"
        value="2,847"
        change="+12%"
        period="vs last month"
      />
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>User Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <UserGrowthChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectDistributionChart />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionVolumeChart />
      </CardContent>
    </Card>
  </div>
);
```

### Navigation Structure
```typescript
const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Users,
    children: [
      { label: 'All Users', href: '/admin/users', icon: Users },
      { label: 'Pending Approvals', href: '/admin/users/pending', icon: Clock },
      { label: 'Role Management', href: '/admin/users/roles', icon: Shield }
    ]
  },
  {
    label: 'Platform Analytics',
    href: '/admin/analytics',
    icon: BarChart
  },
  {
    label: 'Support Center',
    href: '/admin/support',
    icon: MessageSquare,
    badge: 23 // pending tickets
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { label: 'General', href: '/admin/settings/general', icon: Settings },
      { label: 'Payment', href: '/admin/settings/payment', icon: CreditCard },
      { label: 'Security', href: '/admin/settings/security', icon: Shield },
      { label: 'Notifications', href: '/admin/settings/notifications', icon: Bell }
    ]
  },
  {
    label: 'Content Management',
    href: '/admin/content',
    icon: FileText
  },
  {
    label: 'System Logs',
    href: '/admin/logs',
    icon: Terminal
  }
];
```

---

## Additional Systems

### 1. Monitoring & Tracking System
```typescript
// Real-time Monitoring Dashboard
const MonitoringDashboard = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <MonitoringCard
        title="Active Projects"
        value="156"
        status="healthy"
        icon={Activity}
      />
      <MonitoringCard
        title="Alerts"
        value="7"
        status="warning"
        icon={AlertTriangle}
      />
      <MonitoringCard
        title="System Load"
        value="76%"
        status="healthy"
        icon={Cpu}
      />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Project Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ProjectStatusMap />
      </CardContent>
    </Card>

    <div className="grid gap-6 lg:grid-cols-2">
      <AlertsPanel />
      <RecentUpdatesPanel />
    </div>
  </div>
);
```

### 2. Educational Hub Interface
```typescript
// Educational Hub Layout
const EducationalHub = () => (
  <div className="space-y-6">
    <HeroSection />

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <FeaturedContent />
        <RecentArticles />
      </div>
      <div>
        <LearningPaths />
        <CommunityHighlights />
      </div>
    </div>
  </div>
);

// Learning Path Component
const LearningPath = ({ path }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-bangladesh-green/10 p-2">
          <path.icon className="h-5 w-5 text-bangladesh-green" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{path.title}</h3>
          <p className="text-sm text-dark mt-1">{path.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-dark">
              <Clock className="h-3 w-3" />
              {path.duration}
            </div>
            <Button size="sm" variant="outline">
              Start Learning
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
```

### 3. Trading Marketplace Interface
```typescript
// Advanced Marketplace Features
const AdvancedMarketplace = () => (
  <div className="space-y-6">
    <MarketplaceHeader />

    <div className="grid gap-6 lg:grid-cols-4">
      <div>
        <AdvancedFilters />
      </div>
      <div className="lg:col-span-3">
        <div className="space-y-4">
          <MarketplaceToolbar />
          <ProjectGrid />
          <Pagination />
        </div>
      </div>
    </div>
  </div>
);

// Advanced Filter Component
const AdvancedFilters = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Filters</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <FilterSection title="Project Type">
        <ProjectTypeFilter />
      </FilterSection>

      <FilterSection title="Location">
        <LocationFilter />
      </FilterSection>

      <FilterSection title="Price Range">
        <PriceRangeSlider />
      </FilterSection>

      <FilterSection title="Credits Available">
        <CreditsRangeSlider />
      </FilterSection>

      <FilterSection title="Verification Status">
        <VerificationFilter />
      </FilterSection>

      <Button className="w-full" variant="outline">
        Clear All Filters
      </Button>
    </CardContent>
  </Card>
);
```

---

## Responsive Design Guidelines

### Breakpoint System
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X Large devices (large desktops) */
```

### Responsive Layout Patterns

#### 1. Dashboard Grid System
```typescript
// Responsive grid for dashboard cards
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {metrics.map((metric) => (
    <MetricCard key={metric.id} {...metric} />
  ))}
</div>

// Responsive sidebar navigation
<div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
  <aside className="lg:col-span-3">
    <Navigation collapsed={isMobile} />
  </aside>
  <main className="lg:col-span-9">
    <DashboardContent />
  </main>
</div>
```

#### 2. Mobile Navigation
```typescript
// Mobile-first navigation with hamburger menu
const MobileNavigation = () => (
  <div className="lg:hidden">
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <NavigationMenu items={navItems} />
      </SheetContent>
    </Sheet>
  </div>
);
```

#### 3. Responsive Tables
```typescript
// Mobile-friendly table with stacked layout
<div className="hidden md:block">
  <Table>
    {/* Full table for desktop */}
  </Table>
</div>

<div className="md:hidden space-y-4">
  {data.map((item) => (
    <Card key={item.id}>
      {/* Stacked card layout for mobile */}
    </Card>
  ))}
</div>
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### 1. Color Contrast
```css
/* Ensure minimum contrast ratios */
.text-primary { color: #0B0B0B; } /* 21:1 against white */
.text-secondary { color: #2C2C2C; } /* 12.6:1 against white */
.bg-success { background-color: #006A4E; } /* 4.8:1 against white text */
```

#### 2. Keyboard Navigation
```typescript
// Focus management for complex components
const FocusableCard = ({ children, onSelect }) => (
  <div
    tabIndex={0}
    role="button"
    aria-label="Select project"
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    }}
    className="focus:ring-2 focus:ring-bangladesh-green focus:outline-none"
  >
    {children}
  </div>
);
```

#### 3. Screen Reader Support
```typescript
// Proper ARIA labels and semantic markup
<button
  aria-label={`Purchase ${creditCount} carbon credits for $${totalCost}`}
  aria-describedby="purchase-description"
>
  Purchase Credits
</button>
<div id="purchase-description" className="sr-only">
  This will offset {creditCount} tons of CO₂ emissions
</div>
```

#### 4. Form Accessibility
```typescript
// Accessible form components
<FormField
  control={form.control}
  name="projectName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Project Name *</FormLabel>
      <FormControl>
        <Input
          {...field}
          aria-required="true"
          aria-describedby="project-name-error"
        />
      </FormControl>
      <FormDescription>
        Enter a descriptive name for your carbon offset project
      </FormDescription>
      <FormMessage id="project-name-error" />
    </FormItem>
  )}
/>
```

---

## Implementation Guidelines

### 1. Component Development Standards
```typescript
// Example component with proper TypeScript interfaces
interface ProjectCardProps {
  project: Project;
  view: 'grid' | 'list';
  onSelect: (project: Project) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  view,
  onSelect,
  className
}) => {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg",
        view === 'list' && "flex-row",
        className
      )}
    >
      {/* Component implementation */}
    </Card>
  );
};
```

### 2. State Management Patterns
```typescript
// Zustand store for dashboard state
interface DashboardStore {
  // State
  selectedProject: Project | null;
  isLoading: boolean;
  filters: FilterState;

  // Actions
  setSelectedProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedProject: null,
  isLoading: false,
  filters: initialFilters,

  setSelectedProject: (project) => set({ selectedProject: project }),
  setLoading: (isLoading) => set({ isLoading }),
  updateFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialFilters })
}));
```

### 3. API Integration Patterns
```typescript
// Custom hooks for data fetching
export const useProjects = (filters: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePurchaseCredits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Credits purchased successfully!');
    },
    onError: (error) => {
      toast.error('Failed to purchase credits. Please try again.');
    }
  });
};
```

### 4. Performance Optimization
```typescript
// Lazy loading for large lists
const VirtualizedProjectList = () => {
  return (
    <FixedSizeList
      height={600}
      itemCount={projects.length}
      itemSize={120}
      overscanCount={5}
    >
      {({ index, style }) => (
        <div style={style}>
          <ProjectCard project={projects[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};

// Memoized components
const MemoizedProjectCard = React.memo(ProjectCard, (prevProps, nextProps) => {
  return prevProps.project.id === nextProps.project.id &&
         prevProps.view === nextProps.view;
});
```

### 5. Testing Strategy
```typescript
// Component testing with React Testing Library
describe('ProjectCard', () => {
  it('displays project information correctly', () => {
    const mockProject = createMockProject();

    render(
      <ProjectCard
        project={mockProject}
        view="grid"
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
    expect(screen.getByText(mockProject.location)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    const mockProject = createMockProject();

    render(
      <ProjectCard
        project={mockProject}
        view="grid"
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    expect(mockOnSelect).toHaveBeenCalledWith(mockProject);
  });
});
```

---

## Design Tokens & Spacing System

### Spacing Scale
```css
/* Spacing tokens based on 4px grid */
--spacing-0: 0px;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;
```

### Component Sizing
```css
/* Standard component heights */
--height-button-sm: 32px;
--height-button-md: 40px;
--height-button-lg: 48px;
--height-input: 40px;
--height-card-header: 64px;
--height-nav-item: 48px;
```

### Shadow System
```css
/* Elevation shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

This comprehensive UI design plan provides the foundation for implementing a cohesive, accessible, and user-friendly interface across all EcoSprout dashboards. Each component and layout has been designed with the specific workflows and user needs in mind, while maintaining consistency with the established design system and technical requirements.