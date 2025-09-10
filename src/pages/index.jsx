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
                
                <Route path="/UploadVisuels" element={<UploadVisuels />} />
                
                <Route path="/UploadTexte" element={<UploadTexte />} />
                
                <Route path="/Analyse" element={<Analyse />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Ressources" element={<Ressources />} />
                
                <Route path="/IdentiteVisuelle" element={<ProtectedRoute><IdentiteVisuelle /></ProtectedRoute>} />
                
                <Route path="/ChatReseauxSociaux" element={<ChatReseauxSociaux />} />
                
                <Route path="/ChatCreationContenu" element={<ChatCreationContenu />} />
                
                <Route path="/ChatWeb" element={<ChatWeb />} />
                
                <Route path="/ProjetDetail" element={<ProjetDetail />} />
                
                <Route path="/MonCompte" element={<ProtectedRoute><MonCompte /></ProtectedRoute>} />
                
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