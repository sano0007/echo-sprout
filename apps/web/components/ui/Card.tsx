'use client';

import React, { ReactNode } from 'react';

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
};

export default function Card({
  title,
  description,
  children,
  className = '',
  headerClassName = '',
}: CardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {(title || description) && (
        <div className={`mb-4 ${headerClassName}`}>
          {title && <h2 className="text-2xl font-semibold">{title}</h2>}
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
