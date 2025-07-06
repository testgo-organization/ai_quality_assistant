
import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  price: string | null;
  features: PlanFeature[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

const plans: PricingPlan[] = [
  {
    name: "Explorador",
    description: "Para equipos pequeños que comienzan con el análisis de contactos",
    price: "Gratis",
    features: [
      { name: "Dashboard de análisis completo", included: true },
      { name: "5 archivos CSV (max 10MB c/u)", included: true },
      { name: "5 archivos de audio (max 5MB c/u)", included: true },
      { name: "Una sola cuenta de usuario", included: true },
      { name: "Soporte por email", included: true },
      { name: "Dashboard personalizados", included: false },
      { name: "Soporte 24/7", included: false },
    ],
    ctaText: "Comenzar gratis",
    ctaLink: "/register"
  },
  {
    name: "Profesional",
    description: "Para equipos medianos que necesitan análisis más detallados",
    price: "30",
    isPopular: true,
    features: [
      { name: "Dashboards detallados por módulo", included: true },
      { name: "1000 archivos CSV para analizar", included: true },
      { name: "100 archivos de audio", included: true },
      { name: "5 cuentas de usuario por empresa", included: true },
      { name: "Soporte prioritario", included: true },
      { name: "Dashboard personalizados", included: false },
      { name: "Soporte 24/7", included: false },
    ],
    ctaText: "Comenzar prueba de 14 días",
    ctaLink: "/register?plan=pro"
  },
  {
    name: "Enterprise",
    description: "Para organizaciones que necesitan soluciones completas",
    price: "100",
    features: [
      { name: "Dashboards detallados por módulo", included: true },
      { name: "Archivos CSV ilimitados", included: true },
      { name: "Archivos de audio ilimitados", included: true },
      { name: "Usuarios ilimitados", included: true },
      { name: "Soporte 24/7", included: true },
      { name: "Dashboards personalizados", included: true },
      { name: "API integración completa", included: true },
    ],
    ctaText: "Contactar ventas",
    ctaLink: "/contact"
  }
];

const PricingSection = () => {
  return (
    <div className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white/60 dark:bg-slate-900/60 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Planes y Precios</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu equipo y empresa
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col h-full border-2 transition-transform hover:-translate-y-1 ${
                plan.isPopular 
                  ? "border-tetgoai-blue shadow-lg dark:border-tetgoai-blue shadow-tetgoai-blue/20" 
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <CardHeader className="text-center pb-0">
                {plan.isPopular && (
                  <div className="bg-tetgoai-blue text-white py-1 px-3 rounded-full text-sm font-medium mx-auto mb-4 inline-block">
                    Más popular
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                  {plan.description}
                </p>
                <div className="flex items-end justify-center gap-1 mb-6">
                  {plan.price === "Gratis" ? (
                    <span className="text-4xl font-bold">Gratis</span>
                  ) : (
                    <>
                      <span className="text-xl font-medium">$</span>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 mb-1">/mes</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-tetgoai-green mr-2 shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-gray-500 dark:text-gray-400"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button 
                  asChild 
                  className={`w-full ${
                    plan.isPopular 
                      ? "bg-gradient-to-r from-tetgoai-blue to-tetgoai-purple" 
                      : plan.price === "Gratis"
                        ? "bg-gray-800 dark:bg-gray-200 dark:text-gray-800"
                        : "bg-tetgoai-blue"
                  }`}
                  size="lg"
                >
                  <Link to={plan.ctaLink}>
                    {plan.ctaText}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">¿Necesitas ayuda para elegir el plan adecuado?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Nuestro equipo está disponible para asesorarte en la elección del plan que mejor se adapte a tus necesidades.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-tetgoai-blue/10 dark:bg-tetgoai-blue/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-tetgoai-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Llámanos</p>
                <p className="font-medium">+1 (800) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-tetgoai-green/10 dark:bg-tetgoai-green/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-tetgoai-green">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Escríbenos</p>
                <p className="font-medium">contacto@tetgoai.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
