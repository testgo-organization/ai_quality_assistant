
import React from "react";
import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  children: React.ReactElement;
  height?: number;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  height = 300,
  className,
}) => {
  return (
    <div className={`w-full h-${height} ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};
