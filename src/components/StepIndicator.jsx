import React from "react";
import { CheckCircle } from "lucide-react";

export default function StepIndicator({ currentStep, totalSteps = 3 }) {
  return (
    <div className="flex items-center justify-center mb-12">
      {Array.from({ length: totalSteps }, (_, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
              ${index < currentStep 
                ? 'bg-blue-600 text-white' 
                : index === currentStep 
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                  : 'bg-gray-200 text-gray-500'
              }
            `}>
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
          </div>
          {index < totalSteps - 1 && (
            <div className={`
              h-0.5 w-16 mx-4 transition-all duration-300
              ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}