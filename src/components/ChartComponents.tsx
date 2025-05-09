import React from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart as RechartsComponent, 
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

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

export const getRandomData = (count: number, max: number = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * max) + 10,
  }));
};
