
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Sparkles, TrendingUp, Instagram, Facebook, Twitter } from "lucide-react";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { ChatMessage as ChatMessageEntity, UserSession } from "@/lib/supabaseHelpers";
import ChatMessage from "../components/ChatMessage";

export default function ChatReseauxSociaux() {
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
  }, [sessionId]); // Removed 'navigate' from dependency array as it's not directly used here

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadBrandAnalysis = async () => {
    try {
      // If sessionId is null, this filter will likely return an empty array,
      // which means brandAnalysis will remain empty, which is acceptable for a generic chat.
      const sessions = await UserSession.filter({ session_id: sessionId });
      if (sessions.length > 0 && sessions[0].brand_analysis) {
        setBrandAnalysis(sessions[0].brand_analysis);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'analyse:", error);
    }
  };

  const loadChatHistory = async () => {
    try {
      // If sessionId is null, this will default to a generic session_id like "_social".
      const chatMessages = await ChatMessageEntity.filter({ 
        session_id: `${sessionId || ""}_social`, 
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
        sendWelcomeMessage();
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  const sendWelcomeMessage = async () => {
    const welcomeMessage = `📱 **Votre expert réseaux sociaux est prêt !**

Bonjour ! Je suis votre agent spécialisé en réseaux sociaux. J'ai analysé votre identité de marque et je peux vous aider à :

**1. 🚀 Création de contenu social**
Créez des posts optimisés pour Instagram, Facebook, LinkedIn, TikTok... parfaitement alignés avec votre marque.

**2. 🔍 Audit de vos publications**
Envoyez-moi vos posts existants et je vous donnerai des conseils pour améliorer leur performance et engagement.

**Spécialités :**
• Formats optimaux par plateforme
• Hashtags et timing de publication
• Engagement et interaction
• Stories et contenus éphémères

**Comment puis-je vous aider aujourd'hui ?**`;

    const aiMessage = {
      message: welcomeMessage,
      isAi: true,
      timestamp: new Date().toISOString()
    };

    setMessages([aiMessage]);
    
    await ChatMessageEntity.create({
      session_id: `${sessionId || ""}_social`,
      message: welcomeMessage,
      sender: 'ai',
      message_type: 'text'
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      message: inputValue,
      isAi: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    await ChatMessageEntity.create({
      session_id: `${sessionId || ""}_social`,
      message: inputValue,
      sender: 'user',
      message_type: 'text'
    });

    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      let aiPrompt = `Tu es un expert en réseaux sociaux et marketing digital. Voici l'analyse de l'identité de marque de l'utilisateur :

${brandAnalysis}

L'utilisateur dit : "${currentInput}"

Réponds en tant qu'expert réseaux sociaux. Donne des conseils spécifiques pour chaque plateforme (Instagram, Facebook, LinkedIn, TikTok, etc.). Propose des stratégies d'engagement, des formats de contenu optimaux, des suggestions de hashtags pertinents.

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
        session_id: `${sessionId || ""}_social`,
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
      const { file_url } = await UploadFile({ file });
      
      const userMessage = {
        message: "J'ai envoyé un post pour analyse",
        isAi: false,
        timestamp: new Date().toISOString(),
        imageUrl: file_url
      };

      setMessages(prev => [...prev, userMessage]);
      
      await ChatMessageEntity.create({
        session_id: `${sessionId || ""}_social`,
        message: "Post partagé pour analyse",
        sender: 'user',
        message_type: 'image',
        image_url: file_url
      });

      setIsTyping(true);

      const aiPrompt = `Tu es un expert en réseaux sociaux. Analyse ce post en fonction de l'identité de marque suivante :

${brandAnalysis}

Évalue ce contenu social sur :
1. Cohérence avec la marque
2. Optimisation pour la plateforme
3. Potentiel d'engagement
4. Qualité visuelle et lisibilité
5. Suggestions d'amélioration
6. Recommandations de hashtags
7. Meilleur moment de publication

Donne une note sur 10 et des conseils concrets.`;

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
        session_id: `${sessionId || ""}_social`,
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
                className="p-6 bg-gradient-to-r from-pink-50 to-purple-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setInputValue("J'aimerais créer un post Instagram engageant pour promouvoir mon nouveau service")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Création de contenu social</h3>
                </div>
                <p className="text-sm text-gray-600">
                  "J'aimerais créer un post Instagram engageant pour promouvoir mon nouveau service"
                </p>
              </div>

              <div 
                className="p-6 bg-gradient-to-r from-blue-50 to-cyan-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Audit de publication</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Cliquez pour envoyer un post à analyser
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
                placeholder="Demandez conseil pour vos réseaux sociaux..."
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
