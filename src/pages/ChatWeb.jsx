
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Sparkles, TrendingUp, Globe, Monitor } from "lucide-react";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { ChatMessage as ChatMessageEntity, UserSession } from "@/lib/supabaseHelpers";
import ChatMessage from "../components/ChatMessage";

export default function ChatWeb() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [brandAnalysis, setBrandAnalysis] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');

  useEffect(() => {
    // We no longer navigate away if there's no sessionId, allowing generic chat.
    // If sessionId exists, load specific data. If not, functions will default to generic behavior.
    loadChatHistory();
    loadBrandAnalysis();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadBrandAnalysis = async () => {
    try {
      // Only load brand analysis if a sessionId is present
      if (sessionId) {
        const sessions = await UserSession.filter({ session_id: sessionId });
        if (sessions.length > 0 && sessions[0].brand_analysis) {
          setBrandAnalysis(sessions[0].brand_analysis);
        }
      } else {
        setBrandAnalysis(""); // Clear if no session ID
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'analyse:", error);
    }
  };

  const loadChatHistory = async () => {
    try {
      // Use a default session ID if none is provided for generic chat
      const currentSessionId = sessionId || "_web_generic_session";
      const chatMessages = await ChatMessageEntity.filter({ 
        session_id: currentSessionId, 
      }, "-created_date");
      const formattedMessages = chatMessages.map(msg => ({
        id: msg.id,
        message: msg.message,
        isAi: msg.sender === 'ai',
        timestamp: msg.created_date,
        imageUrl: msg.image_url
      }));
      
      setMessages(formattedMessages);
      
      if (formattedMessages.length === 0) {
        sendWelcomeMessage(currentSessionId);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  const sendWelcomeMessage = async (targetSessionId) => {
    const welcomeMessage = `🌐 **Votre expert web design est connecté !**

Bonjour ! Je suis votre agent spécialisé en création web. Avec votre identité de marque, je peux vous accompagner sur :

**1. 🚀 Conception web guidée**
Sites web, landing pages, interfaces utilisateur... tout aligné avec votre identité visuelle.

**2. 🔍 Audit UX/UI**
Envoyez-moi vos maquettes ou captures d'écran pour une analyse complète de l'expérience utilisateur.

**Spécialités :**
• Design responsive et mobile-first
• Optimisation UX et conversion
• Cohérence de l'identité visuelle
• Accessibilité et performance
• Wireframes et prototypes

**Sur quoi voulez-vous travailler aujourd'hui ?**`;

    const aiMessage = {
      message: welcomeMessage,
      isAi: true,
      timestamp: new Date().toISOString()
    };

    setMessages([aiMessage]);
    
    await ChatMessageEntity.create({
      session_id: targetSessionId,
      message: welcomeMessage,
      sender: 'ai',
      message_type: 'text'
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const currentSessionId = sessionId || "_web_generic_session";

    const userMessage = {
      message: inputValue,
      isAi: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    await ChatMessageEntity.create({
      session_id: currentSessionId,
      message: inputValue,
      sender: 'user',
      message_type: 'text'
    });

    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      let aiPrompt = `Tu es un expert en web design et UX/UI. `;
      if (brandAnalysis) {
        aiPrompt += `Voici l'analyse de l'identité de marque de l'utilisateur :

${brandAnalysis}

`;
      }
      aiPrompt += `L'utilisateur dit : "${currentInput}"

Réponds en tant qu'expert web design. Donne des conseils sur l'architecture, l'expérience utilisateur, le responsive design, les tendances web actuelles, et l'intégration de l'identité de marque dans le design web.

Structure tes réponses avec des emojis et du markdown pour une meilleure lisibilité.`;

      const aiResponse = await InvokeLLM({
        prompt: aiPrompt
      });

      setIsTyping(false);
      
      const aiMessage = {
        message: aiResponse,
        isAi: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      await ChatMessageEntity.create({
        session_id: currentSessionId,
        message: aiResponse,
        sender: 'ai',
        message_type: 'text'
      });

    } catch (error) {
      setIsTyping(false);
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const currentSessionId = sessionId || "_web_generic_session";

      const { file_url } = await UploadFile({ file });
      
      const userMessage = {
        message: "J'ai envoyé une maquette/interface pour analyse",
        isAi: false,
        timestamp: new Date().toISOString(),
        imageUrl: file_url
      };

      setMessages(prev => [...prev, userMessage]);
      
      await ChatMessageEntity.create({
        session_id: currentSessionId,
        message: "Interface partagée pour analyse",
        sender: 'user',
        message_type: 'image',
        image_url: file_url
      });

      setIsTyping(true);

      let aiPrompt = `Tu es un expert en web design et UX/UI. Analyse cette interface/maquette.`;
      if (brandAnalysis) {
        aiPrompt += ` en fonction de l'identité de marque suivante :

${brandAnalysis}

`;
      } else {
        aiPrompt += `

`;
      }
      
      aiPrompt += `Évalue ce design web sur :
1. Cohérence avec l'identité de marque (si applicable)
2. Expérience utilisateur (navigation, lisibilité)
3. Design responsive et mobile-friendly
4. Hiérarchie visuelle et call-to-actions
5. Accessibilité et performance
6. Tendances design actuelles
7. Suggestions d'amélioration concrètes

Donne une note sur 10 et des recommandations précises.`;

      const aiResponse = await InvokeLLM({
        prompt: aiPrompt,
        file_urls: [file_url]
      });

      setIsTyping(false);
      
      const aiMessage = {
        message: aiResponse,
        isAi: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      await ChatMessageEntity.create({
        session_id: currentSessionId,
        message: aiResponse,
        sender: 'ai',
        message_type: 'text'
      });

    } catch (error) {
      setIsTyping(false);
      console.error("Erreur lors de l'upload d'image:", error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {messages.length <= 1 && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <div 
                className="p-6 bg-gradient-to-r from-indigo-50 to-blue-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setInputValue("J'aimerais créer une landing page pour convertir mes visiteurs en clients")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Conception web</h3>
                </div>
                <p className="text-sm text-gray-600">
                  "J'aimerais créer une landing page pour convertir mes visiteurs en clients"
                </p>
              </div>

              <div 
                className="p-6 bg-gradient-to-r from-purple-50 to-pink-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Audit UX/UI</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Cliquez pour envoyer une maquette à analyser
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.message}
              isAi={message.isAi}
              timestamp={message.timestamp}
              imageUrl={message.imageUrl}
            />
          ))}
          
          {isTyping && (
            <ChatMessage
              message=""
              isAi={true}
              isTyping={true}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-12 h-12 rounded-xl"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Demandez des conseils en web design..."
                className="w-full px-4 py-4 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isTyping}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
