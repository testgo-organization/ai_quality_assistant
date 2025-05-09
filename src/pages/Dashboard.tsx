
import React, { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { 
  SimpleBarChart, 
  SimplePieChart, 
  SimpleLineChart,
  SimpleRadarChart 
} from "@/components/ChartComponents";
import { 
  BarChart3, 
  PieChart, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Heart,
  ThumbsUp,
  ThumbsDown,
  Download,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  
  const contactReasons = [
    { name: "Consultas", value: 35 },
    { name: "Soporte", value: 25 },
    { name: "Quejas", value: 15 },
    { name: "Ventas", value: 20 },
    { name: "Otros", value: 5 },
  ];
  
  const sentimentData = [
    { name: "Positivo", value: 45 },
    { name: "Neutral", value: 35 },
    { name: "Negativo", value: 20 },
  ];
  
  const satisfactionTrend = [
    { name: "Ene", csat: 75, nps: 65 },
    { name: "Feb", csat: 78, nps: 68 },
    { name: "Mar", csat: 73, nps: 62 },
    { name: "Abr", csat: 82, nps: 70 },
    { name: "May", csat: 85, nps: 75 },
    { name: "Jun", csat: 87, nps: 78 },
  ];
  
  const frictionPoints = [
    { name: "Tiempo de espera", value: 45 },
    { name: "Procesos complejos", value: 30 },
    { name: "Falta de información", value: 15 },
    { name: "Problemas técnicos", value: 10 },
  ];
  
  const satisfactionPoints = [
    { name: "Atención personalizada", value: 40 },
    { name: "Resolución rápida", value: 30 },
    { name: "Amabilidad", value: 20 },
    { name: "Conocimiento técnico", value: 10 },
  ];

  const journeyData = [
    { subject: 'Primer contacto', actual: 85, esperado: 90 },
    { subject: 'Diagnóstico', actual: 70, esperado: 80 },
    { subject: 'Resolución', actual: 75, esperado: 85 },
    { subject: 'Seguimiento', actual: 60, esperado: 75 },
    { subject: 'Cierre', actual: 80, esperado: 90 },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Dashboard de Análisis</h1>
            <p className="text-gray-500 dark:text-gray-400">Visualización de métricas e insights de interacciones con clientes</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Periodo:</span>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 py-1 px-3"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
              </select>
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download size={14} />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard 
            title="Total Interacciones"
            value="2,547"
            trend={{ value: 12.5, isPositive: true }}
            icon={<MessageSquare size={18} />}
          />
          <DashboardCard 
            title="CSAT Promedio"
            value="85%"
            trend={{ value: 3.2, isPositive: true }}
            icon={<ThumbsUp size={18} />}
          />
          <DashboardCard 
            title="NPS"
            value="72"
            trend={{ value: 5.7, isPositive: true }}
            icon={<TrendingUp size={18} />}
          />
          <DashboardCard 
            title="Tasa de Resolución"
            value="93%"
            trend={{ value: 2.1, isPositive: true }}
            icon={<Heart size={18} />}
          />
        </div>
        
        {/* Charts - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard 
            title="Motivos de Contacto"
            icon={<PieChart size={18} />}
          >
            <SimpleBarChart data={contactReasons} height={250} />
          </DashboardCard>
          
          <DashboardCard 
            title="Análisis de Sentimientos"
            icon={<Users size={18} />}
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
        
        {/* Charts - Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          <DashboardCard 
            title="Tendencia de Satisfacción"
            icon={<Calendar size={18} />}
          >
            <SimpleLineChart 
              data={satisfactionTrend} 
              lines={[
                { dataKey: "csat", color: "#3B82F6" },
                { dataKey: "nps", color: "#8B5CF6" }
              ]}
              height={300}
              showLegend={true}
            />
          </DashboardCard>
        </div>
        
        {/* Friction & Satisfaction Points */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard 
            title="Puntos de Fricción"
            icon={<ThumbsDown size={18} />}
          >
            <SimpleBarChart 
              data={frictionPoints} 
              height={250} 
              colors={["#EF4444", "#F87171", "#FECACA", "#FEE2E2"]} 
            />
          </DashboardCard>
          
          <DashboardCard 
            title="Puntos de Satisfacción"
            icon={<ThumbsUp size={18} />}
          >
            <SimpleBarChart 
              data={satisfactionPoints} 
              height={250} 
              colors={["#10B981", "#34D399", "#6EE7B7", "#D1FAE5"]}
            />
          </DashboardCard>
        </div>
        
        {/* Customer Journey */}
        <DashboardCard 
          title="Journey del Cliente"
          icon={<Users size={18} />}
        >
          <Tabs defaultValue="radar" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="radar">Radar</TabsTrigger>
              <TabsTrigger value="description">Descripción</TabsTrigger>
            </TabsList>
            <TabsContent value="radar">
              <SimpleRadarChart 
                data={journeyData}
                dataKeys={[
                  { key: "actual", color: "#3B82F6" },
                  { key: "esperado", color: "#8B5CF6" }
                ]}
                height={350}
              />
            </TabsContent>
            <TabsContent value="description">
              <div className="p-4 space-y-4">
                <h3 className="font-medium text-lg">Análisis del Journey del Cliente</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Este gráfico muestra la comparación entre el nivel actual y esperado de satisfacción 
                  en cada etapa del recorrido del cliente. Las principales áreas de mejora se encuentran 
                  en las fases de diagnóstico y seguimiento.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-piacc-blue mr-2"></div>
                    <span>Nivel actual</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-piacc-purple mr-2"></div>
                    <span>Nivel esperado</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;
