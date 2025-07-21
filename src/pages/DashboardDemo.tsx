import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, LogIn } from 'lucide-react';
import TranscriptionModal from '@/components/TranscriptionModal';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const demoResults = [
  {
    task_id: 'demo-1',
    filename: 'Ejemplo1.mp3',
    status: 'SUCCESS',
    kpi_service: {
      humor: 'Satisfacción',
      razon_contact: 'Consulta de producto',
      sentiment: 'positivo',
      fcr: {
        fcr: true,
        fcr_description: 'El requerimiento fue resuelto en la llamada.',
        if_process: true,
        if_process_description: 'Se siguió el proceso correctamente.',
        classification: 'consulta',
        classification_description: 'El cliente tenía una consulta general.'
      },
      nps_prediction: {
        prediction: 10,
        reason: 'El cliente quedó muy satisfecho con la atención.'
      },
      csat_prediction: [
        {
          prediction_question_1: 5,
          reason_1: 'El cliente recibió la información que necesitaba.',
          question_1: 'En una escala del 1 al 5, ¿cuál es el nivel de satisfacción del cliente con la atención recibida?'
        },
        {
          prediction_question_2: 5,
          reason_2: 'La atención fue clara y rápida.',
          question_2: 'En una escala del 1 al 5, ¿cuál es el nivel de satisfacción con la persona que atendió en cuanto a: claridad de la información, amabilidad, rapidez?'
        }
      ],
      quality_evaluation: {
        puntaje: 98,
        recommendations: [
          'Seguir con el mismo nivel de atención.',
          'Fomentar la empatía en el equipo.'
        ]
      }
    },
    transcription: [
      { agente: '¡Bienvenido! ¿En qué puedo ayudarte?', cliente: 'Quiero saber si tienen stock del producto X.' },
      { agente: 'Sí, tenemos stock disponible. ¿Deseas que te ayude a comprarlo?', cliente: 'Sí, por favor.' },
      { agente: 'Perfecto, te ayudo con la compra.', cliente: '' },
    ]
  },
  {
    task_id: 'demo-2',
    filename: 'Ejemplo2.mp3',
    status: 'ERROR',
    kpi_service: {
      humor: 'Frustración',
      razon_contact: 'Reclamo por entrega',
      sentiment: 'negativo',
      fcr: {
        fcr: false,
        fcr_description: 'No se resolvió el problema en la llamada.',
        if_process: false,
        if_process_description: 'No se siguió el proceso adecuado.',
        classification: 'problema',
        classification_description: 'El cliente tuvo un problema con la entrega.'
      },
      nps_prediction: {
        prediction: 3,
        reason: 'El cliente no recibió la solución esperada.'
      },
      csat_prediction: [
        {
          prediction_question_1: 1,
          reason_1: 'El cliente se mostró insatisfecho.',
          question_1: 'En una escala del 1 al 5, ¿cuál es el nivel de satisfacción del cliente con la atención recibida?'
        },
        {
          prediction_question_2: 2,
          reason_2: 'No se resolvió el problema.',
          question_2: 'En una escala del 1 al 5, ¿cuál es el nivel de satisfacción con la persona que atendió en cuanto a: claridad de la información, amabilidad, rapidez?'
        }
      ],
      quality_evaluation: {
        puntaje: 55,
        recommendations: [
          'Revisar el proceso de atención.',
          'Mejorar la comunicación con el cliente.'
        ]
      }
    },
    transcription: [
      { agente: 'Hola, ¿en qué puedo ayudarte?', cliente: 'No recibí mi pedido.' },
      { agente: 'Lamentamos el inconveniente, revisaremos tu caso.', cliente: '' },
      { agente: 'No encuentro información, ¿puedes darme más detalles?', cliente: 'Es el pedido 12345.' },
      { agente: 'Gracias, lo reviso.', cliente: '' },
    ]
  }
];

const statusIcon = (status: string) => {
  if (status === 'SUCCESS') return <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />;
  if (status === 'ERROR') return <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />;
  if (status === 'PENDING') return <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse" />;
  return null;
};

const DashboardDemo = () => {
  const navigate = useNavigate();

  const handleDetail = (task: any) => {
    navigate(`/dashboard-demo/${task.task_id}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 pt-20 space-y-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Ejemplo de Resultados de Audios Procesados</h2>
          <p className="text-gray-500 text-sm mt-2">Así se verá tu dashboard cuando inicies sesión y proceses tus audios.</p>
        </CardHeader>
        <CardContent>
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
                {demoResults.map((task) => (
                  <tr key={task.task_id} className="border-b hover:bg-blue-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-2 font-medium">
                      {task.filename && task.filename.length > 15 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer">
                                {task.filename.slice(0, 12)}...
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {task.filename}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        task.filename
                      )}
                    </td>
                    <td className="px-4 py-2 flex items-center gap-2">{statusIcon(task.status)} {task.status}</td>
                    <td className="px-4 py-2">{task.kpi_service.humor}</td>
                    <td className="px-4 py-2">{task.kpi_service.razon_contact}</td>
                    <td className="px-4 py-2">{task.kpi_service.sentiment}</td>
                    <td className="px-4 py-2">{task.kpi_service.nps_prediction.prediction}</td>
                    <td className="px-4 py-2">{task.kpi_service.csat_prediction[0].prediction_question_1}</td>
                    <td className="px-4 py-2">{task.kpi_service.quality_evaluation.puntaje}</td>
                    <td className="px-4 py-2">
                      <Button size="icon" variant="ghost" onClick={() => handleDetail(task)}>
                        <Eye className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDemo; 