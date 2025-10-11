'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  BarChart3,
  FileText,
  AlertCircle,
  Target,
  Settings,
  PlusCircle,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Search',
    href: '/monitoring/search',
    icon: Search,
    description: 'Search all monitoring data',
  },
  {
    name: 'Dashboard',
    href: '/monitoring/dashboard',
    icon: BarChart3,
    description: 'Monitoring overview',
  },
  {
    name: 'Progress Updates',
    href: '/monitoring/progress',
    icon: FileText,
    description: 'View progress reports',
  },
  {
    name: 'Alerts',
    href: '/monitoring/alerts',
    icon: AlertCircle,
    description: 'System alerts',
  },
  {
    name: 'Milestones',
    href: '/monitoring/milestones',
    icon: Target,
    description: 'Project milestones',
  },
  {
    name: 'Settings',
    href: '/monitoring/settings',
    icon: Settings,
    description: 'Monitoring settings',
  },
];

export default function MonitoringNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Main Navigation */}
          <nav className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/monitoring/progress/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Update</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
