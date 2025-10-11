# EcoSprout Admin Dashboard

This directory contains the complete admin dashboard implementation for the EcoSprout carbon credits platform, following minimalistic design principles and using the existing shadcn/ui component library.

## Overview

The admin dashboard provides comprehensive platform management capabilities for System Administrators, including user management, system monitoring, analytics, and administrative actions.

## Components

### 1. AdminDashboardLayout (`/components/layout/AdminDashboardLayout.tsx`)

- **Purpose**: Main layout wrapper using the existing shadcn sidebar component
- **Features**:
  - Responsive sidebar navigation with collapse/expand functionality
  - Header with notifications and user profile
  - Clean, minimalistic design with EcoSprout branding
  - Mobile-friendly responsive design

### 2. SystemMetricsOverview (`SystemMetricsOverview.tsx`)

- **Purpose**: High-level platform metrics and KPIs
- **Features**:
  - Real-time system statistics (users, projects, revenue, uptime)
  - Trend indicators with color-coded changes
  - Loading states with skeleton components
  - Responsive grid layout

### 3. UserManagementTable (`UserManagementTable.tsx`)

- **Purpose**: Comprehensive user management interface
- **Features**:
  - Sortable and filterable user table
  - Search functionality across names and emails
  - Role-based filtering and status filtering
  - Bulk actions and individual user management
  - Export capabilities
  - Responsive design with mobile-friendly cards

### 4. PlatformAnalyticsCharts (`PlatformAnalyticsCharts.tsx`)

- **Purpose**: Data visualization and analytics
- **Features**:
  - Multi-tab chart interface (Revenue, Users, Projects, Geographic)
  - Interactive charts using Recharts library
  - Time range selection
  - Responsive chart containers
  - Custom tooltips and styling

### 5. QuickActionsPanel (`QuickActionsPanel.tsx`)

- **Purpose**: Common administrative actions and tasks
- **Features**:
  - Grid of actionable admin tasks
  - Urgent notification system
  - Recent task history
  - Visual priority indicators
  - Responsive button grid

### 6. RecentActivityFeed (`RecentActivityFeed.tsx`)

- **Purpose**: Platform activity monitoring
- **Features**:
  - Real-time activity stream
  - Filterable by activity type and status
  - User avatars and role indicators
  - Impact level classification
  - Timestamp formatting

### 7. SystemHealthMonitor (`SystemHealthMonitor.tsx`)

- **Purpose**: System status and health monitoring
- **Features**:
  - Service status monitoring
  - System alerts management
  - Performance metrics display
  - Alert acknowledgment system
  - Tabbed interface for different monitoring aspects

## Design Principles

### Minimalistic Approach

- Clean, uncluttered interfaces
- Subtle shadows and borders
- Focused on essential functionality
- Consistent spacing and typography

### Color Palette

- **Primary**: `bangladesh-green` (#006A4E)
- **Secondary**: `mountain-meadow` (#2ECC71)
- **Accent**: `caribbean-green` (#00F5B8)
- **Text**: `rich-black` (#0B0B0B) and `dark` (#2C2C2C)
- **Background**: `anti-flash-white` (#F1F2F6)

### Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Collapsible sidebar for mobile
- Touch-friendly interface elements

### Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML structure
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader optimization

## File Structure

```
apps/web/
├── app/admin/dashboard/page.tsx          # Main dashboard page
├── components/
│   ├── layout/
│   │   └── AdminDashboardLayout.tsx      # Layout wrapper
│   └── dashboard/admin/
│       ├── SystemMetricsOverview.tsx     # System metrics cards
│       ├── UserManagementTable.tsx       # User management interface
│       ├── PlatformAnalyticsCharts.tsx   # Analytics charts
│       ├── QuickActionsPanel.tsx         # Quick actions
│       ├── RecentActivityFeed.tsx        # Activity feed
│       ├── SystemHealthMonitor.tsx       # System health monitoring
│       └── README.md                     # This file
└── hooks/
    └── use-mobile.ts                     # Mobile detection hook
```

## Usage

### Basic Implementation

```tsx
import { AdminDashboardLayout } from '@/components/layout/AdminDashboardLayout';
import { SystemMetricsOverview } from '@/components/dashboard/admin/SystemMetricsOverview';

export default function AdminDashboard() {
  return (
    <AdminDashboardLayout user={adminUser}>
      <SystemMetricsOverview data={metricsData} />
      {/* Other components */}
    </AdminDashboardLayout>
  );
}
```

### Component Props

Each component is fully typed with TypeScript interfaces defined in `/types/dashboard.types.ts`. Components support:

- Loading states
- Error handling
- Custom event handlers
- Responsive behavior
- Theme customization

## Dependencies

The admin dashboard relies on the following dependencies:

- **shadcn/ui**: Complete UI component library
- **Recharts**: Chart visualization library
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling framework
- **TypeScript**: Type safety

## Integration Points

### Data Sources

Components are designed to work with:

- REST APIs for real-time data
- WebSocket connections for live updates
- Local state management
- External monitoring services

### Authentication

- Role-based access control
- Admin-only routes
- Secure session management

### Performance

- Lazy loading for chart components
- Virtualized tables for large datasets
- Optimized re-renders
- Skeleton loading states

## Customization

### Theming

The dashboard uses CSS variables for theming, allowing easy customization:

```css
:root {
  --primary: 0 106 78; /* bangladesh-green */
  --secondary: 46 204 113; /* mountain-meadow */
  --accent: 0 245 184; /* caribbean-green */
}
```

### Layout

The sidebar navigation can be customized by modifying the `adminNavItems` array in `AdminDashboardLayout.tsx`.

### Metrics

System metrics can be extended by adding new metric types to the `SystemOverviewMetrics` interface.

## Future Enhancements

- Real-time WebSocket integration
- Advanced filtering and search
- Dashboard customization interface
- Export to PDF/Excel functionality
- Advanced role-based permissions
- Automated alert management
- Performance optimization
- Internationalization support

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

The dashboard is optimized for modern browsers with full ES2020 support.
