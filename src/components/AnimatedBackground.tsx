
import React from "react";
import { BarChart3, PieChart, TrendingUp, Heart, LineChart, Smile, ThumbsUp } from "lucide-react";

const icons = [
  { Component: BarChart3, className: "text-tetgoai-blue animate-float" },
  { Component: PieChart, className: "text-tetgoai-purple animate-pulse-slow" },
  { Component: TrendingUp, className: "text-tetgoai-green animate-bounce-slow" },
  { Component: Heart, className: "text-tetgoai-pink animate-pulse-slow" },
  { Component: LineChart, className: "text-tetgoai-blue animate-float" },
  { Component: Smile, className: "text-tetgoai-yellow animate-pulse-slow" },
  { Component: ThumbsUp, className: "text-tetgoai-green animate-bounce-slow" },
];

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "%"];
const emojis = ["😊", "👍", "🚀", "💯", "📈", "✅", "🎯", "🔍", "💬", "📊"];

type BackgroundElement = {
  id: number;
  type: "digit" | "emoji" | "icon";
  value: string | React.ReactNode;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: string;
  animationDuration: string;
};

const AnimatedBackground: React.FC = () => {
  const [elements, setElements] = React.useState<BackgroundElement[]>([]);
  
  React.useEffect(() => {
    // Generate random elements
    const newElements = [];
    
    // Generate digits
    for (let i = 0; i < 30; i++) {
      newElements.push({
        id: i,
        type: "digit",
        value: digits[Math.floor(Math.random() * digits.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1 + 0.8, // Size between 0.8 and 1.8rem
        opacity: Math.random() * 0.5 + 0.1, // Opacity between 0.1 and 0.6
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 10 + 10}s`,
      });
    }
    
    // Generate emojis
    for (let i = 0; i < 15; i++) {
      newElements.push({
        id: i + 30,
        type: "emoji",
        value: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1 + 1.2, // Size between 1.2 and 2.2rem
        opacity: Math.random() * 0.5 + 0.1, // Opacity between 0.1 and 0.6
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 10 + 10}s`,
      });
    }
    
    // Generate icons
    for (let i = 0; i < 15; i++) {
      const iconIndex = Math.floor(Math.random() * icons.length);
      const IconComponent = icons[iconIndex].Component;
      const iconClass = icons[iconIndex].className;
      
      newElements.push({
        id: i + 45,
        type: "icon",
        value: <IconComponent className={iconClass} />,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1 + 1, // Size between 1 and 2rem
        opacity: Math.random() * 0.5 + 0.1, // Opacity between 0.1 and 0.6
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 10 + 10}s`,
      });
    }
    
    setElements(newElements);
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((element) => (
        <div
          key={element.id}
          className="animated-bg-element absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            fontSize: `${element.size}rem`,
            opacity: element.opacity,
            animation: `float ${element.animationDuration} ease-in-out infinite`,
            animationDelay: element.animationDelay,
          }}
        >
          {element.type === "digit" || element.type === "emoji" ? (
            <div>{element.value}</div>
          ) : (
            element.value
          )}
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;
