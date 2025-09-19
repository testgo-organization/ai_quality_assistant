
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';
import Upload from './Upload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const statusIcon = (status: string) => {
  if (status === 'SUCCESS') return <Check className="h-5 w-5 text-green-500" />;
  if (status === 'ERROR') return <X className="h-5 w-5 text-red-500" />;
  if (status === 'PENDING') return <Loader2 className="h-5 w-5 text-tetgoai-blue animate-spin" />;
  return null;
};

const DashboardTable = ({ tasks, loading }: { tasks: any[]; loading: boolean }) => {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-tetgoai-blue" />
        <span className="ml-3 text-tetgoai-blue font-medium">Cargando registros...</span>
      </div>
    );
  }
  if (!tasks.length) {
    return null;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-slate-900 rounded shadow">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Archivo</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Humor</th>
            <th className="px-4 py-2 text-left">Razón</th>
            <th className="px-4 py-2 text-left">Sentimiento</th>
            <th className="px-4 py-2 text-left">NPS</th>
            <th className="px-4 py-2 text-left">CSAT</th>
            <th className="px-4 py-2 text-left">Calidad</th>
            <th className="px-4 py-2 text-left">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const kpi = task.result?.kpi_service || {};
            return (
              <tr key={task.task_id} className="border-b hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer">
                <td className="px-4 py-2 font-medium">
                  {task.result?.file_name && task.result.file_name.length > 15 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer">
                            {task.result.file_name.slice(0, 12)}...
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {task.result.file_name}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    task.result?.file_name || '-'
                  )}
                </td>
                <td className="px-4 py-2 flex items-center gap-2">{statusIcon(task.status)} {task.status}</td>
                <td className="px-4 py-2">{kpi.humor || '-'}</td>
                <td className="px-4 py-2">{kpi.razon_contact || '-'}</td>
                <td className="px-4 py-2">{kpi.sentiment || '-'}</td>
                <td className="px-4 py-2">{kpi.nps_prediction?.prediction ?? '-'}</td>
                <td className="px-4 py-2">{kpi.csat_prediction?.[0]?.prediction_question_1 ?? '-'}</td>
                <td className="px-4 py-2">{kpi.quality_evaluation?.puntaje ?? '-'}</td>
                <td className="px-4 py-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/dashboard/${task.task_id}`)}
                    disabled={task.status === 'PENDING'}
                    className={task.status === 'PENDING' ? 'opacity-50 cursor-not-allowed' : ''}
                    title={task.status === 'PENDING' ? 'Procesando...' : 'Ver detalle'}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const { user, getToken, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthChecked(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate('/dashboard-demo', { replace: true });
      return;
    }
    const fetchTasks = async () => {
      if (!user?.email) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}audio/process/task/user?email=${encodeURIComponent(user.email)}&limit=10&offset=0`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        if (!response.ok) throw new Error('Error al obtener los registros.');
        const data = await response.json();
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    // eslint-disable-next-line
  }, [user?.email, isAuthenticated, authChecked, navigate]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-tetgoai-blue" />
        <span className="ml-3 text-tetgoai-blue font-medium">Verificando sesión...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 pt-20 space-y-8">
      {(!loading && isAuthenticated && tasks.length === 0) ? (
        <Upload />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Resultados de Audios Procesados</h2>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
              <DashboardTable tasks={tasks} loading={loading} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
