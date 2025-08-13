
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  ArrowLeft,
  Download,
  ExternalLink,
  CheckCircle,
  Palette,
  Layout,
  Type,
  Camera,
  TrendingUp,
  Zap
} from "lucide-react";

export default function Ressources() {
  const guides = [
    {
      title: "Les bases du design visuel",
      description: "Principes fondamentaux pour créer des visuels impactants",
      icon: Palette,
      items: [
        "Règles de composition et règle des tiers",
        "Harmonies coloriques et psychologie des couleurs",
        "Hiérarchie visuelle et lisibilité",
        "Équilibre et espacement"
      ]
    },
    {
      title: "Typographie & lisibilité",
      description: "Choisir et utiliser les bonnes polices de caractères",
      icon: Type,
      items: [
        "Associations de polices qui fonctionnent",
        "Tailles et espacements optimaux",
        "Contraste et lisibilité sur différents supports",
        "Typographie pour les réseaux sociaux"
      ]
    },
    {
      title: "Mise en page moderne",
      description: "Techniques de layout pour des designs contemporains",
      icon: Layout,
      items: [
        "Grilles et systèmes de mise en page",
        "Espacement et respiration visuelle",
        "Alignements et cohérence",
        "Formats optimaux par plateforme"
      ]
    },
    {
      title: "Photographie & visuels",
      description: "Optimiser vos images pour un impact maximum",
      icon: Camera,
      items: [
        "Composition et cadrage professionnel",
        "Éclairage et retouche de base",
        "Banques d'images de qualité",
        "Cohérence visuelle sur tous vos supports"
      ]
    }
  ];

  const checklists = [
    {
      title: "Checklist Post Instagram",
      description: "Vérifications avant publication",
      checks: [
        "Format carré 1080x1080px ou vertical 1080x1350px",
        "Couleurs conformes à ma charte graphique",
        "Texte lisible même en petit format",
        "Call-to-action clair et visible",
        "Logo/signature discret but présent",
        "Hashtags pertinents et optimisés"
      ]
    },
    {
      title: "Checklist Flyer/Affiche",
      description: "Points de contrôle pour vos supports print",
      checks: [
        "Résolution 300 DPI minimum",
        "Fonds perdus de 3mm ajoutés",
        "Informations essentielles hiérarchisées",
        "Lisibilité à distance testée",
        "Coordonnées clairement visibles",
        "Format et orientation adaptés"
      ]
    },
    {
      title: "Checklist Cohérence Marque",
      description: "Maintenir une identité visuelle forte",
      checks: [
        "Palette de couleurs respectée (max 3-4 couleurs)",
        "Polices cohérentes avec ma charte",
        "Style photographique uniforme",
        "Ton de voix constant dans les textes",
        "Logo utilisé de manière consistante",
        "Éléments graphiques récurrents présents"
      ]
    }
  ];

  const templates = [
    {
      title: "Templates Instagram",
      description: "10 modèles pour vos posts et stories",
      format: "PSD + Canva",
      color: "from-pink-500 to-purple-600"
    },
    {
      title: "Kit Flyers Business",
      description: "5 templates pour événements pro",
      format: "AI + PDF",
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Bannières Web",
      description: "Formats standards pour le digital",
      format: "PNG + PSD",
      color: "from-green-500 to-teal-600"
    },
    {
      title: "Cartes de Visite",
      description: "Designs modernes et professionnels",
      format: "AI + PDF print-ready",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Intro */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ressources pour créateurs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Guides, checklists et templates pour faire passer vos visuels de "bof" à ultra qualitatifs
          </p>
        </div>

        {/* Guides Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Guides pratiques</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <guide.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <p className="text-sm text-gray-500">{guide.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guide.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Lire le guide complet
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Checklists Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Checklists qualité</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {checklists.map((checklist, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                  <p className="text-sm text-gray-500">{checklist.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {checklist.checks.map((check, checkIndex) => (
                      <li key={checkIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{check}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Templates Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Templates professionnels</h2>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <Card key={index} className="border-none shadow-lg hover:scale-105 transition-transform duration-300">
                <CardHeader className="pb-4">
                  <div className={`w-full h-32 bg-gradient-to-r ${template.color} rounded-xl mb-4 flex items-center justify-center`}>
                    <Layout className="w-12 h-12 text-white opacity-80" />
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Format: {template.format}</span>
                  </div>
                  <Button className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA retour */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à mettre en pratique ?
          </h3>
          <p className="text-gray-600 mb-6">
            Retournez discuter avec votre designer IA pour appliquer ces conseils
          </p>
          <Link to={createPageUrl("Chat") + window.location.search}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au chat designer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
