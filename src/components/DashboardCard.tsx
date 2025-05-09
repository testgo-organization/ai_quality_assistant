
import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value?: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  footer?: ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  children,
  className,
  loading = false,
  footer,
}) => {
  return (
    <Card className={cn("overflow-hidden glass-card", className)}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            {trend && (
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            )}
          </div>
        ) : (
          <>
            {value && (
              <div className="flex items-center">
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                  <div 
                    className={cn(
                      "text-xs font-medium ml-2 px-2 py-0.5 rounded",
                      trend.isPositive 
                        ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30" 
                        : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                    )}
                  >
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {children && <div className="mt-3">{children}</div>}
      </div>
      
      {footer && (
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default DashboardCard;
