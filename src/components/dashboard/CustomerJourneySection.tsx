
import React from "react";
import DashboardCard from "@/components/DashboardCard";
import { SimpleBarChart, SimpleRadarChart } from "@/components/charts";
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomerJourneySectionProps {
  journeyData: Array<{
    subject: string;
    actual: number;
    esperado: number;
    diferencia: number;
  }>;
}

const CustomerJourneySection: React.FC<CustomerJourneySectionProps> = ({ journeyData }) => {
  return (
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
  );
};

export default CustomerJourneySection;
