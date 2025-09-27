'use client';

import React, { ReactNode } from 'react';

type PageContainerProps = {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function PageContainer({
  children,
  size = 'md',
  className = '',
}: PageContainerProps) {
  const maxWidth =
    size === 'sm' ? 'max-w-3xl' : size === 'lg' ? 'max-w-7xl' : 'max-w-4xl';
  return (
    <div className={`${maxWidth} mx-auto p-6 ${className}`}>{children}</div>
  );
}
