
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  MoreVertical, 
  Search,
  Edit3, 
  Trash2,
  CheckCircle, // Added from outline
  Circle // Added from outline
} from "lucide-react";
import { Project, UserSession, BrandAsset } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function IdentiteVisuelle() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Added from outline
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null); // Added from outline

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('active_project_session_id');
    if (storedSessionId) {
      setActiveSessionId(storedSessionId);
    }
    loadUserAndProjects();
  }, []);

  const loadUserAndProjects = async () => {
    try {
      // Try to load user data, but don't fail if not authenticated
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (authError) {
        console.log("User not authenticated, using demo mode");
        // Set a demo user for development
        setUser({
          id: 'demo',
          email: 'demo@brand-u.com',
          name: 'Utilisateur Démo'
        });
      }
      
      // Load projects regardless of auth status
      await loadProjects();
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    }
    setIsLoading(false);
  };

  const loadProjects = async () => {
    try {
      // Try to load from API first
      try {
        const userProjects = await Project.filter({ status: "active" }, "-created_date");
        
        const enrichedProjects = await Promise.all(
          userProjects.map(async (project) => {
            try {
              const assets = await BrandAsset.filter({ session_id: project.session_id });
              const sessions = await UserSession.filter({ session_id: project.session_id });
              
              return {
                ...project,
                assetsCount: assets.length,
                hasAnalysis: sessions.length > 0 && sessions[0].brand_analysis,
                lastActivity: project.updated_date || project.created_date
              };
            } catch (error) {
              console.warn(`Could not load assets/sessions for project ${project.id}:`, error);
              return {
                ...project,
                assetsCount: 0,
                hasAnalysis: false,
                lastActivity: project.created_date
              };
            }
          })
        );
        
        setProjects(enrichedProjects);
      } catch (apiError) {
        console.log("API not available, using localStorage fallback");
        
        // Fallback to localStorage
        const savedProjects = localStorage.getItem(`projects_${user?.id || 'demo'}`);
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        } else {
          // Demo projects
          const demoProjects = [
            {
              id: '1',
              name: 'Mon Premier Projet',
              description: 'Projet de démonstration',
              created_date: new Date().toISOString(),
              session_id: 'demo_session_1',
              status: 'active',
              assetsCount: 0,
              hasAnalysis: false,
              lastActivity: new Date().toISOString()
            }
          ];
          setProjects(demoProjects);
          localStorage.setItem(`projects_${user?.id || 'demo'}`, JSON.stringify(demoProjects));
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    }
  };

  const createNewProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await Project.create({
        name: newProjectName,
        description: newProjectDescription,
        session_id: sessionId,
        status: "active"
      });

      await UserSession.create({
        session_id: sessionId,
        current_step: 0,
        has_visual_assets: false,
        has_textual_assets: false
      });

      setNewProjectName("");
      setNewProjectDescription("");
      setShowNewProject(false);
      
      // Rediriger vers la page de détail du projet au lieu de l'onboarding
      navigate(createPageUrl("ProjetDetail") + `?session=${sessionId}`);
      
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
    }
  };

  const continueProject = (project) => {
    // Toujours aller sur la page de détail du projet
    // L'utilisateur pourra voir ses fichiers et continuer l'analyse si nécessaire
    navigate(createPageUrl("ProjetDetail") + `?session=${project.session_id}`);
  };

  // The original archiveProject function is now replaced by deleteProject as per outline's intent.
  // This logic is now handled by the 'Supprimer' option in the dropdown.
  const deleteProject = async (projectId) => {
    try {
      await Project.update(projectId, { status: "archived" });
      loadProjects();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Added from outline
  const startEditingProject = (project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setEditProjectDescription(project.description || "");
  };

  // Added from outline
  const saveProjectEdit = async () => {
    if (!editProjectName.trim() || !editingProject) return;

    try {
      await Project.update(editingProject.id, {
        name: editProjectName,
        description: editProjectDescription
      });
      
      setEditingProject(null);
      setEditProjectName("");
      setEditProjectDescription("");
      loadProjects(); // Reload projects to show updated names/descriptions
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  // Added from outline
  const cancelEdit = () => {
    setEditingProject(null);
    setEditProjectName("");
    setEditProjectDescription("");
  };

  // Added from outline
  const handleSelectProject = (sessionId) => {
    // Si on reclique sur le projet déjà actif, on le désélectionne
    if (sessionId === activeSessionId) {
      sessionStorage.removeItem('active_project_session_id');
      setActiveSessionId(null);
    } else {
      sessionStorage.setItem('active_project_session_id', sessionId);
      setActiveSessionId(sessionId);
    }
    // On recharge la page pour que le Layout mette à jour les liens des agents
    window.location.reload();
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Identité Visuelle</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos identités de marque et projets créatifs
            </p>
          </div>
          
          <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle identité
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Créer un nouveau projet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom du projet</label>
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Ex: Refonte identité 2024"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description (optionnel)</label>
                  <Input
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Décrivez votre projet..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowNewProject(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createNewProject} disabled={!newProjectName.trim()} className="bg-blue-600 hover:bg-blue-700">
                    Créer le projet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Project Dialog - Added from outline */}
          <Dialog open={!!editingProject} onOpenChange={() => cancelEdit()}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Modifier le projet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom du projet</label>
                  <Input
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    placeholder="Ex: Refonte identité 2024"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description (optionnel)</label>
                  <Input
                    value={editProjectDescription}
                    onChange={(e) => setEditProjectDescription(e.target.value)}
                    placeholder="Décrivez votre projet..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={cancelEdit}>
                    Annuler
                  </Button>
                  <Button onClick={saveProjectEdit} disabled={!editProjectName.trim()} className="bg-blue-600 hover:bg-blue-700">
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un projet..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {projects.length === 0 ? "Aucun projet créé" : "Aucun projet trouvé"}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? "Créez votre premier projet pour commencer à travailler avec l'IA"
                : "Essayez d'ajuster votre recherche"
              }
            </p>
            {projects.length === 0 && (
              <Button 
                onClick={() => setShowNewProject(true)}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer ma première identité
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className={`
                  hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${project.session_id === activeSessionId ? 'bg-blue-50 border-2 border-blue-400' : 'bg-white'}
                `}
                onClick={() => continueProject(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2"> {/* Added pr-2 from outline */}
                      <CardTitle className="text-lg line-clamp-1">
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {/* New div for buttons - Added from outline */}
                    <div className="flex items-center">
                       {/* Bouton de sélection - Added from outline */}
                       <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${project.session_id === activeSessionId ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                        title={project.session_id === activeSessionId ? "Projet actif" : "Définir comme projet actif"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProject(project.session_id);
                        }}
                      >
                        {project.session_id === activeSessionId ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </Button>
                      
                      {/* DropdownMenu replaces the original Button with MoreVertical - Added from outline */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()} // Prevent card click when opening dropdown
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent dropdown from closing immediately
                              startEditingProject(project);
                            }}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Renommer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent dropdown from closing immediately
                              deleteProject(project.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        project.hasAnalysis ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {project.hasAnalysis ? 'Analysé - Prêt à utiliser' : 'Configuration en cours'}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{project.assetsCount} fichier(s)</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.lastActivity)}
                      </span>
                    </div>

                    {/* Actions */}
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking the button inside
                        continueProject(project);
                      }}
                    >
                      Ouvrir le projet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
