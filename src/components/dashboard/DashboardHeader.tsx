
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DashboardHeaderProps {
  period: string;
  setPeriod: (period: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ period, setPeriod }) => {
  return (
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
  );
};

export default DashboardHeader;
