
import React from "react";
import { 
  LineChart, 
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./ChartContainer";

interface SimpleLineChartProps {
  data: Array<{
    name: string;
    [key: string]: any;
  }>;
  lines: Array<{
    dataKey: string;
    color: string;
    strokeWidth?: number;
  }>;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: number;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  lines,
  showXAxis = true,
  showYAxis = false,
  showTooltip = true,
  showLegend = false,
  height = 300,
}) => {
  return (
    <ChartContainer height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        {showXAxis && <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} />}
        {showYAxis && <YAxis tickLine={false} axisLine={false} />}
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={`line-${index}`}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={line.strokeWidth || 2}
            activeDot={{ r: 6 }}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};
