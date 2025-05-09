
import React from "react";
import DashboardCard from "@/components/DashboardCard";
import { SimpleBarChart } from "@/components/charts";
import { ThumbsDown, ThumbsUp } from "lucide-react";

interface FrictionSatisfactionSectionProps {
  frictionPoints: Array<{name: string; value: number}>;
  satisfactionPoints: Array<{name: string; value: number}>;
}

const FrictionSatisfactionSection: React.FC<FrictionSatisfactionSectionProps> = ({ 
  frictionPoints, 
  satisfactionPoints 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard 
        title="Puntos de Fricción"
        icon={<ThumbsDown size={18} />}
        subtitle="Principales causas de insatisfacción identificadas"
      >
        <SimpleBarChart 
          data={frictionPoints} 
          height={250} 
          colors={["#F87171", "#FECACA", "#FEE2E2", "#FDA4AF", "#EF4444"]} 
        />
      </DashboardCard>
      
      <DashboardCard 
        title="Puntos de Satisfacción"
        icon={<ThumbsUp size={18} />}
        subtitle="Aspectos mejor valorados por los clientes"
      >
        <SimpleBarChart 
          data={satisfactionPoints} 
          height={250} 
          colors={["#10B981", "#34D399", "#6EE7B7", "#D1FAE5", "#A7F3D0"]}
        />
      </DashboardCard>
    </div>
  );
};

export default FrictionSatisfactionSection;
