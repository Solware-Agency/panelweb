import React from 'react';
import { Card } from '@shared/components/ui/card';
import { cn } from '@shared/lib/cn';
import { StatType } from '@shared/components/ui/stat-detail-panel';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    icon: React.ReactNode;
    positive?: boolean;
  };
  onClick?: () => void;
  className?: string;
  statType: StatType;
  isSelected?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  onClick,
  className,
  statType,
  isSelected = false,
}) => {
  return (
    <Card 
      className={cn(
        "col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg cursor-pointer",
        isSelected && "border-primary shadow-lg shadow-primary/20",
        className
      )}
      onClick={onClick}
      data-stat-type={statType}
    >
      <div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.icon}
                <span className="text-xs sm:text-sm font-medium">{trend.value}</span>
              </div>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;