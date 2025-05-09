
import React from "react";
import { 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { ChartContainer } from "./ChartContainer";

interface SimpleRadarChartProps {
  data: Array<{
    subject: string;
    [key: string]: any;
  }>;
  dataKeys: Array<{
    key: string;
    color: string;
  }>;
  showLegend?: boolean;
  height?: number;
}

export const SimpleRadarChart: React.FC<SimpleRadarChartProps> = ({
  data,
  dataKeys,
  showLegend = true,
  height = 300,
}) => {
  return (
    <ChartContainer height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        {dataKeys.map((item, index) => (
          <Radar
            key={`radar-${index}`}
            name={item.key}
            dataKey={item.key}
            stroke={item.color}
            fill={item.color}
            fillOpacity={0.6}
          />
        ))}
        {showLegend && <Legend />}
        <Tooltip />
      </RadarChart>
    </ChartContainer>
  );
};
