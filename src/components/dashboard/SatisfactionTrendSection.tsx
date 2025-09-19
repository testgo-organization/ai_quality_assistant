
import React from "react";
import DashboardCard from "@/components/DashboardCard";
import { SimpleLineChart } from "@/components/charts";
import { Activity } from "lucide-react";

interface SatisfactionTrendSectionProps {
  satisfactionTrend: Array<{
    name: string;
    csat: number;
    nps: number;
    responses: number;
  }>;
}

const SatisfactionTrendSection: React.FC<SatisfactionTrendSectionProps> = ({ satisfactionTrend }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <DashboardCard 
        title="Tendencia de Satisfacción"
        icon={<Activity size={18} />}
        subtitle="Evolución mensual de los índices de satisfacción y recomendación"
      >
        <SimpleLineChart 
          data={satisfactionTrend} 
          lines={[
            { dataKey: "csat", color: "#8B5CF6" },
            { dataKey: "nps", color: "#3B82F6" },
            { dataKey: "responses", color: "#D1D5DB" }
          ]}
          height={300}
          showLegend={true}
        />
      </DashboardCard>
    </div>
  );
};

export default SatisfactionTrendSection;
