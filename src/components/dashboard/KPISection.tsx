
import React from "react";
import DashboardCard from "@/components/DashboardCard";
import { MessageSquare, ThumbsUp, TrendingUp, Heart } from "lucide-react";

const KPISection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard 
        title="Total Interacciones"
        value="3,842"
        trend={{ value: 14.3, isPositive: true }}
        icon={<MessageSquare size={18} />}
        subtitle="Total de contactos recibidos en todos los canales"
      />
      <DashboardCard 
        title="CSAT Promedio"
        value="87%"
        trend={{ value: 5.2, isPositive: true }}
        icon={<ThumbsUp size={18} />}
        subtitle="Satisfacción del cliente en encuestas post-servicio"
      />
      <DashboardCard 
        title="NPS"
        value="76"
        trend={{ value: 8.3, isPositive: true }}
        icon={<TrendingUp size={18} />}
        subtitle="Net Promoter Score actual con base en feedback"
      />
      <DashboardCard 
        title="Tasa de Resolución"
        value="94%"
        trend={{ value: 2.8, isPositive: true }}
        icon={<Heart size={18} />}
        subtitle="Porcentaje de casos resueltos en primer contacto"
      />
    </div>
  );
};

export default KPISection;
