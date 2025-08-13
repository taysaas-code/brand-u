import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ 
  size = "default", 
  text = "", 
  className = "",
  variant = "primary"
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const variantClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-400",
    white: "text-white"
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin`} />
      {text && (
        <span className="text-sm text-gray-600 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}