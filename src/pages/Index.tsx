
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  BarChart3, 
  PieChart, 
  MessageSquare, 
  Users,
  TrendingUp, 
  ChevronRight 
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            Plataforma Inteligente de Análisis de Contacto Cliente
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4 mb-6">
            <span className="gradient-text">PIACC</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Analiza, comprende y mejora las interacciones con tus clientes mediante 
            inteligencia artificial avanzada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-piacc-blue to-piacc-purple hover:opacity-90 transition-opacity">
              <Link to="/upload" className="flex items-center gap-2">
                <Upload size={18} />
                <span>Subir Archivos</span>
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="border-2 border-piacc-blue hover:bg-piacc-blue/5">
              <Link to="/dashboard" className="flex items-center gap-2">
                <BarChart3 size={18} />
                <span>Ver Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 z-10 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Análisis inteligente de interacciones</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Descubre insights valiosos sobre las conversaciones con tus clientes
              mediante análisis avanzado de texto y voz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<MessageSquare className="h-8 w-8 text-piacc-blue" />}
              title="Motivos de Contacto"
              description="Identifica automáticamente por qué los clientes se comunican con tu empresa."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-piacc-purple" />}
              title="Análisis Emocional"
              description="Detecta emociones y sentimientos en las interacciones con tus clientes."
            />
            <FeatureCard 
              icon={<PieChart className="h-8 w-8 text-piacc-pink" />}
              title="Predicción CSAT/NPS"
              description="Anticipa el nivel de satisfacción y recomendación de tus clientes."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-piacc-green" />}
              title="Métricas en Tiempo Real"
              description="Visualiza KPIs relevantes y tendencias en un dashboard intuitivo."
            />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 z-10 bg-gradient-to-r from-piacc-blue/10 to-piacc-purple/10">
        <div className="max-w-5xl mx-auto glass-card p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Comienza a analizar tus interacciones hoy
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Carga tus archivos de texto o audio y obtén insights valiosos sobre las conversaciones con tus clientes.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-piacc-blue to-piacc-purple hover:opacity-90 transition-opacity">
                <Link to="/upload" className="flex items-center gap-2">
                  <span>Comenzar ahora</span>
                  <ChevronRight size={16} />
                </Link>
              </Button>
            </div>
            
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-piacc-blue animate-float" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative py-8 px-4 sm:px-6 lg:px-8 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} PIACC • Plataforma Inteligente de Análisis de Contacto Cliente
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="glass-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default Index;
