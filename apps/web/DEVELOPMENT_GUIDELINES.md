# EcoSprout Development Guidelines & Best Practices
*Frontend Development Standards for React/Next.js 15 Implementation*

---

## Table of Contents

1. [Code Organization](#code-organization)
2. [TypeScript Standards](#typescript-standards)
3. [Component Development](#component-development)
4. [State Management](#state-management)
5. [Performance Optimization](#performance-optimization)
6. [Accessibility Guidelines](#accessibility-guidelines)
7. [Testing Standards](#testing-standards)
8. [Security Best Practices](#security-best-practices)
9. [Documentation Requirements](#documentation-requirements)
10. [Code Review Process](#code-review-process)

---

## Code Organization

### File and Folder Naming Conventions

#### 1. **Component Files**
```typescript
// ✅ Correct - PascalCase for components
components/ui/Button.tsx
components/dashboard/MetricCard.tsx
components/forms/ProjectForm.tsx

// ❌ Incorrect
components/ui/button.tsx
components/dashboard/metric-card.tsx
components/forms/project_form.tsx
```

#### 2. **Hook Files**
```typescript
// ✅ Correct - camelCase with 'use' prefix
hooks/useProjectData.ts
hooks/api/useCredits.ts
hooks/ui/useLocalStorage.ts

// ❌ Incorrect
hooks/ProjectData.ts
hooks/api/Credits.ts
hooks/ui/LocalStorage.ts
```

#### 3. **Utility Files**
```typescript
// ✅ Correct - camelCase for utilities
lib/formatCurrency.ts
utils/dateHelpers.ts
lib/validations.ts

// ❌ Incorrect
lib/FormatCurrency.ts
utils/date_helpers.ts
lib/Validations.ts
```

#### 4. **Type Files**
```typescript
// ✅ Correct - camelCase with .types.ts suffix
types/global.types.ts
types/dashboard.types.ts
types/api.types.ts

// ❌ Incorrect
types/GlobalTypes.ts
types/dashboard-types.ts
types/API_Types.ts
```

### Import Organization

#### 1. **Import Order**
```typescript
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

// 2. Third-party library imports
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { z } from 'zod';

// 3. Internal imports (types first)
import type { Project, User } from '@/types/global.types';
import type { DashboardProps } from '@/types/dashboard.types';

// 4. Component imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/common/MetricCard';

// 5. Hook imports
import { useProjects } from '@/hooks/api/useProjects';
import { useToast } from '@/hooks/ui/useToast';

// 6. Utility imports
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

// 7. Local imports (relative imports)
import './styles.css';
```

#### 2. **Absolute vs Relative Imports**
```typescript
// ✅ Preferred - Use absolute imports for most cases
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/api/useProjects';

// ✅ Acceptable - Relative imports for local files
import './ComponentName.styles.css';
import { helper } from '../utils/localHelper';

// ❌ Avoid - Long relative import chains
import { Button } from '../../../components/ui/button';
```

---

## TypeScript Standards

### Type Definitions

#### 1. **Interface vs Type Aliases**
```typescript
// ✅ Use interfaces for object shapes that might be extended
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// ✅ Use type aliases for unions, primitives, and computed types
type Status = 'pending' | 'approved' | 'rejected';
type EventHandler<T> = (event: T) => void;
type UserKeys = keyof User;
```

#### 2. **Generic Types**
```typescript
// ✅ Use meaningful generic type names
interface ApiResponse<TData> {
  data: TData;
  success: boolean;
  error?: string;
}

interface DataTable<TItem> {
  items: TItem[];
  onRowClick: (item: TItem) => void;
  columns: TableColumn<TItem>[];
}

// ❌ Avoid single letter generics unless conventional
interface BadExample<T, U, V> {
  // Not clear what T, U, V represent
}
```

#### 3. **Component Prop Types**
```typescript
// ✅ Define props interface separately for reusability
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className
}) => {
  // Component implementation
};

// ✅ Export props for external usage
export type { ButtonProps };
```

### Type Safety Best Practices

#### 1. **Strict Type Checking**
```typescript
// ✅ Use strict type checking
const user: User = await fetchUser(id); // Type is explicitly defined
const projects = await fetchProjects(); // Type inferred from return type

// ✅ Use type guards for runtime type checking
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// ✅ Use assertion functions when necessary
function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error('Value is not a valid User');
  }
}
```

#### 2. **Null Safety**
```typescript
// ✅ Handle null/undefined explicitly
interface UserProfileProps {
  user: User | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) {
    return <div>Loading...</div>;
  }

  return <div>{user.name}</div>;
};

// ✅ Use optional chaining and nullish coalescing
const userName = user?.profile?.firstName ?? 'Unknown';
const settings = user?.preferences ?? defaultPreferences;
```

---

## Component Development

### Component Structure

#### 1. **Functional Component Pattern**
```typescript
// ✅ Preferred component structure
import React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentProps } from './types';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  loading = false,
  className
}) => {
  // Early returns for loading/error states
  if (loading) {
    return <MetricCardSkeleton className={className} />;
  }

  // Component logic
  const changeColor = {
    positive: 'text-mountain-meadow',
    negative: 'text-red-500',
    neutral: 'text-gray-500'
  }[changeType];

  // Render
  return (
    <div className={cn('metric-card', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={cn('text-sm', changeColor)}>{change}</p>
          )}
        </div>
        <Icon className="h-8 w-8 text-bangladesh-green" />
      </div>
    </div>
  );
};

// Export types for external usage
export type { MetricCardProps };
```

#### 2. **Compound Components**
```typescript
// ✅ Use compound components for complex UI patterns
const DataTable = {
  Root: DataTableRoot,
  Header: DataTableHeader,
  Body: DataTableBody,
  Row: DataTableRow,
  Cell: DataTableCell,
  Pagination: DataTablePagination
};

// Usage
<DataTable.Root>
  <DataTable.Header>
    <DataTable.Cell>Name</DataTable.Cell>
    <DataTable.Cell>Status</DataTable.Cell>
  </DataTable.Header>
  <DataTable.Body>
    {data.map((item) => (
      <DataTable.Row key={item.id}>
        <DataTable.Cell>{item.name}</DataTable.Cell>
        <DataTable.Cell>{item.status}</DataTable.Cell>
      </DataTable.Row>
    ))}
  </DataTable.Body>
</DataTable.Root>
```

### Performance Optimization

#### 1. **Memoization**
```typescript
// ✅ Use React.memo for expensive components
const ExpensiveComponent = React.memo<ExpensiveComponentProps>(
  ({ data, onUpdate }) => {
    // Expensive rendering logic
    return <div>{/* Complex UI */}</div>;
  },
  // Custom comparison function when needed
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);

// ✅ Use useMemo for expensive calculations
const ProjectAnalytics: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const analytics = useMemo(() => {
    return calculateComplexAnalytics(projects);
  }, [projects]);

  return <div>{/* Render analytics */}</div>;
};

// ✅ Use useCallback for event handlers passed to child components
const ProjectList: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleProjectSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={handleProjectSelect}
        />
      ))}
    </div>
  );
};
```

#### 2. **Lazy Loading**
```typescript
// ✅ Use lazy loading for route components
const ProjectDashboard = lazy(() => import('./ProjectDashboard'));
const BuyerDashboard = lazy(() => import('./BuyerDashboard'));
const VerifierDashboard = lazy(() => import('./VerifierDashboard'));

// ✅ Use lazy loading with Suspense
const App: React.FC = () => (
  <Router>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/creator/*" element={<ProjectDashboard />} />
        <Route path="/buyer/*" element={<BuyerDashboard />} />
        <Route path="/verifier/*" element={<VerifierDashboard />} />
      </Routes>
    </Suspense>
  </Router>
);
```

### Error Handling

#### 1. **Error Boundaries**
```typescript
// ✅ Create error boundaries for component trees
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

#### 2. **Error Handling in Components**
```typescript
// ✅ Handle errors gracefully in components
const ProjectList: React.FC = () => {
  const { data: projects, error, isLoading } = useProjects();

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load projects"
        description={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  return (
    <div>
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

---

## State Management

### Zustand Store Patterns

#### 1. **Store Structure**
```typescript
// ✅ Well-structured Zustand store
interface DashboardStore {
  // State
  selectedProject: Project | null;
  filters: ProjectFilters;
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;

  // Actions
  setSelectedProject: (project: Project | null) => void;
  updateFilters: (filters: Partial<ProjectFilters>) => void;
  setViewMode: (mode: ViewMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed values
  filteredProjects: Project[];

  // Async actions
  fetchProjects: () => Promise<void>;
  resetStore: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  selectedProject: null,
  filters: defaultFilters,
  viewMode: 'grid',
  loading: false,
  error: null,

  // Actions
  setSelectedProject: (project) => set({ selectedProject: project }),

  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  setViewMode: (mode) => set({ viewMode: mode }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Computed values
  get filteredProjects() {
    const { projects, filters } = get();
    return filterProjects(projects, filters);
  },

  // Async actions
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await apiClient.fetchProjects();
      set({ projects, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  resetStore: () =>
    set({
      selectedProject: null,
      filters: defaultFilters,
      viewMode: 'grid',
      loading: false,
      error: null
    })
}));
```

#### 2. **Store Composition**
```typescript
// ✅ Split large stores into smaller, focused stores
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => { /* ... */ },
  logout: () => { /* ... */ }
}));

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  notifications: [],
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  }))
}));

// ✅ Combine stores when needed
export const useAppState = () => {
  const auth = useAuthStore();
  const ui = useUIStore();
  const dashboard = useDashboardStore();

  return { auth, ui, dashboard };
};
```

### React Query Integration

#### 1. **Query Patterns**
```typescript
// ✅ Consistent query key patterns
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectsByType: (type: string) => ['projects', 'type', type] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const
};

// ✅ Custom hooks for data fetching
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: [...queryKeys.projects, filters],
    queryFn: () => apiClient.fetchProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => apiClient.fetchProject(id),
    enabled: !!id,
  });
};
```

#### 2. **Mutation Patterns**
```typescript
// ✅ Mutation hooks with optimistic updates
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData: CreateProjectData) =>
      apiClient.createProject(projectData),

    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(queryKeys.projects);

      // Optimistically update
      queryClient.setQueryData(queryKeys.projects, (old: Project[]) => [
        ...old,
        { ...newProject, id: 'temp-id', status: 'creating' }
      ]);

      return { previousProjects };
    },

    onError: (err, newProject, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.projects, context?.previousProjects);
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },

    onSuccess: (data) => {
      // Show success notification
      toast.success('Project created successfully!');
    }
  });
};
```

---

## Performance Optimization

### Bundle Optimization

#### 1. **Code Splitting**
```typescript
// ✅ Route-based code splitting
const routes = [
  {
    path: '/creator',
    component: lazy(() => import('../pages/creator/Dashboard'))
  },
  {
    path: '/buyer',
    component: lazy(() => import('../pages/buyer/Dashboard'))
  },
  {
    path: '/verifier',
    component: lazy(() => import('../pages/verifier/Dashboard'))
  }
];

// ✅ Feature-based code splitting
const ChartComponent = lazy(() =>
  import('../components/charts').then(module => ({
    default: module.AdvancedChart
  }))
);
```

#### 2. **Tree Shaking**
```typescript
// ✅ Import only what you need
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

// ❌ Avoid importing entire modules
import * as formatters from '@/lib/formatters';
import * as components from '@/components/ui';
```

### Rendering Optimization

#### 1. **Virtual Scrolling**
```typescript
// ✅ Use virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedProjectList: React.FC<{ projects: Project[] }> = ({
  projects
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSStyle }) => (
    <div style={style}>
      <ProjectCard project={projects[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={projects.length}
      itemSize={120}
      overscanCount={5}
    >
      {Row}
    </List>
  );
};
```

#### 2. **Image Optimization**
```typescript
// ✅ Use Next.js Image component with optimization
import Image from 'next/image';

const ProjectImage: React.FC<{ project: Project }> = ({ project }) => (
  <Image
    src={project.imageUrl}
    alt={project.name}
    width={400}
    height={300}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    priority={project.featured}
  />
);
```

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### 1. **Semantic HTML**
```typescript
// ✅ Use semantic HTML elements
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <article className="project-card">
    <header>
      <h3>{project.name}</h3>
    </header>
    <section>
      <p>{project.description}</p>
    </section>
    <footer>
      <button type="button" aria-label={`View details for ${project.name}`}>
        View Details
      </button>
    </footer>
  </article>
);

// ❌ Avoid non-semantic markup
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="project-card">
    <div>
      <div>{project.name}</div>
    </div>
    <div>
      <div>{project.description}</div>
    </div>
    <div>
      <div onClick={handleClick}>View Details</div>
    </div>
  </div>
);
```

#### 2. **ARIA Attributes**
```typescript
// ✅ Proper ARIA usage
const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div role="search">
      <label htmlFor="project-search" className="sr-only">
        Search projects
      </label>
      <input
        id="project-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects..."
        aria-describedby="search-help"
        aria-expanded={results.length > 0}
        aria-busy={loading}
        aria-controls="search-results"
      />
      <div id="search-help" className="sr-only">
        Type to search for carbon credit projects
      </div>
      <ul
        id="search-results"
        role="listbox"
        aria-label="Search results"
      >
        {results.map((project) => (
          <li
            key={project.id}
            role="option"
            tabIndex={0}
            aria-selected={false}
          >
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

#### 3. **Keyboard Navigation**
```typescript
// ✅ Keyboard navigation support
const DropdownMenu: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : 0
          );
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : items.length - 1
          );
        }
        break;
    }
  };

  return (
    <div className="dropdown" onKeyDown={handleKeyDown}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="dropdown-trigger"
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu" className="dropdown-menu">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={index === focusedIndex ? 0 : -1}
              className={index === focusedIndex ? 'focused' : ''}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

#### 4. **Color and Contrast**
```css
/* ✅ Ensure sufficient color contrast */
.status-approved {
  background-color: #006A4E; /* bangladesh-green */
  color: #FFFFFF; /* Contrast ratio: 7.2:1 */
}

.status-pending {
  background-color: #F59E0B; /* amber-500 */
  color: #000000; /* Contrast ratio: 4.8:1 */
}

/* ✅ Don't rely solely on color */
.status-indicator::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-approved::before {
  background-color: currentColor;
}

.status-pending::before {
  background-color: currentColor;
  animation: pulse 2s infinite;
}
```

---

## Testing Standards

### Unit Testing

#### 1. **Component Testing**
```typescript
// ✅ Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant classes', () => {
    render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });
});
```

#### 2. **Hook Testing**
```typescript
// ✅ Custom hook test example
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    );

    expect(result.current[0]).toBe('initial');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe('"updated"');
  });
});
```

### Integration Testing

#### 1. **API Integration Tests**
```typescript
// ✅ API integration test example
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectList } from '../ProjectList';

const server = setupServer(
  http.get('/api/projects', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Project', status: 'active' }
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProjectList Integration', () => {
  it('fetches and displays projects', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectList />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing

#### 1. **Playwright Tests**
```typescript
// ✅ E2E test example
import { test, expect } from '@playwright/test';

test.describe('Project Creator Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'creator@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/creator/dashboard');
  });

  test('should display project metrics', async ({ page }) => {
    await expect(page.locator('[data-testid="active-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-credits"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue"]')).toBeVisible();
  });

  test('should navigate to create project page', async ({ page }) => {
    await page.click('[data-testid="create-project-button"]');
    await page.waitForURL('/creator/projects/new');
    await expect(page.locator('h1')).toContainText('Create New Project');
  });

  test('should create a new project', async ({ page }) => {
    await page.goto('/creator/projects/new');

    await page.fill('[data-testid="project-name"]', 'Test Project');
    await page.fill('[data-testid="project-description"]', 'Test Description');
    await page.selectOption('[data-testid="project-type"]', 'reforestation');

    await page.click('[data-testid="next-button"]');

    // Continue through wizard steps...

    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Project created successfully');
  });
});
```

---

## Security Best Practices

### Input Validation

#### 1. **Client-Side Validation**
```typescript
// ✅ Zod schema validation
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  type: z.enum(['reforestation', 'renewable_energy', 'carbon_capture']),
  location: z.object({
    country: z.string().min(2),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional()
  }),
  estimatedCredits: z.number().positive().max(1000000),
  pricePerCredit: z.number().positive().max(1000)
});

type CreateProjectData = z.infer<typeof createProjectSchema>;

// ✅ Form validation with error handling
const CreateProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<CreateProjectData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: any) => {
    try {
      createProjectSchema.pick({ [field]: true }).parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0]?.message
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validData = createProjectSchema.parse(formData);
      await submitProject(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(formErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with validation */}
    </form>
  );
};
```

### XSS Prevention

#### 1. **Safe Content Rendering**
```typescript
// ✅ Safe content rendering
import DOMPurify from 'dompurify';

const SafeHtmlContent: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }, [content]);

  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
};

