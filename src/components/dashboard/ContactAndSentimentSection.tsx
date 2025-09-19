
import React from "react";
import DashboardCard from "@/components/DashboardCard";
import { SimpleBarChart, SimplePieChart } from "@/components/charts";
import { PieChart, Users } from "lucide-react";

interface ContactAndSentimentSectionProps {
  contactReasons: Array<{name: string; value: number}>;
  sentimentData: Array<{name: string; value: number}>;
}

const ContactAndSentimentSection: React.FC<ContactAndSentimentSectionProps> = ({ 
  contactReasons, 
  sentimentData 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard 
        title="Motivos de Contacto"
        icon={<PieChart size={18} />}
        subtitle="Distribución porcentual de los principales motivos de contacto"
      >
        <SimpleBarChart data={contactReasons} height={250} />
      </DashboardCard>
      
      <DashboardCard 
        title="Análisis de Sentimientos"
        icon={<Users size={18} />}
        subtitle="Distribución de emociones detectadas en las interacciones"
      >
        <SimplePieChart 
          data={sentimentData} 
          height={250} 
          colors={["#10B981", "#93C5FD", "#EF4444"]}
          innerRadius={60}
          outerRadius={90}
        />
      </DashboardCard>
    </div>
  );
};

export default ContactAndSentimentSection;
