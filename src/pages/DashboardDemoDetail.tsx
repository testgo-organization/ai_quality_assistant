import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TranscriptionModal from '@/components/TranscriptionModal';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Copia de los datos de demoResults
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

const DashboardDemoDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { openAuthModal, closeAuthModal, isAuthenticated } = useAuth();

  // Redirigir automáticamente si el usuario inicia sesión desde el demo
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/upload');
    }
  }, [isAuthenticated, navigate]);

  const result = demoResults.find((t) => t.task_id === taskId);

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto py-10 pt-20">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">No se encontró el resultado</h2>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard-demo')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpi = result.kpi_service;
  const quality = kpi.quality_evaluation;
  const nps = kpi.nps_prediction;
  const csat = kpi.csat_prediction;

  // Forzar apertura del modal de autenticación
  const handleAuthClick = () => {
    closeAuthModal();
    setTimeout(() => {
      openAuthModal();
    }, 50);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 pt-20 space-y-8">
      <Button onClick={() => navigate('/dashboard-demo')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard Demo
      </Button>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Detalle de la Llamada (Ejemplo)</h2>
          <p className="text-gray-500 text-sm">Archivo: <span className="font-mono">{result.filename}</span></p>
          <Badge className="ml-2">Estado: {result.status}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge className="bg-blue-100 text-blue-800">Humor: {kpi.humor}</Badge>
            <Badge className="bg-purple-100 text-purple-800">Razón: {kpi.razon_contact}</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Sentimiento: {kpi.sentiment}</Badge>
            <Badge className={kpi.fcr.fcr ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              FCR: {kpi.fcr.fcr ? "Sí" : "No"}
            </Badge>
            <p className="text-xs text-gray-500">{kpi.fcr.fcr_description}</p>
            <Badge className="bg-pink-100 text-pink-800">NPS: {nps.prediction}</Badge>
            <p className="text-xs text-gray-500">{nps.reason}</p>
            <Badge className="bg-green-100 text-green-800">CSAT1: {csat[0].prediction_question_1}</Badge>
            <p className="text-xs text-gray-500">{csat[0].reason_1}</p>
            <Badge className="bg-green-100 text-green-800">CSAT2: {csat[1].prediction_question_2}</Badge>
            <p className="text-xs text-gray-500">{csat[1].reason_2}</p>
            <Badge className="bg-teal-100 text-teal-800">Calidad: {quality.puntaje}</Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Recomendaciones</h3>
            <ul className="list-disc ml-5 text-sm">
              {quality.recommendations.map((rec: string, i: number) => (
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
        transcription={result.transcription}
      />
      <div className="mt-6 text-center">
        <Button onClick={handleAuthClick} className="flex items-center gap-2">
          <LogIn className="h-5 w-5" /> Inicia sesión para ver tus resultados reales
        </Button>
      </div>
    </div>
  );
};

export default DashboardDemoDetail; 