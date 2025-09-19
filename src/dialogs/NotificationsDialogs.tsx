import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

const SuccessAnimation = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="6" strokeLinecap="round"
      strokeDasharray="251.2" strokeDashoffset="251.2">
      <animate attributeName="stroke-dashoffset" from="251.2" to="0" dur="0.6s" fill="freeze" />
    </circle>
    <path d="M30 50 L44 64 L68 40" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      pathLength="100" strokeDasharray="100" strokeDashoffset="100">
      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.4s" begin="0.45s" fill="freeze" />
    </path>
    <circle cx="48" cy="48" r="44" stroke="#10b981" strokeOpacity="0.15" strokeWidth="2">
      <animate attributeName="r" from="36" to="44" dur="0.4s" begin="0.5s" fill="freeze" />
      <animate attributeName="stroke-opacity" from="0.0" to="0.15" dur="0.4s" begin="0.5s" fill="freeze" />
    </circle>
  </svg>
);

export type FullPageNotificationProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  imageSrc?: string; // optional GIF or image
  autoCloseMs?: number; // deprecated: timer removed per UX
  children?: React.ReactNode; // optional custom body
  successAnim?: boolean; // show generic success animation
};

const FullPageNotification: React.FC<FullPageNotificationProps> = ({
  open,
  onClose,
  title,
  message,
  icon,
  imageSrc,
  autoCloseMs,
  children,
  successAnim,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 border-none bg-transparent shadow-none">
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative glass-card p-6 md:p-8 rounded-2xl shadow-2xl border-2 border-tetgoai-blue/10 max-w-md w-[90%] text-center">
            <button
              aria-label="Cerrar"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-md p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
            {icon && <div className="mb-3 flex justify-center">{icon}</div>}
            {successAnim && !imageSrc && (
              <div className="mb-3 flex justify-center"><SuccessAnimation /></div>
            )}
            {imageSrc && (
              <img src={imageSrc} alt="notification" className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-3 rounded-xl shadow-md border-2 border-tetgoai-green/30" />
            )}
            {title && <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>}
            {message && <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-2">{message}</p>}
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullPageNotification;
