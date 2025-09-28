'use client';

import { ReactNode } from 'react';
import MonitoringNavigation from '../../components/monitoring/MonitoringNavigation';

interface MonitoringLayoutProps {
  children: ReactNode;
}

export default function MonitoringLayout({ children }: MonitoringLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MonitoringNavigation />
      <main>{children}</main>
    </div>
  );
}