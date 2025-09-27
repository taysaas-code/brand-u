
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadFile } from "@/api/integrations";
import { BrandAsset, UserSession, Project } from "@/api/entities";
import { useToast } from "@/components/GlobalToast";
import StepIndicator from "../components/StepIndicator";
import FileUploadZone from "../components/FileUploadZone";

export default function UploadVisuels() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [projectName, setProjectName] = useState("Mon Projet");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { success, error } = useToast();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Créer la session dans la base de données
        await UserSession.create({
          session_id: sessionId,
          current_step: 0,
          has_visual_assets: false,
          has_textual_assets: false,
        });
        
        console.log("Session initialisée:", sessionId);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la session:", error);
        // Fallback vers localStorage si l'API échoue
        const sessionData = {
          session_id: sessionId,
          current_step: 0,
          has_visual_assets: false,
          has_textual_assets: false,
          created_date: new Date().toISOString()
        };
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
      }
    };
    
    initializeSession();
  }, [sessionId]);

  const handleFilesSelected = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type);
    });
    setFiles([...files, ...validFiles]);
  };

  const handleFileRemove = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSkip = async () => {
    try {
      // Créer le projet avec le nom saisi
      if (projectName.trim()) {
        await Project.create({
          name: projectName,
          session_id: sessionId,
          status: "active"
        });
      }
      
      // Mettre à jour la session
      try {
        const sessions = await UserSession.filter({ session_id: sessionId });
        if (sessions.length > 0) {
          await UserSession.update(sessions[0].id, {
            current_step: 1,
            has_visual_assets: false
          });
        }
      } catch (apiError) {
        console.log("API non disponible, utilisation du localStorage");
        const sessionData = JSON.parse(localStorage.getItem(`session_${sessionId}`) || '{}');
        sessionData.current_step = 1;
        sessionData.has_visual_assets = false;
        sessionData.project_name = projectName;
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
      }
      
      navigate(createPageUrl("UploadTexte") + `?session=${sessionId}&projectName=${encodeURIComponent(projectName)}`);
    } catch (err) {
      console.error("Erreur lors de la navigation:", err);
      error("Erreur lors de la navigation");
    }
  };

  const handleContinue = async () => {
    if (files.length === 0) {
      handleSkip();
      return;
    }

    if (!projectName.trim()) {
      error("Veuillez saisir un nom de projet");
      return;
    }

    setIsUploading(true);
    try {
      // Créer le projet d'abord
      await Project.create({
        name: projectName,
        session_id: sessionId,
        status: "active",
        project_name: projectName
      });
      
      console.log("Projet créé:", projectName);
      
      // Upload des fichiers
      for (const file of files) {
        try {
          // Upload réel du fichier
          const { file_url } = await UploadFile({ file });
          
          // Créer l'asset de marque
          await BrandAsset.create({
            file_url,
            file_name: file.name,
            file_type: 'visual',
            file_format: file.type,
            session_id: sessionId
          });
          
          console.log("Fichier uploadé:", file.name);
        } catch (uploadError) {
          console.error("Erreur upload fichier:", file.name, uploadError);
          // Continuer avec les autres fichiers même si un échoue
        }
      }

      // Mettre à jour la session
      try {
        const sessions = await UserSession.filter({ session_id: sessionId });
        if (sessions.length > 0) {
          await UserSession.update(sessions[0].id, {
            current_step: 1,
            has_visual_assets: true
          });
        }
      } catch (apiError) {
        console.log("API non disponible, utilisation du localStorage");
        // Fallback localStorage
        const uploadedFiles = files.map(file => ({
          file_url: URL.createObjectURL(file),
          file_name: file.name,
          file_type: 'visual',
          file_format: file.type,
          session_id: sessionId
        }));
        
        localStorage.setItem(`assets_${sessionId}`, JSON.stringify(uploadedFiles));
        
        const sessionData = JSON.parse(localStorage.getItem(`session_${sessionId}`) || '{}');
        sessionData.current_step = 1;
        sessionData.has_visual_assets = true;
        sessionData.project_name = projectName;
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
      }

      success(`Projet "${projectName}" créé avec ${files.length} fichier(s) !`);

      navigate(createPageUrl("UploadTexte") + `?session=${sessionId}&projectName=${encodeURIComponent(projectName)}`);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      error("Erreur lors de la création du projet");
    }
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <StepIndicator currentStep={0} totalSteps={3} />
        
        <div className="text-center mb-12 slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chargez vos créations afin de définir votre univers visuel
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ex : Flyers, cartes de visites, bannières, affiches, logos, charte graphique...
          </p>
        </div>

        {/* Section Nom du projet */}
        <div className="w-full max-w-2xl mx-auto mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Nom du projet
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Donnez un nom à votre projet
            </p>
            <Input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Refonte visuelle entreprise 2024"
              className="w-full px-3 py-2 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="slide-up" style={{ animationDelay: '0.2s' }}>
          <FileUploadZone
            acceptedTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            acceptedFormats="PDF, JPG, JPEG, PNG, DOC, DOCX"
            files={files}
            onFilesSelected={handleFilesSelected}
            onFileRemove={handleFileRemove}
            title="Chargez vos fichiers"
            description="Glissez-déposez vos fichiers ici ou cliquez pour les sélectionner"
          />
        </div>

        <div className="flex justify-center gap-4 mt-12 slide-up" style={{ animationDelay: '0.4s' }}>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isUploading}
            className="px-8 py-3"
          >
            Je ne possède pas de visuels
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
