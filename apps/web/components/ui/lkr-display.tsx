'use client';

import React from 'react';
import { formatUSDToLKR } from '@/lib/currency-utils';

/**
 * Simple component for displaying USD amounts converted to LKR
 */
export interface LKRDisplayProps {
  usdAmount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LKRDisplay({
  usdAmount,
  className = '',
  size = 'md'
}: LKRDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {formatUSDToLKR(usdAmount)}
    </span>
  );
}