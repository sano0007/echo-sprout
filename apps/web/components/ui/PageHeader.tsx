'use client';

import Link from 'next/link';
import React, { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  backHref,
  right,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-8 ${className}`}>
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
        )}
        <div className="h-6 w-px bg-gray-300" aria-hidden></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  );
}
