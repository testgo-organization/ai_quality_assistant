
import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { ChartContainer } from "./ChartContainer";

interface SimpleBarChartProps {
  data: Array<{
    name: string;
    [key: string]: any;
  }>;
  colors?: string[];
  dataKey?: string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  colors = ["#3B82F6", "#8B5CF6", "#EC4899"],
  dataKey = "value",
  showXAxis = true,
  showYAxis = false,
  showTooltip = true,
  showLegend = false,
  height = 300,
}) => {
  return (
    <ChartContainer height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        {showXAxis && <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} />}
        {showYAxis && <YAxis tickLine={false} axisLine={false} />}
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
