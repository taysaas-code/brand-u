

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Palette, ArrowLeft, UserCircle, Bot, BookOpen, FolderOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isOnboarding = ['UploadVisuels', 'UploadTexte', 'Analyse'].includes(currentPageName);
  const hasSidebar = ['Chat', 'ChatReseauxSociaux', 'ChatCreationContenu', 'ChatWeb', 'Ressources', 'IdentiteVisuelle', 'ProjetDetail', 'MonCompte'].includes(currentPageName);

  if (currentPageName === 'Accueil') {
    return <div className="min-h-screen bg-white">{children}</div>;
  }
  
  // Layout avec Sidebar
  if (hasSidebar) {
    const activeSessionId = sessionStorage.getItem('active_project_session_id');

    const agentPages = [
      { name: "Designer graphique", page: 'Chat' },
      { name: "Community manager", page: 'ChatReseauxSociaux' },
      { name: "Stratégie et contenu", page: 'ChatCreationContenu' },
      { name: "Web designer", page: 'ChatWeb' },
    ];
    
    const agents = agentPages.map(agent => ({
      ...agent,
      icon: Bot,
      href: activeSessionId ? createPageUrl(agent.page) + `?session=${activeSessionId}` : createPageUrl(agent.page)
    }));

    const tools = [
      { name: "Identité Visuelle", icon: Palette, href: createPageUrl('IdentiteVisuelle'), page: 'IdentiteVisuelle' },
      { name: "Ressources", icon: BookOpen, href: createPageUrl('Ressources') + (activeSessionId ? `?session=${activeSessionId}` : ''), page: 'Ressources' },
    ];

    return (
      <div className="min-h-screen flex bg-gray-50">
        <style>{`
        :root {
          --primary: #3b82f6;
          --primary-hover: #2563eb;
          --text-primary: #1a1a1a;
          --text-secondary: #6b7280;
          --border: #e5e7eb;
          --background: #ffffff;
          --surface: #f9fafb;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .slide-up {
          animation: slideUp 0.4s ease-out;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col p-4">
          <div className="px-4 py-2 mb-8">
            <Link to={createPageUrl("IdentiteVisuelle")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Brand'U</span>
            </Link>
          </div>
          
          <nav className="flex-1 space-y-2">
            <h3 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Agents</h3>
            {agents.map((agent) => (
              <Link 
                key={agent.name} 
                to={agent.href} 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${currentPageName === agent.page
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <agent.icon className="w-5 h-5" />
                <span>{agent.name}</span>
              </Link>
            ))}
            
            <div className="pt-6">
              <h3 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Outils</h3>
              {tools.map((tool) => (
                <Link key={tool.name} to={tool.href} className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${currentPageName === tool.page
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}>
                  <tool.icon className="w-5 h-5" />
                  <span>{tool.name}</span>
                </Link>
              ))}
            </div>
          </nav>
          
          <div className="mt-8 border-t border-gray-100 pt-4">
            <Link to={createPageUrl('MonCompte')} className="block">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer ${currentPageName === 'MonCompte' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                <UserCircle className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-800">Mon Compte</p>
                  <p className="text-xs text-gray-500">Accéder à mon profil</p>
                </div>
              </div>
            </Link>
          </div>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Layout pour Onboarding
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("Accueil")} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Brand'U</span>
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <Link to={createPageUrl("Accueil")} className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour
                </Link>
              </Button>
            </div>
          </div>
        </nav>
        <main className="fade-in">
          {children}
        </main>
      </div>
    );
  }

  return <div className="min-h-screen bg-white">{children}</div>;
}

