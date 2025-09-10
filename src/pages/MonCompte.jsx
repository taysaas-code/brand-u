
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/GlobalToast';
import { Project } from '@/api/entities';
import {
  User as UserIcon,
  Bell,
  CreditCard,
  FolderKanban,
  ShieldCheck,
  LifeBuoy,
  Edit,
  Trash2,
  ChevronRight,
  LogOut,
  Download,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MonCompte() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]); // Renamed to "identitesVisuelles" in UI, but variable name remains "projects" as it holds the same data type.
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Si authentifié, charger les données
    if (isAuthenticated && !authLoading) {
      loadProjects();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    // Debug pour voir l'état d'authentification
    console.log('Auth state:', { isAuthenticated, authLoading, user });
  }, [isAuthenticated, authLoading, user]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      
      // Essayer de charger depuis l'API d'abord
      try {
        const userProjects = await Project.filter({ status: "active" }, "-created_date");
        setProjects(userProjects);
      } catch (apiError) {
        console.log('API not available, using localStorage fallback');
        
        // Fallback vers localStorage
        const savedProjects = localStorage.getItem(`projects_${user?.id || 'demo'}`);
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        } else {
          // Projets de démonstration
          const demoProjects = [
            {
              id: '1',
              name: 'Identité Marque Principal',
              description: 'Projet principal de votre marque',
              created_date: new Date().toISOString(),
              session_id: 'demo_session_1',
              status: 'active'
            }
          ];
          setProjects(demoProjects);
          localStorage.setItem(`projects_${user?.id || 'demo'}`, JSON.stringify(demoProjects));
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
      toast?.error?.("Erreur lors du chargement des projets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      logout();
      toast?.success?.("Déconnexion réussie");
      navigate(createPageUrl("Accueil"));
    } catch (error) {
      console.error('Logout error:', error);
      // Forcer la déconnexion même en cas d'erreur
      navigate(createPageUrl("Accueil"));
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Loading state pendant que l'auth se charge
  if (authLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié après le chargement, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  // Loading state pour les données utilisateur
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre compte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles, abonnements et paramètres.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Sections principales */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" /> 
                  Informations Personnelles
                </CardTitle>
                <CardDescription>
                  Mettez à jour vos informations et votre photo de profil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={user?.picture || `https://avatar.vercel.sh/${user?.email}.png`} 
                      alt={user?.name || 'User'} 
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline">Changer la photo</Button>
                    <p className="text-xs text-gray-500 mt-2">JPG, GIF ou PNG. Max 5Mo.</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input id="fullName" defaultValue={user?.name || ''} />
                  </div>
                  <div>
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                  </div>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <Button variant="link" className="p-0">Changer mon mot de passe</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Enregistrer les changements</Button>
                </div>
              </CardContent>
            </Card>

            {/* Informations sur l'abonnement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> 
                  Abonnement & Facturation
                </CardTitle>
                <CardDescription>
                  Gérez votre plan et consultez votre historique de facturation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">Plan actuel: <span className="text-blue-600">Pro</span></p>
                    <p className="text-sm text-gray-600">Renouvellement le: 15 Janvier 2025</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button className="bg-blue-600 hover:bg-blue-700">Mettre à jour mon plan</Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      Annuler l'abonnement
                    </Button>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Historique des factures</h4>
                  <ul className="space-y-2">
                    {['Facture #12345 - 15/12/2023', 'Facture #11234 - 15/11/2023'].map(invoice => (
                       <li key={invoice} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50">
                        <span>{invoice}</span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="w-4 h-4"/> 
                          PDF
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Identités visuelles */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="w-5 h-5" /> 
                      Mes identités visuelles
                    </CardTitle>
                    <CardDescription>
                      Gérez toutes les identités visuelles que vous avez créées.
                    </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(createPageUrl('IdentiteVisuelle'))}
                >
                  <Plus className="w-4 h-4 mr-2"/> 
                  Nouvelle identité
                </Button>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune identité visuelle créée</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate(createPageUrl('IdentiteVisuelle'))}
                    >
                      Créer ma première identité
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {projects.map(project => (
                      <li key={project.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-gray-500">Créé le {formatDate(project.created_date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(createPageUrl('ProjetDetail') + `?session=${project.session_id}`)}
                          >
                            Voir
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-500 hover:text-red-600" 
                            onClick={() => {
                              if (confirm('Voulez-vous vraiment supprimer cette identité visuelle ?')) {
                                const updatedProjects = projects.filter(p => p.id !== project.id);
                                setProjects(updatedProjects);
                                localStorage.setItem(`projects_${user?.id || 'demo'}`, JSON.stringify(updatedProjects));
                                toast?.success?.('Identité visuelle supprimée');
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
          </div>

          {/* Colonne de droite - Paramètres & Sécurité */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" /> 
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="notif-email" className="font-normal">Notifications par e-mail</Label>
                        <Switch id="notif-email" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="notif-app" className="font-normal">Notifications in-app</Label>
                        <Switch id="notif-app" />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> 
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Button variant="outline" className="w-full justify-between">
                   Historique des connexions 
                   <ChevronRight className="w-4 h-4" />
                 </Button>
                 <Button 
                   variant="outline" 
                   className="w-full justify-center md:justify-start gap-2" 
                   onClick={() => alert("Déconnexion de tous les appareils")}
                 >
                    <LogOut className="w-4 h-4" /> 
                    <span className="hidden md:inline">Déconnexion de tous les appareils</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-transparent shadow-none border-none">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5" /> 
                    Support
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                  Centre d'aide 
                  <ChevronRight className="w-4 h-4 ml-auto"/>
                </a>
                <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                  Contacter le support 
                  <ChevronRight className="w-4 h-4 ml-auto"/>
                </a>
                <a href="#" className="flex items-center text-sm text-gray-500 hover:underline mt-4">
                  Conditions Générales d'Utilisation
                </a>
                <a href="#" className="flex items-center text-sm text-gray-500 hover:underline">
                  Politique de confidentialité
                </a>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                Se déconnecter
              </Button>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                  if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
                    // Logique de suppression de compte
                    alert("Fonctionnalité de suppression de compte à implémenter");
                  }
                }}
              >
                Supprimer mon compte
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
