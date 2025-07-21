import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface TranscriptionTurn {
  agente: string;
  cliente: string;
}

interface TranscriptionModalProps {
  open: boolean;
  onClose: () => void;
  transcription: TranscriptionTurn[];
}

function parseConversation(transcription: TranscriptionTurn[]) {
  const messages: { role: 'agente' | 'cliente'; text: string }[] = [];
  let agentBuffer = '';
  transcription.forEach((turn) => {
    if (turn.agente) {
      agentBuffer += (agentBuffer ? ' ' : '') + turn.agente;
    }
    if (turn.cliente) {
      if (agentBuffer) {
        messages.push({ role: 'agente', text: agentBuffer });
        agentBuffer = '';
      }
      messages.push({ role: 'cliente', text: turn.cliente });
    }
  });
  if (agentBuffer) {
    messages.push({ role: 'agente', text: agentBuffer });
  }
  return messages;
}

const TranscriptionModal: React.FC<TranscriptionModalProps> = ({ open, onClose, transcription }) => {
  const messages = parseConversation(transcription);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conversación</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'agente' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[70%] whitespace-pre-line break-words shadow-sm ${
                  msg.role === 'agente'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <span className="font-semibold">{msg.role === 'agente' ? 'Agente' : 'Cliente'}:</span>
                <span className="ml-2">{msg.text}</span>
              </div>
            </div>
          ))}
        </div>
        <DialogClose asChild>
          <button className="mt-4 px-4 py-2 bg-tetgoai-blue text-white rounded">Cerrar</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default TranscriptionModal; 