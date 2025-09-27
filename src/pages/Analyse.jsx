
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/api/integrations";
import { BrandAsset, UserSession } from "@/api/entities";
import { Bot, Sparkles, Palette, Type, Heart, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepIndicator from "../components/StepIndicator";

export default function Analyse() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [projectName, setProjectName] = useState("projet 1");
  const [totalFiles, setTotalFiles] = useState(0);
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  const projectNameFromUrl = urlParams.get('projectName');

  const analysisSteps = [
    {
      id: 1,
      name: "Couleurs & Esthétique",
      shortName: "Palette chromatique",
      icon: Palette,
      threshold: 33,
      status: "Analysé",
      completed: "Identifiée"
    },
    {
      id: 2,
      name: "Typographie & Style",
      shortName: "Style typographique", 
      icon: Type,
      threshold: 66,
      status: "Analysé",
      completed: "Analysé"
    },
    {
      id: 3,
      name: "Personnalité & Valeurs",
      shortName: "Personnalité de marque",
      icon: Heart,
      threshold: 100,
      status: "Définie",
      completed: "Définie"
    }
  ];

  useEffect(() => {
    if (!sessionId) {
      navigate(createPageUrl("IdentiteVisuelle"));
      return;
    }
    // Utiliser le nom du projet passé en paramètre
    if (projectNameFromUrl) {
      setProjectName(decodeURIComponent(projectNameFromUrl));
    }
    loadProjectData();
    startAnalysis();
  }, [sessionId, projectNameFromUrl, navigate]);

  const loadProjectData = async () => {
    try {
      const assets = await BrandAsset.filter({ session_id: sessionId });
      setTotalFiles(assets.length);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const startAnalysis = async () => {
    try {
      // Animation de progression fluide
      const animateProgress = () => {
        return new Promise((resolve) => {
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 1;
            setProgress(currentProgress);
            
            if (currentProgress >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 80); // Progression sur ~8 secondes
        });
      };

      await animateProgress();

      // Récupérer les assets pour l'analyse IA
      const assets = await BrandAsset.filter({ session_id: sessionId });
      const fileUrls = assets.map(asset => asset.file_url);
      
      let analysisPrompt = `Tu es un expert designer et consultant en identité de marque. Analyse les fichiers fournis et crée un profil complet de marque.

Voici ce que tu dois analyser et retourner sous forme de rapport structuré :

1. **IDENTITÉ VISUELLE**
   - Couleurs dominantes et palette chromatique
   - Typographies utilisées et style
   - Style graphique général (moderne, classique, minimaliste, etc.)
   - Éléments visuels récurrents

2. **TON DE VOIX & PERSONNALITÉ**
   - Personnalité de la marque
   - Ton de communication
   - Valeurs transmises
   - Positionnement

3. **RECOMMANDATIONS CRÉATIVES**
   - Points forts à conserver
   - Axes d'amélioration
   - Suggestions pour futurs visuels

Sois précis, professionnel et donne des conseils concrets utilisables pour créer de nouveaux visuels.`;

      if (fileUrls.length === 0) {
        analysisPrompt = `L'utilisateur n'a pas fourni de fichiers de marque. Crée un profil générique mais utile avec des conseils pour développer une identité visuelle cohérente. Donne des recommandations sur les couleurs, typographies, et styles visuels populaires pour différents secteurs.`;
      }

      // Appel à l'IA pour analyser les fichiers
      const analysis = await InvokeLLM({
        prompt: analysisPrompt,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined
      });

      // Sauvegarder l'analyse dans la session
      const sessions = await UserSession.filter({ session_id: sessionId });
      if (sessions.length > 0) {
        await UserSession.update(sessions[0].id, {
          current_step: 3,
          brand_analysis: analysis
        });
      }

      setIsComplete(true);

    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
      setTimeout(() => {
        navigate(createPageUrl("Chat") + `?session=${sessionId}`);
      }, 2000);
    }
  };

  const handleStartCreating = () => {
    navigate(createPageUrl("Chat") + `?session=${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <StepIndicator currentStep={2} totalSteps={3} />
        
        <div className="text-center slide-up">
          {/* Icône principale */}
          <div className="relative mb-8">
            <div className={`
              w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all duration-1000
              ${isComplete 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }
            `}>
              {isComplete ? (
                <Brain className="w-16 h-16 text-white" />
              ) : (
                <Bot className="w-16 h-16 text-white" />
              )}
            </div>
            
            {!isComplete && (
              <>
                {/* Particules d'analyse */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 border-2 border-blue-200 rounded-full animate-spin opacity-30"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-52 h-52 border-2 border-purple-200 rounded-full animate-spin opacity-20" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                </div>
                
                {/* Icône flottante */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </>
            )}
          </div>

          {/* Titre */}
          <h1 className={`
            text-4xl font-bold mb-4 transition-all duration-1000
            ${isComplete ? 'text-gray-900' : 'text-gray-900'}
          `}>
            {isComplete ? (
              <>Analyse terminée ! 🎉</>
            ) : (
              "Analyse en cours..."
            )}
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {isComplete ? (
              "Votre designer IA a parfaitement assimilé votre identité de marque et est prêt à vous accompagner."
            ) : (
              "Le cerveau du designer analyse votre image de marque"
            )}
          </p>

          {/* Barre de progression */}
          {!isComplete && (
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {progress}%
              </p>
            </div>
          )}

          {/* Étapes d'analyse */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            {analysisSteps.map((step) => {
              const StepIcon = step.icon;
              const isStepComplete = progress >= step.threshold || isComplete;
              const isInProgress = progress > (step.threshold - 33) && progress < step.threshold && !isComplete;

              return (
                <div
                  key={step.id}
                  className={`
                    p-6 rounded-2xl border-2 transition-all duration-700 ease-out
                    ${isStepComplete 
                      ? 'bg-green-50 border-green-200 transform scale-105' 
                      : isInProgress
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }
                  `}
                >
                  {/* Icône */}
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500
                    ${isStepComplete 
                      ? 'bg-green-500 text-white' 
                      : isInProgress
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }
                  `}>
                    <StepIcon className="w-8 h-8" />
                  </div>

                  {/* Titre */}
                  <h3 className={`
                    font-semibold text-base mb-2 transition-colors duration-500
                    ${isStepComplete ? 'text-green-900' : isInProgress ? 'text-blue-900' : 'text-gray-600'}
                  `}>
                    {isComplete ? step.shortName : step.name}
                  </h3>

                  {/* Status */}
                  <div className={`
                    transition-all duration-500
                    ${isStepComplete 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-50 transform translate-y-2'
                    }
                  `}>
                    <span className={`
                      inline-block px-3 py-1 rounded-full text-sm font-medium
                      ${isStepComplete 
                        ? 'bg-green-100 text-green-700' 
                        : isInProgress
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }
                    `}>
                      {isStepComplete ? step.completed : isInProgress ? "En cours..." : step.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bouton de démarrage (quand terminé) */}
          {isComplete && (
            <div className="mb-12 animate-fade-in">
              <Button
                onClick={handleStartCreating}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg gap-2"
              >
                Commencer à créer →
              </Button>
            </div>
          )}

          {/* Résumé du projet */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Résumé du projet
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nom du projet</p>
                <p className="font-semibold text-gray-900">{projectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Éléments analysés</p>
                <p className="font-semibold text-gray-900">{totalFiles} fichier(s)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
