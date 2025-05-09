
import React from "react";
import DashboardCard from "@/components/DashboardCard";
import { SimplePieChart, SimpleBarChart } from "@/components/charts";
import { PieChart, Clock } from "lucide-react";

interface ChannelDistributionSectionProps {
  channelUsage: Array<{name: string; value: number; color: string}>;
  hourlyDistribution: Array<{name: string; value: number}>;
}

const ChannelDistributionSection: React.FC<ChannelDistributionSectionProps> = ({ 
  channelUsage, 
  hourlyDistribution 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard 
        title="Uso por Canal"
        icon={<PieChart size={18} />}
        subtitle="Distribución de interacciones por canal de contacto"
      >
        <SimplePieChart 
          data={channelUsage} 
          height={250}
          colors={channelUsage.map(item => item.color)}
          innerRadius={0}
          outerRadius={90}
        />
      </DashboardCard>
      
      <DashboardCard 
        title="Distribución Horaria"
        icon={<Clock size={18} />}
        subtitle="Volumen de contactos recibidos por hora del día"
      >
        <SimpleBarChart 
          data={hourlyDistribution} 
          height={250}
          colors={["#9b87f5"]} 
          showXAxis={true}
          showYAxis={true}
        />
      </DashboardCard>
    </div>
  );
};

export default ChannelDistributionSection;
