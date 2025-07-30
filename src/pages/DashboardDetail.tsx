import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardCard from '../components/DashboardCard';
import TranscriptionModal from '../components/TranscriptionModal';
import { API_BASE_URL } from '../config';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTaskStore } from '../hooks/use-task-status';

export interface TranscriptionTurn {
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
  agente: string;
  cliente: string;
}

interface Task {
  task_id: string;
  original_file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  result?: {
    analysis?: {
      categories?: {
        category: string;
        confidence: number;
      }[];
      humor?: string;
      razon_contact?: string;
      sentiment?: string;
      fcr?: {
        fcr?: boolean;
        fcr_description?: string;
      };
    };
    transcription?: TranscriptionTurn[];
  };
}

const DashboardDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const taskRef = useRef<Task | null>(null);
  const globalTasksRef = useRef<{task_id: string; filename: string; status?: string}[]>([]);
  
  // Acceder al store global de tareas
  const { tasks: globalTasks } = useTaskStore();

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  useEffect(() => {
    globalTasksRef.current = globalTasks;
  }, [globalTasks]);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      console.log(`🔄 Fetching tarea ${taskId}...`);
      const response = await fetch(`${API_BASE_URL}audio/process/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener el registro.');
      const data = await response.json();
      console.log(`📡 API Response - Tarea ${taskId}:`, data.status);
      setTask(data || null);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    }
  }, [taskId, getToken]);

  // Cargar datos iniciales
  useEffect(() => {
    const initializeFetch = async () => {
      setLoading(true);
      await fetchTask();
      setLoading(false);
    };
    initializeFetch();
  }, [fetchTask]);

  // SOLUCIÓN SIMPLE Y DIRECTA - Polling agresivo cada 2 segundos
  useEffect(() => {
    if (!taskId) return;

    // Limpiar intervalo anterior si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      console.log(`🔥 POLLING - Verificando tarea ${taskId}`);
      
      // 1. Verificar store global primero usando ref
      const currentGlobalTasks = globalTasksRef.current;
      if (currentGlobalTasks.length > 0) {
        const globalTask = currentGlobalTasks.find(t => t.task_id === taskId);
        if (globalTask && globalTask.status) {
          console.log(`📊 Store Global: ${globalTask.task_id} = ${globalTask.status}`);
          
          // Si el store dice SUCCESS pero nuestra tarea local no es completed
          const currentTask = taskRef.current;
          if (globalTask.status.toLowerCase() === 'success' && currentTask && currentTask.status !== 'completed') {
            console.log(`🚨 INCONSISTENCIA DETECTADA! Store=SUCCESS, Local=${currentTask.status}`);
            console.log(`🚀 ACTUALIZANDO INMEDIATAMENTE...`);
            await fetchTask();
            return;
          }
        }
      }
      
      // 2. Si la tarea local sigue pendiente/processing, hacer fetch directo usando ref
      const currentTask = taskRef.current;
      if (currentTask && (currentTask.status === 'pending' || currentTask.status === 'processing')) {
        console.log(`🔄 Tarea pendiente - Haciendo fetch directo...`);
        await fetchTask();
      }
    }, 2000); // Cada 2 segundos

    return () => {
      console.log(`🛑 Limpiando intervalo para tarea ${taskId}`);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [taskId, fetchTask]); // Incluir fetchTask pero usar refs para task y globalTasks

  // Efecto separado para actualizar refs cuando cambian los datos
  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  useEffect(() => {
    globalTasksRef.current = globalTasks;
  }, [globalTasks]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Procesando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                <p className="text-red-500">{error}</p>
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Registro no encontrado</h2>
                <p className="text-muted-foreground">No se encontró el registro solicitado.</p>
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalle del Análisis</h1>
              <p className="text-sm text-gray-500">ID: {task.task_id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={fetchTask} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            {getStatusBadge(task.status)}
          </div>
        </div>

        {/* Task Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Archivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Archivo</p>
                <p className="text-sm text-gray-900">{task.original_file_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <div className="mt-1">{getStatusBadge(task.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                <p className="text-sm text-gray-900">{formatDate(task.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {task.status === 'completed' && task.result ? (
          <div className="space-y-6">
            {/* Analysis Cards */}
            {task.result.analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sentiment Analysis */}
                {task.result.analysis.sentiment && (
                  <DashboardCard
                    title="Análisis de Sentimiento"
                    value={task.result.analysis.sentiment}
                    className="capitalize"
                  />
                )}

                {/* Mood Analysis */}
                {task.result.analysis.humor && (
                  <DashboardCard
                    title="Estado de Ánimo"
                    value={task.result.analysis.humor}
                    className="capitalize"
                  />
                )}

                {/* Contact Reason */}
                {task.result.analysis.razon_contact && (
                  <DashboardCard
                    title="Razón de Contacto"
                    value={task.result.analysis.razon_contact}
                    className="capitalize"
                  />
                )}

                {/* FCR */}
                {task.result.analysis.fcr && (
                  <DashboardCard
                    title="First Call Resolution"
                    value={task.result.analysis.fcr.fcr ? 'Sí' : 'No'}
                  />
                )}
              </div>
            )}

            {/* Categories */}
            {task.result.analysis?.categories && task.result.analysis.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categorías Detectadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {task.result.analysis.categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium capitalize">{category.category}</span>
                        <Badge variant="outline">
                          {(category.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transcription */}
            {task.result.transcription && task.result.transcription.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowModal(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Ver Transcripción Completa
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : task.status === 'failed' ? (
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Procesamiento Fallido</h2>
                <p className="text-red-500">El procesamiento del archivo falló. Por favor, inténtalo de nuevo.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">
                  {task.status === 'pending' ? 'Procesamiento Pendiente' : 'Procesando...'}
                </h2>
                <p className="text-muted-foreground">
                  {task.status === 'pending' 
                    ? 'El archivo está en cola para ser procesado.'
                    : 'El archivo se está procesando. Esto puede tomar unos minutos.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transcription Modal */}
      {showModal && task.result?.transcription && (
        <TranscriptionModal
          open={showModal}
          onClose={() => setShowModal(false)}
          transcription={task.result.transcription}
        />
      )}
    </div>
  );
};

export default DashboardDetail;