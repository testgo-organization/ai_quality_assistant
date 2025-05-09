
import React, { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { 
  SimpleBarChart, 
  SimplePieChart, 
  SimpleLineChart,
  SimpleRadarChart 
} from "@/components/charts";
import { 
  BarChart3, 
  PieChart, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Heart,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Clock,
  Activity,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMockContactReasons,
  getMockSentimentData,
  getMockSatisfactionTrend,
  getMockFrictionPoints,
  getMockSatisfactionPoints,
  getMockJourneyData,
  getMockChannelUsage,
  getMockHourlyDistribution
} from "@/components/charts/utils";

const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  
  // Load mock data using our utility functions
  const contactReasons = getMockContactReasons();
  const sentimentData = getMockSentimentData();
  const satisfactionTrend = getMockSatisfactionTrend();
  const frictionPoints = getMockFrictionPoints();
  const satisfactionPoints = getMockSatisfactionPoints();
  const journeyData = getMockJourneyData();
  const channelUsage = getMockChannelUsage();
  const hourlyDistribution = getMockHourlyDistribution();
  
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
              <Calendar size={14} />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
        
        {/* KPI Cards */}
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
        
        {/* Charts - Row 1 */}
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
        
        {/* Charts - Row 2 */}
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
        
        {/* Friction & Satisfaction Points */}
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
        
        {/* New charts section */}
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
        
        {/* Customer Journey */}
        <DashboardCard 
          title="Journey del Cliente"
          icon={<Info size={18} />}
          subtitle="Análisis de satisfacción en cada etapa del recorrido del cliente"
        >
          <Tabs defaultValue="radar" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="radar">Vista Radar</TabsTrigger>
              <TabsTrigger value="bar">Vista Barras</TabsTrigger>
              <TabsTrigger value="description">Detalles</TabsTrigger>
            </TabsList>
            <TabsContent value="radar">
              <SimpleRadarChart 
                data={journeyData}
                dataKeys={[
                  { key: "actual", color: "#8B5CF6" },
                  { key: "esperado", color: "#3B82F6" }
                ]}
                height={350}
              />
            </TabsContent>
            <TabsContent value="bar">
              <SimpleBarChart 
                data={journeyData.map(item => ({
                  name: item.subject,
                  actual: item.actual,
                  esperado: item.esperado
                }))}
                colors={["#8B5CF6", "#3B82F6"]}
                dataKey="actual"
                height={350}
                showLegend={true}
                showXAxis={true}
                showYAxis={true}
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
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="text-left py-2 px-4 bg-gray-50 dark:bg-gray-800">Etapa</th>
                        <th className="text-center py-2 px-4 bg-gray-50 dark:bg-gray-800">Actual</th>
                        <th className="text-center py-2 px-4 bg-gray-50 dark:bg-gray-800">Esperado</th>
                        <th className="text-center py-2 px-4 bg-gray-50 dark:bg-gray-800">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {journeyData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                          <td className="py-2 px-4">{item.subject}</td>
                          <td className="py-2 px-4 text-center">{item.actual}%</td>
                          <td className="py-2 px-4 text-center">{item.esperado}%</td>
                          <td className={`py-2 px-4 text-center ${item.diferencia >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {item.diferencia > 0 ? `+${item.diferencia}` : item.diferencia}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-2"></div>
                    <span>Nivel actual</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-2"></div>
                    <span>Nivel esperado</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Recomendaciones</h4>
                  <ul className="mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Optimizar el proceso de seguimiento con alertas automatizadas</li>
                    <li>Mejorar la fase de diagnóstico con herramientas de IA predictiva</li>
                    <li>Implementar check-points adicionales en las etapas con mayores brechas</li>
                  </ul>
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
