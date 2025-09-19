import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, Info, ShieldAlert, UserCheck, ClipboardList, TrendingUp, HeartPulse, FolderGit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import FullPageNotification from "./NotificationsDialogs";

// Dialog para saber más sobre errores graves cliente
const ErrorClienteDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Error grave cliente</DialogTitle>
      </DialogHeader>
      <div className="space-y-2 text-sm">
        <p>(Impactan directamente la satisfacción del cliente)</p>
        <ul className="list-disc pl-4">
          <li>El representante hace que el usuario se sienta respetado(a), atendido(a) y entendido(a).</li>
          <li>Evita ponerse a la defensiva, discutir o responder de mala manera.</li>
          <li>Evita interrupciones constantes o abruptas al cliente.</li>
          <li>Se abstiene de emitir comentarios negativos sobre el usuario.</li>
          <li>No utiliza palabras o frases que denoten disgusto; se muestra paciente y dispuesto a ayudar.</li>
          <li>No utiliza palabras que demuestren sarcasmo o burla (incluso ante clientes molestos u ofensivos).</li>
          <li>Evita exceder los tiempos de espera establecidos (el tiempo empieza desde que se informa la espera).</li>
          <li>Evita transferir el contacto sin atender la solicitud o sin informar al cliente.</li>
          <li>Informa al cliente cuando va a finalizar la interacción por inactividad o mala calidad de audio.</li>
          <li>Evita mantener conversaciones o distracciones externas mientras el cliente está en línea.</li>
          <li>Transfiere al contacto a un superior cuando el cliente lo solicita, después de manejar al menos 2 objeciones.</li>
          <li>Evita colocar al cliente en espera innecesaria; siempre informa y justifica.</li>
          <li>Evita inducir el abandono (ej. exceso de espera que hace que el cliente cuelgue).</li>
          <li>Evita negar servicio simulando fallas de audio o usando teclas de aislación (inducir abandono).</li>
        </ul>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const steps = [
  {
    title: "Información del servicio a auditar",
    short: "Servicio",
    content: (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-tetgoai-blue mb-1">Nombre del servicio</label>
            <input className="rounded-lg border-2 border-tetgoai-blue/30 focus:border-tetgoai-blue focus:ring-2 focus:ring-tetgoai-blue/30 bg-white dark:bg-slate-900 px-4 py-2 w-full transition-all shadow-sm" placeholder="Ejemplo: Banco" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-tetgoai-blue mb-1">Nombre de la campaña</label>
            <input className="rounded-lg border-2 border-tetgoai-purple/30 focus:border-tetgoai-purple focus:ring-2 focus:ring-tetgoai-purple/30 bg-white dark:bg-slate-900 px-4 py-2 w-full transition-all shadow-sm" placeholder="Ejemplo: Atención al cliente" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-tetgoai-blue mb-1">País</label>
            <Select defaultValue="MX">
              <SelectTrigger className="rounded-lg border-2 border-tetgoai-green/30 focus:border-tetgoai-green focus:ring-2 focus:ring-tetgoai-green/30 bg-white dark:bg-slate-900 px-2 py-2 w-full">
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MX">México</SelectItem>
                <SelectItem value="CO">Colombia</SelectItem>
                <SelectItem value="AR">Argentina</SelectItem>
                <SelectItem value="CL">Chile</SelectItem>
                <SelectItem value="PE">Perú</SelectItem>
                <SelectItem value="ES">España</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-tetgoai-blue mb-1">Tipo de gestión</label>
            <input className="rounded-lg border-2 border-tetgoai-pink/30 focus:border-tetgoai-pink focus:ring-2 focus:ring-tetgoai-pink/30 bg-white dark:bg-slate-900 px-4 py-2 w-full transition-all shadow-sm" placeholder="Ejemplo: entrante" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-tetgoai-blue mb-1">Breve descripción de la gestión</label>
          <textarea className="rounded-lg border-2 border-tetgoai-blue/30 focus:border-tetgoai-blue focus:ring-2 focus:ring-tetgoai-blue/30 bg-white dark:bg-slate-900 px-4 py-2 w-full transition-all shadow-sm resize-none" placeholder="Ejemplo: postventa, dudas, reclamo" />
        </div>
      </div>
    ),
  },
  {
    title: "Atributos o criterios de evaluación",
    short: "Criterios",
    content: (
      <div className="space-y-5 animate-fade-in">
        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 bg-tetgoai-blue/5 border border-tetgoai-blue/20 px-3 py-2 rounded-lg">
          Selecciona los criterios que deseas evaluar en este servicio. Puedes dejarlos tal cual (recomendado) o desactivar los que no apliquen para tu operación.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Habilidades básicas */}
          <label className="cursor-pointer">
            <input defaultChecked type="checkbox" className="peer sr-only" />
            <Card className="p-4 h-full border-2 peer-checked:border-tetgoai-blue peer-checked:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-tetgoai-blue" />
                <span className="font-semibold">Habilidades básicas</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Respeto, trato, evitar discusiones, interrupciones, sarcasmo, etc.</p>
            </Card>
          </label>
          {/* Reputación/Seguridad */}
          <label className="cursor-pointer">
            <input defaultChecked type="checkbox" className="peer sr-only" />
            <Card className="p-4 h-full border-2 peer-checked:border-tetgoai-purple peer-checked:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-tetgoai-purple" />
                <span className="font-semibold">Reputación y seguridad</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">No hablar mal de la empresa, no filtrar datos de clientes u organización.</p>
            </Card>
          </label>
          {/* Protocolos de atención */}
          <label className="cursor-pointer">
            <input defaultChecked type="checkbox" className="peer sr-only" />
            <Card className="p-4 h-full border-2 peer-checked:border-tetgoai-green peer-checked:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-5 h-5 text-tetgoai-green" />
                <span className="font-semibold">Protocolos de atención</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Saludo, despedida, personalización, volumen, coherencia, sondeo, etc.</p>
            </Card>
          </label>
        </div>
        <div>
          <span className="font-semibold">Clasificación de atributos:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <Card className="p-3 border-2 border-tetgoai-blue/30"><span className="text-sm font-medium text-tetgoai-blue">Error grave cliente</span></Card>
            <Card className="p-3 border-2 border-tetgoai-purple/30"><span className="text-sm font-medium text-tetgoai-purple">Error grave negocio</span></Card>
            <Card className="p-3 border-2 border-tetgoai-pink/30"><span className="text-sm font-medium text-tetgoai-pink">Errores no graves</span></Card>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => window.dispatchEvent(new CustomEvent('openErrorClienteDialog'))}><Info className="w-4 h-4" />Saber más</Button>
      </div>
    ),
  },
  {
    title: "Cómo califica la aplicación los atributos",
    short: "Calificación",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm animate-fade-in">
        <Card className="p-4 border-2 border-tetgoai-blue/30">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-tetgoai-blue" />
            <span className="font-semibold text-tetgoai-blue">Errores graves cliente</span>
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-tetgoai-pink/10 text-tetgoai-pink px-2 py-1 rounded-md whitespace-nowrap">Si falla 1 → 0</div>
            <div className="inline-flex items-center gap-2 bg-tetgoai-green/10 text-tetgoai-green px-2 py-1 rounded-md whitespace-nowrap">Si no falla ninguno → 100</div>
          </div>
        </Card>
        <Card className="p-4 border-2 border-tetgoai-purple/30">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-tetgoai-purple" />
            <span className="font-semibold text-tetgoai-purple">Errores graves negocio</span>
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-tetgoai-pink/10 text-tetgoai-pink px-2 py-1 rounded-md">Si falla 1 → 0</div>
            <div className="inline-flex items-center gap-2 bg-tetgoai-green/10 text-tetgoai-green px-2 py-1 rounded-md">Si no falla ninguno → 100</div>
          </div>
        </Card>
        <Card className="p-4 border-2 border-tetgoai-pink/30">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-tetgoai-pink" />
            <span className="font-semibold text-tetgoai-pink">Errores no graves</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            <div className="inline-flex items-center gap-2 bg-tetgoai-blue/10 text-tetgoai-blue px-2 py-1 rounded-md whitespace-nowrap">16 criterios, cada uno 6.25%</div>
            <div className="inline-flex items-center gap-2 bg-tetgoai-green/10 text-tetgoai-green px-2 py-1 rounded-md whitespace-nowrap">Inicio: 100</div>
            <div className="inline-flex items-center gap-2 bg-tetgoai-pink/10 text-tetgoai-pink px-2 py-1 rounded-md whitespace-nowrap">Por cada error: -6.25</div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    title: "Análisis adicional de la aplicación",
    short: "Análisis",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm animate-fade-in">
        <Card className="p-4 border-2 border-tetgoai-blue/30">
          <div className="flex items-center gap-2 mb-2">
            <FolderGit2 className="w-5 h-5 text-tetgoai-blue" />
            <span className="font-semibold text-tetgoai-blue">Motivos de contacto</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Agrupa solicitudes similares bajo un mismo nombre para facilitar el análisis.</p>
        </Card>
        <Card className="p-4 border-2 border-tetgoai-purple/30">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="w-5 h-5 text-tetgoai-purple" />
            <span className="font-semibold text-tetgoai-purple">Sentimientos y emociones</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Incluye expresiones coloquiales propias de cada país.</p>
        </Card>
        <Card className="p-4 border-2 border-tetgoai-green/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-tetgoai-green" />
            <span className="font-semibold text-tetgoai-green">Predicción de satisfacción</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">CSAT y NPS, diferenciando atención vs. experiencia total.</p>
        </Card>
      </div>
    ),
  },
];

