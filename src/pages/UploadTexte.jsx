
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { BrandAsset, UserSession } from "@/api/entities";
import StepIndicator from "../components/StepIndicator";
import FileUploadZone from "../components/FileUploadZone";

export default function UploadTexte() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [visualAssetsCount, setVisualAssetsCount] = useState(0);
  const [projectName, setProjectName] = useState("projet 1");
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  const projectNameFromUrl = urlParams.get('projectName');

  useEffect(() => {
    if (!sessionId) {
      navigate(createPageUrl("IdentiteVisuelle"));
    } else {
      // Utiliser le nom du projet passé en paramètre
      if (projectNameFromUrl) {
        setProjectName(decodeURIComponent(projectNameFromUrl));
      }
      loadVisualAssetsCount();
    }
  }, [sessionId, projectNameFromUrl, navigate]);

  const loadVisualAssetsCount = async () => {
    try {
      const visualAssets = await BrandAsset.filter({ 
        session_id: sessionId, 
        file_type: 'visual' 
      });
      setVisualAssetsCount(visualAssets.length);
    } catch (error) {
      console.error("Erreur lors du chargement des assets visuels:", error);
    }
  };

  const handleFilesSelected = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type);
    });
    setFiles([...files, ...validFiles]);
  };

  const handleFileRemove = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleBack = () => {
    navigate(createPageUrl("UploadVisuels"));
  };

  const handleSkip = async () => {
    // Mettre à jour la session pour indiquer qu'on passe cette étape
    const sessions = await UserSession.filter({ session_id: sessionId });
    if (sessions.length > 0) {
      await UserSession.update(sessions[0].id, {
        current_step: 2,
        has_textual_assets: false
      });
    }
    navigate(createPageUrl("Analyse") + `?session=${sessionId}&projectName=${encodeURIComponent(projectName)}`);
  };

  const handleContinue = async () => {
    if (files.length === 0) {
      handleSkip();
      return;
    }

    setIsUploading(true);
    try {
      // Upload chaque fichier et créer les assets de marque
      for (const file of files) {
        const { file_url } = await UploadFile({ file });
        await BrandAsset.create({
          file_url,
          file_name: file.name,
          file_type: 'textual',
          file_format: file.type,
          session_id: sessionId
        });
      }

      // Mettre à jour la session
      const sessions = await UserSession.filter({ session_id: sessionId });
      if (sessions.length > 0) {
        await UserSession.update(sessions[0].id, {
          current_step: 2,
          has_textual_assets: true
        });
      }

      navigate(createPageUrl("Analyse") + `?session=${sessionId}&projectName=${encodeURIComponent(projectName)}`);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
    }
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <StepIndicator currentStep={1} totalSteps={3} />
        
        <div className="text-center mb-12 slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chargez votre ton de voix, plateforme de marque
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ex : ton de voix, positionnement, vision, valeurs, personnalité
          </p>
        </div>

        {/* Section Historique des fichiers */}
        <div className="w-full max-w-2xl mx-auto mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {projectName}
                </h2>
                <p className="text-sm text-gray-600">
                  {visualAssetsCount} fichier(s) visuel(s) uploadé(s)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </div>
          </div>
        </div>

        <div className="slide-up" style={{ animationDelay: '0.2s' }}>
          <FileUploadZone
            acceptedTypes=".pdf,.doc,.docx"
            acceptedFormats="PDF, DOC, DOCX"
            files={files}
            onFilesSelected={handleFilesSelected}
            onFileRemove={handleFileRemove}
            title="Chargez vos fichiers"
            description="Documents définissant votre personnalité de marque et votre communication"
          />
        </div>

        <div className="flex justify-center gap-4 mt-12 slide-up" style={{ animationDelay: '0.4s' }}>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isUploading}
            className="px-8 py-3"
          >
            Je n'en possède pas
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            {isUploading ? "Upload en cours..." : "Continuer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
