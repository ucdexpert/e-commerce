'use client';

import { useState, useEffect } from 'react';

interface Props {
  endTime: string;
  onExpire?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function CountdownTimer({ endTime, onExpire, size = 'medium' }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setExpired(true);
        onExpire?.();
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (expired) return <span className="text-red-500 font-bold">Expired!</span>;

  const pad = (n: number) => String(n).padStart(2, '0');

  const sizeClasses = {
    small: { container: 'px-1.5 py-0.5 min-w-[36px]', number: 'text-sm', label: 'text-xs' },
    medium: { container: 'px-2 py-1 min-w-[44px]', number: 'text-xl', label: 'text-xs' },
    large: { container: 'px-3 py-2 min-w-[60px]', number: 'text-3xl', label: 'text-sm' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex items-center gap-1">
      {[
        { label: 'HRS', value: timeLeft.hours },
        { label: 'MIN', value: timeLeft.minutes },
        { label: 'SEC', value: timeLeft.seconds },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1">
          <div
            className={`bg-gray-900 text-white rounded-lg ${classes.container} text-center`}
          >
            <div className={`${classes.number} font-bold font-mono`}>{pad(unit.value)}</div>
            <div className={`${classes.label} text-gray-400`}>{unit.label}</div>
          </div>
          {i < 2 && <span className="text-gray-900 font-bold text-xl">:</span>}
        </div>
      ))}
    </div>
  );
}
