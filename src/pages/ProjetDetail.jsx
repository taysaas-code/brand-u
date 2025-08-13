
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Eye,
  Calendar,
  Upload,
  Bot,
  Palette,
  Type,
  Heart,
  ExternalLink
} from "lucide-react";
import { Project, UserSession, BrandAsset } from "@/api/entities";

export default function ProjetDetail() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [brandAssets, setBrandAssets] = useState([]);
  const [brandAnalysis, setBrandAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');

  useEffect(() => {
    if (!sessionId) {
      navigate(createPageUrl("IdentiteVisuelle"));
      return;
    }
    loadProjectData();
  }, [sessionId, navigate]);

  const loadProjectData = async () => {
    try {
      // Charger les données du projet
      const projects = await Project.filter({ session_id: sessionId });
      if (projects.length > 0) {
        setProject(projects[0]);
      }

      // Charger les assets de marque
      const assets = await BrandAsset.filter({ session_id: sessionId });
      setBrandAssets(assets);

      // Charger l'analyse de marque
      const sessions = await UserSession.filter({ session_id: sessionId });
      if (sessions.length > 0 && sessions[0].brand_analysis) {
        setBrandAnalysis(sessions[0].brand_analysis);
      }

    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    }
    setIsLoading(false);
  };

  const visualAssets = brandAssets.filter(asset => asset.file_type === 'visual');
  const textualAssets = brandAssets.filter(asset => asset.file_type === 'textual');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (asset) => {
    if (asset.file_type === 'visual') return ImageIcon;
    return FileText;
  };

  const getFileTypeLabel = (asset) => {
    if (asset.file_type === 'visual') return 'Visuel';
    return 'Textuel';
  };

  const handleOpenChat = () => {
    navigate(createPageUrl("Chat") + `?session=${sessionId}`);
  };

  const handleOpenFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("IdentiteVisuelle"))}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux projets
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project?.name || "Projet"}
              </h1>
              {project?.description && (
                <p className="text-gray-600 text-lg mb-4">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Créé le {project && formatDate(project.created_date)}
                </div>
                <div className="flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  {brandAssets.length} fichier(s) uploadé(s)
                </div>
              </div>
            </div>
            
            {brandAnalysis && (
              <Button onClick={handleOpenChat} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Bot className="w-4 h-4" />
                Ouvrir le chat designer
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Fichiers Visuels */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Identité visuelle</CardTitle>
                  <p className="text-sm text-gray-600">
                    {visualAssets.length} fichier(s) - Logos, chartes, visuels
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {visualAssets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun fichier visuel uploadé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visualAssets.map((asset) => {
                    const FileIcon = getFileIcon(asset);
                    return (
                      <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {asset.file_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getFileTypeLabel(asset)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(asset.created_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFile(asset.file_url)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = asset.file_url;
                              link.download = asset.file_name;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fichiers Textuels */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Type className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Ton de voix & positionnement</CardTitle>
                  <p className="text-sm text-gray-600">
                    {textualAssets.length} fichier(s) - Valeurs, vision, personnalité
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {textualAssets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun fichier textuel uploadé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {textualAssets.map((asset) => {
                    const FileIcon = getFileIcon(asset);
                    return (
                      <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {asset.file_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getFileTypeLabel(asset)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(asset.created_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFile(asset.file_url)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = asset.file_url;
                              link.download = asset.file_name;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analyse de marque */}
        {brandAnalysis && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Analyse de l'identité de marque</CardTitle>
                  <p className="text-sm text-gray-600">
                    Synthèse réalisée par l'IA designer
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {brandAnalysis}
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleOpenChat} variant="outline" className="gap-2">
                    <Bot className="w-4 h-4" />
                    Discuter avec le designer IA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions rapides */}
        <div className="mt-8 text-center">
          {!brandAnalysis ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {brandAssets.length === 0 ? "Projet vide" : "Analyse en cours"}
              </h3>
              <p className="text-yellow-700 mb-4">
                {brandAssets.length === 0 
                  ? "Ce projet ne contient pas encore de fichiers. Commencez par uploader vos assets de marque."
                  : "Vos fichiers sont uploadés. Lancez l'analyse pour commencer à créer avec l'IA."
                }
              </p>
              <Button 
                onClick={() => navigate(createPageUrl(brandAssets.length === 0 ? "UploadVisuels" : "Analyse") + `?session=${sessionId}`)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {brandAssets.length === 0 ? "Ajouter des fichiers" : "Lancer l'analyse"}
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              <Button 
                onClick={() => navigate(createPageUrl("Chat") + `?session=${sessionId}`)}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Bot className="w-4 h-4" />
                Designer graphique
              </Button>
              <Button 
                onClick={() => navigate(createPageUrl("ChatReseauxSociaux") + `?session=${sessionId}`)}
                variant="outline"
                className="gap-2"
              >
                <Bot className="w-4 h-4" />
                Community manager
              </Button>
              <Button 
                onClick={() => navigate(createPageUrl("ChatCreationContenu") + `?session=${sessionId}`)}
                variant="outline"
                className="gap-2"
              >
                <Bot className="w-4 h-4" />
                Stratégie et contenu
              </Button>
              <Button 
                onClick={() => navigate(createPageUrl("ChatWeb") + `?session=${sessionId}`)}
                variant="outline"
                className="gap-2"
              >
                <Bot className="w-4 h-4" />
                Web designer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
