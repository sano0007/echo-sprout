'use client';

import { useEffect, useState } from 'react';

interface ClientTimeProps {
  className?: string;
  format?: 'time' | 'date' | 'datetime';
  prefix?: string;
}

export function ClientTime({
  className = '',
  format = 'time',
  prefix = '',
}: ClientTimeProps) {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      const now = new Date();
      let timeString = '';

      switch (format) {
        case 'time':
          timeString = now.toLocaleTimeString();
          break;
        case 'date':
          timeString = now.toLocaleDateString();
          break;
        case 'datetime':
          timeString = now.toLocaleString();
          break;
        default:
          timeString = now.toLocaleTimeString();
      }

      setTime(timeString);
    };

    updateTime();

    const interval = setInterval(updateTime, format === 'time' ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [format]);

  if (!mounted) {
    return <span className={className}>{prefix}--:--:--</span>;
  }

  return (
    <span className={className}>
      {prefix}
      {time}
    </span>
  );
}
