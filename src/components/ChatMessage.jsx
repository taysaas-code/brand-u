import React from "react";
import { Bot, User, Camera, CheckCircle } from "lucide-react";

export default function ChatMessage({ message, isAi, timestamp, imageUrl, isTyping }) {
  return (
    <div className={`flex gap-4 mb-6 ${isAi ? '' : 'flex-row-reverse'}`}>
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${isAi 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
          : 'bg-gray-200 text-gray-600'
        }
      `}>
        {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>
      
      <div className={`flex-1 max-w-2xl ${isAi ? '' : 'text-right'}`}>
        <div className={`
          inline-block px-6 py-4 rounded-2xl
          ${isAi 
            ? 'bg-white border border-gray-100 text-gray-900' 
            : 'bg-blue-600 text-white'
          }
          ${isAi ? 'rounded-tl-md' : 'rounded-tr-md'}
        `}>
          {isTyping ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">Designer IA réfléchit...</span>
            </div>
          ) : (
            <>
              {imageUrl && (
                <div className="mb-3">
                  <img 
                    src={imageUrl} 
                    alt="Image partagée"
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Camera className="w-4 h-4" />
                    Image partagée
                  </div>
                </div>
              )}
              <div className="whitespace-pre-wrap">{message}</div>
            </>
          )}
        </div>
        
        {timestamp && !isTyping && (
          <div className={`text-xs text-gray-500 mt-2 ${isAi ? 'text-left' : 'text-right'}`}>
            {new Date(timestamp).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
}