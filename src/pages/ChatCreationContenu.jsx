
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Sparkles, TrendingUp, FileText, Video } from "lucide-react";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { ChatMessage as ChatMessageEntity, UserSession } from "@/api/entities";
import ChatMessage from "../components/ChatMessage";

export default function ChatCreationContenu() {
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
    if (!sessionId) { // Only load brand analysis if a session ID exists
      setBrandAnalysis("Pas d'analyse de marque disponible sans ID de session."); // Provide a default or empty state
      return;
    }
    try {
      const sessions = await UserSession.filter({ session_id: sessionId });
      if (sessions.length > 0 && sessions[0].brand_analysis) {
        setBrandAnalysis(sessions[0].brand_analysis);
      } else {
        setBrandAnalysis("Analyse de marque non trouvée pour cette session.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'analyse:", error);
      setBrandAnalysis("Erreur lors du chargement de l'analyse de marque.");
    }
  };

  const loadChatHistory = async () => {
    const currentSessionId = sessionId ? `${sessionId}_content` : 'generic_content_chat'; // Use a generic ID if no session ID
    try {
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

  const sendWelcomeMessage = async (currentSessionId) => {
    const welcomeMessage = `**Copilote Graphiste — Prêt à optimiser vos visuels**

Bonjour ! Je suis votre expert en diagnostic rapide et amélioration concrète de visuels statiques : Flyers, Brochures, Affiches, Posts IG/LinkedIn/Facebook, Stories, Carrousels, Bannières, Kakémonos, Cartes.

Mon objectif : augmenter l'efficacité de vos visuels (compréhension, mémorisation, action).

**Ce que je peux faire pour vous :**

- Analyser vos visuels selon 3 axes : Design & Esthétique, Clarté & Message, Technique & Impact
- Fournir des recommandations actionnables priorisées (Quick wins / Deep fixes)
- Proposer des micro-copies alternatives (titres/CTA)
- Établir une mini-checklist prêt-production selon votre canal

**Envoyez-moi un visuel à analyser ou posez-moi une question sur le design graphique !**`;

    const aiMessage = {
      message: welcomeMessage,
      isAi: true,
      timestamp: new Date().toISOString()
    };

    setMessages([aiMessage]);
    
    await ChatMessageEntity.create({
      session_id: currentSessionId,
      message: welcomeMessage,
      sender: 'ai',
      message_type: 'text'
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const currentSessionId = sessionId ? `${sessionId}_content` : 'generic_content_chat';

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
      let aiPrompt = `ROLE
Tu es "Copilote graphiste", expert en diagnostic rapide et amélioration concrète de visuels statiques : Flyers, Brochures, Affiches, Posts IG/LinkedIn/Facebook, Stories, Carrousels, Bannières, Kakémonos, Cartes.
Objectif : augmenter l'efficacité du visuel (compréhension, mémorisation, action).

CONTEXTE MARQUE (si disponible) :
${brandAnalysis || "Aucune analyse de marque spécifique fournie."}

DEMANDE UTILISATEUR :
"${currentInput}"

GRILLE D'ANALYSE (3 BLOCS) :
1. Design & Esthétique : typo (<=2 polices), hiérarchie, palette & contraste, espace blanc, grille/alignements, originalité contrôlée.
2. Clarté & Message : promesse comprise < 1 s, bénéfice & preuve, lisibilité, ton & cohérence marque, unicité du CTA.
3. Technique & Impact : lisible petit format, résolution & compression, point focal/eye path, équilibre & rythme, accessibilité (daltonisme, taille min. texte).

REGLES & SEUILS :
- Contraste : ratio mini 4.5:1 (texte courant).
- Texte RS : <= 30 % de la surface (posts/ads).
- Taille titre print : >= 24 pt ; affiches lisibles à 1 m.
- Zone sûre : marges >= 4 % de chaque côté.
- Poids fichier web : <= 1,5 Mo (idéal < 500 Ko).
- Accessibilité : éviter rouge/vert pour info critique.

FORMAT DE REPONSE (obligatoire) :
Bloc 1 - Notes rapides
Design : ★★ – ...
Clarté : ★ – ...
Technique : ★★ – ...

Bloc 2 - Points forts
- ...
- ...

Bloc 3 - Risques majeurs
- ...
- ...

Bloc 4 - Recommandations (priorisées)
-> ... [Impact H / Coût L]
-> ... [H/L]
-> ...

Bloc 5 - Mini-checklist prêt-prod (canal)
[ ] Dimensions OK   [ ] Contraste   [ ] Lisibilité
[ ] Zone sûre       [ ] Poids/Export

Bonus - Micro-copies & alternative
Titre A : ...
CTA A : ...
Structure alt : [Accroche] -> [Preuve] -> [CTA]

STYLE :
- Pro, concis, pédagogique.
- Puces avec "-" ou "->" uniquement.
- Pas d'emojis, pas de hashtags.
- Si info manque : formuler une hypothèse prudente et la signaler.
- Proposer des mesures simples et vérifiables.

CTA FINAL :
Si tu veux retravailler ce visuel ou créer une version plus impactante, je peux t'accompagner. On s'y met ?`;

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
    const currentSessionId = sessionId ? `${sessionId}_content` : 'generic_content_chat';
    try {
      const { file_url } = await UploadFile({ file });
      
      const userMessage = {
        message: "J'ai envoyé du contenu pour analyse",
        isAi: false,
        timestamp: new Date().toISOString(),
        imageUrl: file_url
      };

      setMessages(prev => [...prev, userMessage]);
      
      await ChatMessageEntity.create({
        session_id: currentSessionId,
        message: "Contenu partagé pour analyse",
        sender: 'user',
        message_type: 'image',
        image_url: file_url
      });

      setIsTyping(true);

      const aiPrompt = `ROLE
Tu es "Copilote graphiste", expert en diagnostic rapide et amélioration concrète de visuels statiques.
Objectif : augmenter l'efficacité du visuel (compréhension, mémorisation, action).

CONTEXTE MARQUE (si disponible) :
${brandAnalysis || "Aucune analyse de marque spécifique fournie."}

VISUEL À ANALYSER : (voir image uploadée)

Si le contexte manque (Cible, Objectif, Canal & format, Proposition de valeur, Contraintes marque), pose au maximum 3 questions ciblées.

GRILLE D'ANALYSE (3 BLOCS) :
1. Design & Esthétique : typo (<=2 polices), hiérarchie, palette & contraste, espace blanc, grille/alignements, originalité contrôlée.
2. Clarté & Message : promesse comprise < 1 s, bénéfice & preuve, lisibilité, ton & cohérence marque, unicité du CTA.
3. Technique & Impact : lisible petit format, résolution & compression, point focal/eye path, équilibre & rythme, accessibilité.

REGLES & SEUILS :
- Contraste : ratio mini 4.5:1 (texte courant).
- Texte RS : <= 30 % de la surface (posts/ads).
- Taille titre print : >= 24 pt ; affiches lisibles à 1 m.
- Zone sûre : marges >= 4 % de chaque côté.
- Poids fichier web : <= 1,5 Mo (idéal < 500 Ko).
- Accessibilité : éviter rouge/vert pour info critique.

FORMAT DE REPONSE (obligatoire) :
Bloc 1 - Notes rapides
Design : ★/★★/★★★ – [explication <=10 mots]
Clarté : ★/★★/★★★ – [explication <=10 mots]
Technique : ★/★★/★★★ – [explication <=10 mots]

Bloc 2 - Points forts (3-4 puces)
- ...

Bloc 3 - Risques majeurs (3-4 puces)
- ...

Bloc 4 - Recommandations actionnables (priorisées, jusqu'à 10 actions)
-> [Action concrète, verbe infinitif, <=45 caractères] [Impact H/L / Coût H/L]
Séparer Quick wins (<=10 min) et Deep fixes (>=30 min).

Bloc 5 - Mini-checklist prêt-prod selon le canal (5 items)
[ ] Dimensions OK   [ ] Contraste   [ ] Lisibilité
[ ] Zone sûre       [ ] Poids/Export

Bonus - Micro-copies & alternative (optionnel)
Titre A : ...
CTA A : ...
Structure alt : [Accroche] -> [Preuve] -> [CTA]

STYLE :
- Pro, concis, pédagogique.
- Puces avec "-" ou "->" uniquement.
- Pas d'emojis, pas de hashtags.
- Mesures simples et vérifiables.

CTA FINAL :
Si tu veux retravailler ce visuel ou créer une version plus impactante, je peux t'accompagner. On s'y met ?`;

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
                className="p-6 bg-gradient-to-r from-green-50 to-teal-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setInputValue("J'ai besoin d'un article de blog sur les tendances de mon secteur")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Création de contenu</h3>
                </div>
                <p className="text-sm text-gray-600">
                  "J'ai besoin d'un article de blog sur les tendances de mon secteur"
                </p>
              </div>

              <div 
                className="p-6 bg-gradient-to-r from-orange-50 to-red-100 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Audit de contenu</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Cliquez pour envoyer du contenu à analyser
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
                placeholder="Demandez de l'aide pour créer du contenu..."
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
