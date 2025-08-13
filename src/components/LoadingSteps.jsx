import React, { useState, useEffect } from "react";
import { CheckCircle, Palette, Type, Heart } from "lucide-react";

export default function LoadingSteps({ onLoadingComplete, stepDuration = 2000 }) {
  const [completedSteps, setCompletedSteps] = useState(0);

  const steps = [
    {
      id: 1,
      name: "Couleurs & Esthétique",
      icon: Palette,
      description: "Analysé"
    },
    {
      id: 2,
      name: "Typographie & Style",
      icon: Type,
      description: "Analysé"
    },
    {
      id: 3,
      name: "Personnalité & Valeurs",
      icon: Heart,
      description: "Définie"
    }
  ];

  useEffect(() => {
    const timers = [];

    // Programmer chaque étape
    steps.forEach((_, index) => {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => {
          const newCount = prev + 1;
          
          // Si toutes les étapes sont terminées, appeler onLoadingComplete
          if (newCount === steps.length && onLoadingComplete) {
            setTimeout(() => {
              onLoadingComplete();
            }, 1000); // Petit délai pour voir la dernière étape validée
          }
          
          return newCount;
        });
      }, stepDuration * (index + 1));

      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [stepDuration, onLoadingComplete]);

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = completedSteps > index;
          const isActive = completedSteps === index + 1;

          return (
            <div
              key={step.id}
              className={`
                flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-1000 ease-out
                ${isCompleted 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-gray-50 border-2 border-gray-200'
                }
                ${isActive ? 'scale-105 shadow-lg' : ''}
              `}
            >
              {/* Icône */}
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-700 ease-out
                ${isCompleted 
                  ? 'bg-green-500 text-white transform rotate-12' 
                  : 'bg-gray-300 text-gray-500'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <StepIcon className="w-8 h-8" />
                )}
              </div>

              {/* Nom de l'étape */}
              <h3 className={`
                font-semibold text-base mb-2 transition-colors duration-500
                ${isCompleted ? 'text-green-900' : 'text-gray-600'}
              `}>
                {step.name}
              </h3>

              {/* Label de statut */}
              <div className={`
                transition-all duration-500 ease-out
                ${isCompleted 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-2'
                }
              `}>
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {isCompleted ? step.description : "En cours..."}
                </span>
              </div>

              {/* Animation de chargement pour l'étape active */}
              {!isCompleted && completedSteps === index && (
                <div className="mt-3 w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full animate-pulse"
                    style={{
                      animation: `progress ${stepDuration}ms linear`
                    }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}