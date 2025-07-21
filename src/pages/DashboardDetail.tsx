import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TranscriptionModal from '@/components/TranscriptionModal';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/config';

const DashboardDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}audio/process/status/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        if (!response.ok) throw new Error('Error al obtener el registro.');
        const data = await response.json();
        setTask(data || null);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
    // eslint-disable-next-line
  }, [getToken, taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-tetgoai-blue font-medium">Cargando detalle...</span>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-2xl mx-auto py-10 pt-20">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">No se encontró el resultado</h2>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpi = task.result?.kpi_service || {};
  const quality = kpi.quality_evaluation || {};
  const nps = kpi.nps_prediction || {};
  const csat = kpi.csat_prediction || [];
  const transcription = task.result?.transcription || [];

  return (
    <div className="max-w-4xl mx-auto py-10 pt-20 space-y-8">
      <Button onClick={() => navigate('/dashboard')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
      </Button>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Detalle de la Llamada</h2>
          <p className="text-gray-500 text-sm">Archivo: <span className="font-mono">{task.result?.file_name || '-'}</span></p>
          <Badge className="ml-2">Estado: {task.status}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge className="bg-blue-100 text-blue-800">Humor: {kpi.humor || '-'}</Badge>
            <Badge className="bg-purple-100 text-purple-800">Razón: {kpi.razon_contact || '-'}</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Sentimiento: {kpi.sentiment || '-'}</Badge>
            <Badge className={kpi.fcr?.fcr ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              FCR: {kpi.fcr?.fcr ? "Sí" : "No"}
            </Badge>
            <p className="text-xs text-gray-500">{kpi.fcr?.fcr_description}</p>
            <Badge className="bg-pink-100 text-pink-800">NPS: {nps.prediction ?? '-'}</Badge>
            <p className="text-xs text-gray-500">{nps.reason}</p>
            <Badge className="bg-green-100 text-green-800">CSAT1: {csat[0]?.prediction_question_1 ?? '-'}</Badge>
            <p className="text-xs text-gray-500">{csat[0]?.reason_1}</p>
            <Badge className="bg-green-100 text-green-800">CSAT2: {csat[1]?.prediction_question_2 ?? '-'}</Badge>
            <p className="text-xs text-gray-500">{csat[1]?.reason_2}</p>
            <Badge className="bg-teal-100 text-teal-800">Calidad: {quality.puntaje ?? '-'}</Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Recomendaciones</h3>
            <ul className="list-disc ml-5 text-sm">
              {(quality.recommendations || []).map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      <Button onClick={() => setShowModal(true)} className="mt-4">
        Ver Conversación
      </Button>
      <TranscriptionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        transcription={transcription}
      />
    </div>
  );
};

export default DashboardDetail; 