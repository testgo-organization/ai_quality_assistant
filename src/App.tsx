
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthModal from './components/AuthModal';
import DashboardDetail from "./pages/DashboardDetail";
import DashboardDemo from "./pages/DashboardDemo";
import DashboardDemoDetail from "./pages/DashboardDemoDetail";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  return (
    <>
      <Navbar />
      <AuthModal open={isAuthModalOpen} onOpenChange={closeAuthModal} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard-demo" element={<DashboardDemo />} />
        <Route path="/dashboard-demo/:taskId" element={<DashboardDemoDetail />} />
        <Route path="/dashboard/:taskId" element={<DashboardDetail />} />
        <Route path="/upload" element={<Upload />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <AuthModalWrapper />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-demo" element={<DashboardDemo />} />
            <Route path="/dashboard-demo/:taskId" element={<DashboardDemoDetail />} />
            <Route path="/dashboard/:taskId" element={<DashboardDetail />} />
            <Route path="/upload" element={<Upload />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

function AuthModalWrapper() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  return <AuthModal open={isAuthModalOpen} onOpenChange={closeAuthModal} />;
}

export default App;