// ❌ Never render unsanitized user content
const UnsafeContent: React.FC<{ content: string }> = ({ content }) => (
  <div dangerouslySetInnerHTML={{ __html: content }} />
);
```

### Authentication Security

#### 1. **Token Handling**
```typescript
// ✅ Secure token storage and handling
const tokenStorage = {
  getToken: (): string | null => {
    // Use httpOnly cookies in production
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }
};

// ✅ API client with automatic token refresh
class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenStorage.getToken();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const newToken = await this.refreshToken();
      if (newToken) {
        return this.makeRequest(endpoint, options);
      } else {
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const token = await this.refreshPromise;
      this.refreshPromise = null;
      return token;
    } catch (error) {
      this.refreshPromise = null;
      tokenStorage.removeToken();
      window.location.href = '/login';
      return null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include' // Include httpOnly refresh cookie
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { token } = await response.json();
    tokenStorage.setToken(token);
    return token;
  }
}
```

---

This comprehensive development guidelines document provides the foundation for maintaining high-quality, secure, and performant code across the EcoSprout platform. The guidelines ensure consistency, type safety, and adherence to React/Next.js best practices while focusing on the specific needs of a carbon credit trading platform.

The guidelines cover all aspects of frontend development from basic code organization to advanced security considerations, providing developers with clear standards and patterns to follow throughout the implementation process.