
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import DashboardDetail from "./pages/DashboardDetail";
import DashboardDemo from "./pages/DashboardDemo";
import DashboardDemoDetail from "./pages/DashboardDemoDetail";
import { useNotificationPoller } from './hooks/use-notification-poller';
import { TaskNotificationListener } from './components/TaskNotificationListener';
import { useTaskPolling } from './hooks/useTaskPolling';
import AiGoChat from './components/AiGoChat';

const queryClient = new QueryClient();

function AuthModalWrapper() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  return <AuthModal open={isAuthModalOpen} onOpenChange={closeAuthModal} />;
}

function AiGoChatWrapper() {
  const { showAiGoChat, setShowAiGoChat } = useAuth();
  return <AiGoChat open={showAiGoChat} onOpenChange={setShowAiGoChat} />;
}

function AppContent() {
  // Iniciar el polling de notificaciones
  useNotificationPoller();
  
  // Iniciar el polling automático de tareas
  useTaskPolling();

  return (
    <div className="app-container">
      <Navbar />
      <AuthModalWrapper />
      <AiGoChatWrapper />
      <TaskNotificationListener />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard-demo" element={<DashboardDemo />} />
        <Route path="/dashboard-demo/:taskId" element={<DashboardDemoDetail />} />
        <Route path="/dashboard/:taskId" element={<DashboardDetail />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
