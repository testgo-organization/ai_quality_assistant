
/**
 * Utility functions for chart components
 */

/**
 * Generates random data for demonstration purposes
 */
export const getRandomData = (count: number, max: number = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * max) + 10,
  }));
};

/**
 * Generate mock contact reasons data
 */
export const getMockContactReasons = () => [
  { name: "Consultas de Productos", value: 35 },
  { name: "Soporte Técnico", value: 27 },
  { name: "Quejas de Servicio", value: 18 },
  { name: "Ventas y Cotizaciones", value: 15 },
  { name: "Facturación", value: 8 },
  { name: "Devoluciones", value: 5 },
];

/**
 * Generate mock sentiment analysis data
 */
export const getMockSentimentData = () => [
  { name: "Positivo", value: 42 },
  { name: "Neutral", value: 38 },
  { name: "Negativo", value: 20 },
];

/**
 * Generate mock satisfaction trend data
 */
export const getMockSatisfactionTrend = () => [
  { name: "Ene", csat: 72, nps: 63, responses: 120 },
  { name: "Feb", csat: 75, nps: 65, responses: 145 },
  { name: "Mar", csat: 73, nps: 62, responses: 130 },
  { name: "Abr", csat: 78, nps: 67, responses: 160 },
  { name: "May", csat: 82, nps: 70, responses: 175 },
  { name: "Jun", csat: 85, nps: 72, responses: 190 },
  { name: "Jul", csat: 87, nps: 76, responses: 210 },
  { name: "Ago", csat: 88, nps: 78, responses: 200 },
  { name: "Sep", csat: 86, nps: 77, responses: 195 },
  { name: "Oct", csat: 90, nps: 80, responses: 220 },
  { name: "Nov", csat: 92, nps: 83, responses: 240 },
  { name: "Dic", csat: 95, nps: 87, responses: 250 },
];

/**
 * Generate mock friction points data
 */
export const getMockFrictionPoints = () => [
  { name: "Tiempos de espera prolongados", value: 38 },
  { name: "Procesos complejos", value: 27 },
  { name: "Falta de información clara", value: 16 },
  { name: "Problemas técnicos recurrentes", value: 12 },
  { name: "Discrepancias en facturación", value: 7 },
];

/**
 * Generate mock satisfaction points data
 */
export const getMockSatisfactionPoints = () => [
  { name: "Atención personalizada", value: 32 },
  { name: "Resolución rápida de problemas", value: 28 },
  { name: "Amabilidad y empatía", value: 20 },
  { name: "Conocimiento técnico del agente", value: 15 },
  { name: "Seguimiento posterior", value: 5 },
];

/**
 * Generate mock customer journey data
 */
export const getMockJourneyData = () => [
  { subject: 'Primer contacto', actual: 85, esperado: 90, diferencia: -5 },
  { subject: 'Identificación', actual: 78, esperado: 85, diferencia: -7 },
  { subject: 'Diagnóstico', actual: 70, esperado: 82, diferencia: -12 },
  { subject: 'Resolución', actual: 75, esperado: 88, diferencia: -13 },
  { subject: 'Seguimiento', actual: 60, esperado: 80, diferencia: -20 },
  { subject: 'Cierre', actual: 80, esperado: 92, diferencia: -12 },
];

/**
 * Generate mock channel usage data
 */
export const getMockChannelUsage = () => [
  { name: "WhatsApp", value: 35, color: "#25D366" },
  { name: "Chat Web", value: 25, color: "#0084FF" },
  { name: "Llamada", value: 20, color: "#FF6B6B" },
  { name: "Email", value: 15, color: "#6B77FF" },
  { name: "Redes sociales", value: 5, color: "#F6A192" },
];

/**
 * Generate mock hourly distribution data
 */
export const getMockHourlyDistribution = () => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    // Create a realistic pattern with peak hours
    let volume = 0;
    if (i >= 8 && i <= 11) { // Morning peak
      volume = 40 + Math.floor(Math.random() * 30);
    } else if (i >= 14 && i <= 17) { // Afternoon peak
      volume = 50 + Math.floor(Math.random() * 40);
    } else if (i >= 18 && i <= 20) { // Evening moderate
      volume = 30 + Math.floor(Math.random() * 20);
    } else if (i >= 21 || i <= 6) { // Night low
      volume = 5 + Math.floor(Math.random() * 10);
    } else { // Other times moderate-low
      volume = 15 + Math.floor(Math.random() * 15);
    }
    
    return {
      name: `${i}:00`,
      value: volume
    };
  });
  
  return hours;
};
