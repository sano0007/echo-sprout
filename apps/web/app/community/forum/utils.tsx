'use client';

import { useEffect, useState } from 'react';

function formatShortNumber(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function RelativeTime({
  timestamp,
  fallback,
}: {
  timestamp?: number;
  fallback?: string;
}) {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!timestamp) return <span>{fallback ?? 'just now'}</span>;
  const diff = Math.max(0, now - timestamp);
  if (diff < 60_000) return <span>just now</span>;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60)
    return (
      <span>
        {mins} min{mins === 1 ? '' : 's'} ago
      </span>
    );
  const hours = Math.floor(mins / 60);
  if (hours < 24)
    return (
      <span>
        {hours} hour{hours === 1 ? '' : 's'} ago
      </span>
    );
  const days = Math.floor(hours / 24);
  return (
    <span>
      {days} day{days === 1 ? '' : 's'} ago
    </span>
  );
}

export { formatShortNumber, RelativeTime };
