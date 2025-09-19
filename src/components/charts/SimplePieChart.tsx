
import React from "react";
import { 
  PieChart as RechartsComponent, 
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./ChartContainer";

interface SimplePieChartProps {
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  colors?: string[];
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#FBBF24"],
  showTooltip = true,
  showLegend = true,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
}) => {
  return (
    <ChartContainer height={height}>
      <RechartsComponent margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={1}
          dataKey="value"
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </RechartsComponent>
    </ChartContainer>
  );
};
