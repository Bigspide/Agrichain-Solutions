"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  FileText, 
  Scale, 
  Users, 
  Lock, 
  Globe, 
  CheckCircle2 
} from "lucide-react";

export default function GovernancePage() {
  const sections = [
    {
      id: "privacy",
      title: "Politique de Confidentialité",
      icon: <Lock className="text-navy-600" />,
      content: `
        <p className="mb-4">Votre vie privée est notre priorité absolue. AgriChain s'engage à protéger vos données agricoles et personnelles.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li><strong>Zéro Vente de Données:</strong> Nous ne vendons jamais vos informations à des tiers.</li>
          <li><strong>Souveraineté:</strong> Vous restez le seul propriétaire de vos données de production.</li>
          <li><strong>Chiffrement:</strong> Toutes les données sensibles sont cryptées selon les normes AES-256.</li>
          <li><strong>Transparence Blockchain:</strong> Seules les données de traçabilité sont publiques pour garantir l'origine des produits.</li>
        </ul>
      `,
    },
    {
      id: "terms",
      title: "Conditions Générales d'Utilisation",
      icon: <FileText className="text-gold-600" />,
      content: `
        <p className="mb-4">L'utilisation d'AgriChain implique l'acceptation d'un code de conduite basé sur l'équité et la transparence.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li><strong>Équité:</strong> Interdiction de manipulation des prix ou de fausses déclarations de certification.</li>
          <li><strong>Responsabilité:</strong> Le producteur est responsable de la qualité des produits expédiés.</li>
          <li><strong>Escrow:</strong> Les fonds sont bloqués jusqu'à confirmation de livraison pour protéger l'acheteur et le vendeur.</li>
          <li><strong>Arbitrage:</strong> En cas de litige, l'IA AGRI et un comité de mentors interviennent pour une résolution amiable.</li>
        </ul>
      `,
    },
    {
      id: "insurance",
      title: "Règlement de la Mutuelle d'Assurance",
      icon: <Shield className="text-emerald-600" />,
      content: `
        <p className="mb-4">L'assurance AgriChain est un modèle participatif et paramétrique.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li><strong>Déclenchement Automatique:</strong> Le paiement est versé dès que les indices météo (pluie, vent) atteignent le seuil critique.</li>
          <li><strong>Financement:</strong> Les primes sont prélevées via un micro-pourcentage des ventes ou via des tokens $AGRI.</li>
          <li><strong>Transparence:</strong> Le solde du fonds de réserve est consultable par tous les membres de la mutuelle.</li>
          <li><strong>Soutien Croisé:</strong> Une partie des commissions plateforme alimente le fonds d'urgence pour les sinistres majeurs.</li>
        </ul>
      `,
    },
    {
      id: "ethics",
      title: "Charte d'Éthique et de Durabilité",
      icon: <Globe className="text-blue-600" />,
      content: `
        <p className="mb-4">Rejoindre AgriChain, c'est s'engager pour une agriculture régénérative.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li><strong>Protection des Sols:</strong> Promotion active du compostage et de l'agroforesterie.</li>
          <li><strong>Juste Rémunération:</strong> Engagement à éliminer les intermédiaires abusifs pour maximiser le gain du paysan.</li>
          <li>/<strong>Inclusion:</strong> Accessibilité totale pour les personnes non-lettrées via l'audio.</li>
        </ul>
      `,
    },
  ];

  return (
    <div className="p-6 space-y-12 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-100 text-navy-700 text-xs font-bold uppercase tracking-widest"
        >
          <Scale size={14} />
          Centre de Gouvernance
        </motion.div>
        <h1 className="text-5xl font-black text-navy-900 dark:text-white">Transparence & Lois</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          AgriChain repose sur un contrat de confiance. Voici les règles qui encadrent notre écosystème pour garantir l'équité pour tous.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, i) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-premium p-8 flex flex-col h-full"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
                {section.icon}
              </div>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">{section.title}</h3>
            </div>
            <div 
              className="flex-1 text-gray-600 dark:text-gray-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-xs font-medium text-gray-400">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Certifié conforme aux standards de l'agriculture durable
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-navy-900 text-white p-10 rounded-3xl text-center space-y-6 shadow-2xl">
        <Users className="mx-auto text-gold-500" size={48} />
        <h3 className="text-3xl font-bold">Rejoindre la Gouvernance</h3>
        <p className="text-navy-300 max-w-xl mx-auto">
          En tant que membre Platinum, vous pouvez voter sur les évolutions du règlement de la mutuelle et proposer de nouvelles règles d'équité.
        </p>
        <button className="btn-premium px-8 py-3 rounded-xl font-bold">
          Accéder au Vote Communautaire
        </button>
      </div>
    </div>
  );
}
