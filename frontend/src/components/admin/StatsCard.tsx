'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'pink';
  change?: string;
  changeType?: 'increase' | 'decrease';
  className?: string;
}

const colorClasses = {
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  pink: 'bg-pink-100 text-pink-600',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  changeType = 'increase',
  className,
}: StatsCardProps) {
  return (
    <div className={cn('bg-white p-6 rounded-xl border shadow-sm', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
