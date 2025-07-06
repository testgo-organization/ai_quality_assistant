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
import PricingSection from "@/components/PricingSection";

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
            <span className="gradient-text">TestGoAi</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Analiza, comprende y mejora las interacciones con tus clientes mediante 
            inteligencia artificial avanzada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-tetgoai-blue to-tetgoai-purple hover:opacity-90 transition-opacity">
              <Link to="/upload" className="flex items-center gap-2">
                <Upload size={18} />
                <span>Subir Archivos</span>
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="border-2 border-tetgoai-blue hover:bg-tetgoai-blue/5">
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
              icon={<MessageSquare className="h-8 w-8 text-tetgoai-blue" />}
              title="Motivos de Contacto"
              description="Identifica automáticamente por qué los clientes se comunican con tu empresa."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-tetgoai-purple" />}
              title="Análisis Emocional"
              description="Detecta emociones y sentimientos en las interacciones con tus clientes."
            />
            <FeatureCard 
              icon={<PieChart className="h-8 w-8 text-tetgoai-pink" />}
              title="Predicción CSAT/NPS"
              description="Anticipa el nivel de satisfacción y recomendación de tus clientes."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-tetgoai-green" />}
              title="Métricas en Tiempo Real"
              description="Visualiza KPIs relevantes y tendencias en un dashboard intuitivo."
            />
          </div>
        </div>
      </div>
      
      {/* Add the Pricing Section */}
      <PricingSection />
      
      {/* CTA Section */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 z-10 bg-gradient-to-r from-tetgoai-blue/10 to-tetgoai-purple/10">
        <div className="max-w-5xl mx-auto glass-card p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Comienza a analizar tus interacciones hoy
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Carga tus archivos de texto o audio y obtén insights valiosos sobre las conversaciones con tus clientes.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-tetgoai-blue to-tetgoai-purple hover:opacity-90 transition-opacity">
                <Link to="/upload" className="flex items-center gap-2">
                  <span>Comenzar ahora</span>
                  <ChevronRight size={16} />
                </Link>
              </Button>
            </div>
            
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-tetgoai-blue animate-float" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative py-8 px-4 sm:px-6 lg:px-8 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TestGoAi</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Plataforma Inteligente de Análisis de Contacto Cliente
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-tetgoai-blue">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-tetgoai-blue">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-tetgoai-blue">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-tetgoai-blue">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-tetgoai-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>contacto@tetgoai.com</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-tetgoai-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (800) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-tetgoai-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Ciudad de México, México</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-tetgoai-blue">Inicio</a></li>
                <li><a href="#" className="hover:text-tetgoai-blue">Características</a></li>
                <li><a href="#" className="hover:text-tetgoai-blue">Precios</a></li>
                <li><a href="#" className="hover:text-tetgoai-blue">Documentación</a></li>
                <li><a href="#" className="hover:text-tetgoai-blue">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} TestGoAi • Plataforma Inteligente de Análisis de Contacto Cliente
            </p>
          </div>
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
