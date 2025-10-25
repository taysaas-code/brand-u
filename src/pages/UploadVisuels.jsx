
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/lib/supabaseStorage";
import { BrandAsset, UserSession, Project } from "@/lib/supabaseHelpers";
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
        await UserSession.create({
          session_id: sessionId,
          brand_analysis: null,
          visual_analysis: null
        });

        console.log("Session initialisée:", sessionId);
      } catch (err) {
        console.error("Erreur lors de l'initialisation de la session:", err);
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
      if (!projectName.trim()) {
        error("Veuillez saisir un nom de projet");
        return;
      }

      const project = await Project.create({
        name: projectName,
        description: "Projet sans visuels",
        status: "active"
      });

      console.log("Projet créé:", project);

      const sessions = await UserSession.filter({ session_id: sessionId });
      if (sessions.length > 0) {
        await UserSession.update(sessions[0].id, {
          visual_analysis: "Aucun visuel fourni"
        });
      }

      navigate(createPageUrl("UploadTexte") + `?session=${sessionId}&projectName=${encodeURIComponent(projectName)}&projectId=${project.id}`);
    } catch (err) {
      console.error("Erreur lors de la navigation:", err);
      error("Erreur lors de la création du projet");
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
      const project = await Project.create({
        name: projectName,
        description: `Projet avec ${files.length} visuels`,
        status: "active"
      });

      console.log("Projet créé:", project);

      let uploadedCount = 0;

      for (const file of files) {
        try {
          const uploadResult = await uploadFile(file, 'brand-assets');

          await BrandAsset.create({
            project_id: project.id,
            asset_type: 'image',
            asset_url: uploadResult.file_url,
            metadata: {
              file_name: uploadResult.file_name,
              file_size: uploadResult.file_size,
              file_type: uploadResult.file_type,
              session_id: sessionId
            }
          });

          uploadedCount++;
          console.log(`Fichier uploadé (${uploadedCount}/${files.length}):`, file.name);
        } catch (uploadError) {
          console.error("Erreur upload fichier:", file.name, uploadError);
          error(`Erreur lors de l'upload de ${file.name}`);
        }
      }

      const sessions = await UserSession.filter({ session_id: sessionId });
      if (sessions.length > 0) {
        await UserSession.update(sessions[0].id, {
          visual_analysis: `${uploadedCount} visuels analysés`
        });
      }

      if (uploadedCount > 0) {
        success(`Projet "${projectName}" créé avec ${uploadedCount} fichier(s) !`);
        navigate(createPageUrl("UploadTexte") + `?session=${sessionId}&projectName=${encodeURIComponent(projectName)}&projectId=${project.id}`);
      } else {
        error("Aucun fichier n'a pu être uploadé");
      }
    } catch (err) {
      console.error("Erreur lors de l'upload:", err);
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
