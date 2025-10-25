import Layout from "./Layout.jsx";

import Accueil from "./Accueil";

import UploadVisuels from "./UploadVisuels";

import UploadTexte from "./UploadTexte";

import Analyse from "./Analyse";

import Chat from "./Chat";

import Ressources from "./Ressources";

import IdentiteVisuelle from "./IdentiteVisuelle";

import ChatReseauxSociaux from "./ChatReseauxSociaux";

import ChatCreationContenu from "./ChatCreationContenu";

import ChatWeb from "./ChatWeb";

import ProjetDetail from "./ProjetDetail";

import MonCompte from "./MonCompte";
import ProtectedRoute from "../components/ProtectedRoute";
import Auth from "./Auth";
import AuthCallback from "./AuthCallback";
import ResetPassword from "./ResetPassword";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Accueil: Accueil,
    
    UploadVisuels: UploadVisuels,
    
    UploadTexte: UploadTexte,
    
    Analyse: Analyse,
    
    Chat: Chat,
    
    Ressources: Ressources,
    
    IdentiteVisuelle: IdentiteVisuelle,
    
    ChatReseauxSociaux: ChatReseauxSociaux,
    
    ChatCreationContenu: ChatCreationContenu,
    
    ChatWeb: ChatWeb,
    
    ProjetDetail: ProjetDetail,
    
    MonCompte: MonCompte,
    
    Auth: Auth,
    
    AuthCallback: AuthCallback,
    
    ResetPassword: ResetPassword,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            

                    <Route path="/" element={<Accueil />} />


                <Route path="/Accueil" element={<Accueil />} />

                <Route path="/UploadVisuels" element={<ProtectedRoute><UploadVisuels /></ProtectedRoute>} />

                <Route path="/UploadTexte" element={<ProtectedRoute><UploadTexte /></ProtectedRoute>} />

                <Route path="/Analyse" element={<ProtectedRoute><Analyse /></ProtectedRoute>} />

                <Route path="/Chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                <Route path="/Ressources" element={<ProtectedRoute><Ressources /></ProtectedRoute>} />

                <Route path="/IdentiteVisuelle" element={<ProtectedRoute><IdentiteVisuelle /></ProtectedRoute>} />

                <Route path="/ChatReseauxSociaux" element={<ProtectedRoute><ChatReseauxSociaux /></ProtectedRoute>} />

                <Route path="/ChatCreationContenu" element={<ProtectedRoute><ChatCreationContenu /></ProtectedRoute>} />

                <Route path="/ChatWeb" element={<ProtectedRoute><ChatWeb /></ProtectedRoute>} />

                <Route path="/ProjetDetail" element={<ProtectedRoute><ProjetDetail /></ProtectedRoute>} />

                <Route path="/MonCompte" element={<ProtectedRoute><MonCompte /></ProtectedRoute>} />
                
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}