const DialogQuickStart = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showRegistered, setShowRegistered] = useState(false);
  const [showFinalized, setShowFinalized] = useState(false);

  useEffect(() => {
    const handler = () => setShowErrorDialog(true);
    window.addEventListener('openErrorClienteDialog', handler);
    return () => window.removeEventListener('openErrorClienteDialog', handler);
  }, []);

  // Mostrar GIF al entrar al step 2 por 2.2s
  useEffect(() => {
    if (step === 1) {
      setShowRegistered(true);
      const t = setTimeout(() => setShowRegistered(false), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Barra de pasos visual
  const StepBar = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${i < step ? 'bg-tetgoai-green border-tetgoai-green text-white' : i === step ? 'bg-tetgoai-blue border-tetgoai-blue text-white ring-4 ring-tetgoai-blue/20' : 'bg-white border-gray-300 text-gray-400'}`}>
            {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          <span className={`mt-2 text-xs font-semibold ${i === step ? 'text-tetgoai-blue' : 'text-gray-400'}`}>{s.short}</span>
          {i < steps.length - 1 && <div className="w-full h-1 bg-gradient-to-r from-tetgoai-blue/30 to-tetgoai-purple/30 my-2 rounded-full" />}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-3xl w-[880px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-tetgoai-blue/10 animate-fade-in">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-tetgoai-blue tracking-tight">
                <span className="text-gray-400 font-medium mr-2">Paso {step + 1} de {steps.length}:</span>
                <span className="underline decoration-tetgoai-blue/40 underline-offset-4">{steps[step].title}</span>
              </DialogTitle>
            </div>
          </DialogHeader>
          <StepBar />
          {/* La notificación del GIF ahora es de página completa; se gestiona fuera del contenido del paso */}
          <div className="px-2 md:px-6 py-2 min-h-[360px]">{steps[step].content}</div>
          <DialogFooter className="flex mt-8">
            <div className="flex-1">
              <Button variant="outline" className="rounded-lg px-6 py-2" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Anterior</Button>
            </div>
            {step < steps.length - 1 ? (
              <Button className="bg-tetgoai-blue hover:bg-tetgoai-purple text-white rounded-lg px-6 py-2 shadow-md" onClick={() => setStep(s => s + 1)}>Siguiente</Button>
            ) : (
              <Button className="bg-tetgoai-green hover:bg-tetgoai-blue text-white rounded-lg px-6 py-2 shadow-md" onClick={() => { setShowFinalized(true); onClose(); }}>Finalizar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Notificación de página completa para GIF de registro post-Step1 */}
      <FullPageNotification
        open={showRegistered}
        onClose={() => setShowRegistered(false)}
        imageSrc="/servicio-registrado.gif"
        title="¡Servicio registrado!"
        message="Tu servicio ha sido guardado. Continuemos con la configuración."
        autoCloseMs={2200}
      />
      {/* Notificación final al terminar Step 4 */}
      <FullPageNotification
        open={showFinalized}
        onClose={() => setShowFinalized(false)}
        title="¡Configuración completada exitosamente!"
        message="Tu servicio de auditoría está listo para comenzar a analizar conversaciones"
        autoCloseMs={2500}
      />
      <ErrorClienteDialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)} />
    </>
  );
};

export default DialogQuickStart;
