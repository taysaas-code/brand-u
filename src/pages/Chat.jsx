
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Camera, Image as ImageIcon, Sparkles, TrendingUp } from "lucide-react";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { ChatMessage as ChatMessageEntity, UserSession } from "@/api/entities";
import ChatMessage from "../components/ChatMessage";

export default function Chat() {
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
      if (sessionId) { // Only attempt to load brand analysis if a sessionId exists
        const sessions = await UserSession.filter({ session_id: sessionId });
        if (sessions.length > 0 && sessions[0].brand_analysis) {
          setBrandAnalysis(sessions[0].brand_analysis);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'analyse:", error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const chatSessionId = sessionId || 'generic_session'; // Use generic session if no specific ID
      const chatMessages = await ChatMessageEntity.filter({ session_id: chatSessionId }, "-created_date");
      const formattedMessages = chatMessages.map(msg => ({
        id: msg.id,
        message: msg.message,
        isAi: msg.sender === 'ai',
        timestamp: msg.created_date,
        imageUrl: msg.image_url
      }));
      
      setMessages(formattedMessages);
      
      // Si c'est la première visite pour cette session, envoyer le message de bienvenue
      if (formattedMessages.length === 0) {
        sendWelcomeMessage();
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  const sendWelcomeMessage = async () => {
    const welcomeMessage = sessionId ? 
      `🎨 **Votre designer graphique est prêt à travailler pour vous !**

Bonjour ! Je suis votre designer IA personnel. J'ai analysé votre identité de marque et je suis maintenant prêt à vous aider de deux façons :

**1. 🚀 Création guidée**
Dites-moi ce que vous voulez créer (post Instagram, flyer, bannière...) et je vous guiderai étape par étape pour produire un visuel parfaitement aligné avec votre marque.

**2. 🔍 Audit & correction** 
Envoyez-moi un visuel existant, et je l'analyserai selon votre identité de marque pour vous proposer des améliorations concrètes.

**Comment puis-je vous aider aujourd'hui ?**

💡 *Astuce : Vous pouvez aussi accéder aux ressources créatives et gérer vos projets via la barre latérale.*` :

      `🎨 **Votre designer graphique est là !**

Bonjour ! Je suis votre designer IA. Je peux vous aider à créer des visuels professionnels même sans analyse préalable de votre marque.

**Ce que je peux faire pour vous :**

**1. 🚀 Création avec conseils génériques**
Décrivez-moi ce que vous voulez créer et je vous donnerai les meilleures pratiques de design.

**2. 🔍 Audit visuel professionnel**
Envoyez-me vos visuels pour une analyse objective et des suggestions d'amélioration.

**3. 🎯 Conseils personnalisés**
Plus vous me parlez de votre marque, plus mes conseils seront précis !

**Comment puis-je vous aider aujourd'hui ?**

💡 *Pour des conseils ultra-personnalisés, créez un projet dans 'Identité Visuelle' et uploadez vos assets de marque.*`;

    const aiMessage = {
      message: welcomeMessage,
      isAi: true,
      timestamp: new Date().toISOString()
    };

    setMessages([aiMessage]);
    
    // Sauvegarder le message de bienvenue
    const chatSessionId = sessionId || 'generic_session';
    await ChatMessageEntity.create({
      session_id: chatSessionId,
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
    
    // Sauvegarder le message utilisateur
    const chatSessionId = sessionId || 'generic_session';
    await ChatMessageEntity.create({
      session_id: chatSessionId,
      message: inputValue,
      sender: 'user',
      message_type: 'text'
    });

    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Préparer le contexte pour l'IA
      let aiPrompt = brandAnalysis ? 
        `Tu es un designer professionnel expert. Voici l'analyse de l'identité de marque de l'utilisateur :

${brandAnalysis}

L'utilisateur dit : "${currentInput}"

Réponds de manière professionnelle et utile en tant que designer expert. Donne des conseils concrets et personnalisés basés sur son identité de marque. Si il veut créer quelque chose, guide-le étape par étape. Si il envoie une image pour audit, analyse-la selon son identité.

Utilise un ton amical mais professionnel, et structure tes réponses avec des emojis et du markdown pour une meilleure lisibilité.` :

        `Tu es un designer professionnel expert. L'utilisateur n'a pas encore défini son identité de marque spécifique.

L'utilisateur dit : "${currentInput}"

Réponds en tant que designer expert avec des conseils généraux de qualité. Donne des bonnes pratiques, des principes de design, et des conseils professionnels. Si tu as besoin de plus d'infos sur sa marque pour être plus précis, n'hésite pas à poser des questions.

Encourage-le à créer un projet dans "Identité Visuelle" s'il veut des conseils ultra-personnalisés.

Utilise un ton amical mais professionnel, et structure tes réponses avec des emojis et du markdown pour une meilleure lisibilité.`;

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
      
      // Sauvegarder la réponse de l'IA
      await ChatMessageEntity.create({
        session_id: chatSessionId,
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
        message: "J'ai envoyé une image pour analyse",
        isAi: false,
        timestamp: new Date().toISOString(),
        imageUrl: file_url
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Sauvegarder le message avec image
      const chatSessionId = sessionId || 'generic_session';
      await ChatMessageEntity.create({
        session_id: chatSessionId,
        message: "Image partagée pour analyse",
        sender: 'user',
        message_type: 'image',
        image_url: file_url
      });

      setIsTyping(true);

      // Analyser l'image avec l'IA
      const aiPrompt = brandAnalysis ?
        `Tu es un designer expert. Analyse cette image en fonction de l'identité de marque suivante :

${brandAnalysis}

Donne un audit détaillé de ce visuel :
1. Ce qui fonctionne bien selon l'identité de marque
2. Ce qui pourrait être amélioré 
3. Suggestions concrètes d'amélioration
4. Note globale sur 10

Sois constructif et propose des solutions pratiques.` :

        `Tu es un designer expert. Analyse cette image avec un regard professionnel :

Donne un audit détaillé de ce visuel :
1. Points forts du design
2. Axes d'amélioration possibles
3. Respect des bonnes pratiques de design
4. Suggestions concrètes d'amélioration
5. Note globale sur 10

Sois constructif et propose des solutions pratiques. Si tu as besoin de plus d'infos sur la marque pour être plus précis, demande-les.`;

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
        session_id: chatSessionId,
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
      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Suggestions initiales */}
          {messages.length <= 1 && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <div 
                className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setInputValue("J'aimerais créer un post Instagram pour promouvoir mon nouveau produit")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Création guidée</h3>
                </div>
                <p className="text-sm text-gray-600">
                  "J'aimerais créer un post Instagram pour promouvoir mon nouveau produit"
                </p>
              </div>

              <div 
                className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Audit & correction</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Cliquez pour envoyer une image à analyser
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
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

      {/* Zone de saisie */}
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
                placeholder="Décrivez ce que vous voulez créer ou demandez conseil..."
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
