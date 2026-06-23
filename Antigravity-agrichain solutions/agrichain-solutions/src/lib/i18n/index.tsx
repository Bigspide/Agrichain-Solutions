"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale, LocaleConfig } from "@/types";

// Supported locales
export const locales: LocaleConfig[] = [
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "dyu", name: "Dioula", nativeName: "Julakan", flag: "🇨🇮", dir: "ltr" },
  { code: "bci", name: "Baoulé", nativeName: "Baoulé", flag: "🇨🇮", dir: "ltr" },
  { code: "adj", name: "Adjoukrou", nativeName: "Adjoukrou", flag: "🇨🇮", dir: "ltr" },
  { code: "bet", name: "Bété", nativeName: "Bété", flag: "🇨🇮", dir: "ltr" },
  { code: "ati", name: "Attié", nativeName: "Attié", flag: "🇨🇮", dir: "ltr" },
  { code: "yac", name: "Yacouba", nativeName: "Yacouba", flag: "🇨🇮", dir: "ltr" },
  { code: "gou", name: "Gouro", nativeName: "Gouro", flag: "🇨🇮", dir: "ltr" },
  { code: "ak", name: "Ashanti/Akan", nativeName: "Akan", flag: "🇨🇮", dir: "ltr" },
  { code: "ald", name: "Alladjan", nativeName: "Alladjan", flag: "🇨🇮", dir: "ltr" },
  { code: "sef", name: "Senoufo", nativeName: "Sénoufo", flag: "🇨🇮", dir: "ltr" },
  { code: "kxb", name: "Krobou", nativeName: "Krobou", flag: "🇨🇮", dir: "ltr" },
];

// Translation dictionaries
const translations: Partial<Record<Locale, Record<string, string>>> = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.dashboard": "Tableau de bord",
    "nav.marketplace": "Marché",
    "nav.orders": "Commandes",
    "nav.tracking": "Suivi",
    "nav.wallet": "Portefeuille",
    "nav.ai_advisor": "Conseiller IA",
    "nav.traceability": "Traçabilité",
    "nav.education": "Formation",
    "nav.settings": "Paramètres",
    "nav.admin": "Administration",
    "nav.logout": "Déconnexion",
    "nav.login": "Connexion",
    "nav.register": "S'inscrire",

    // Landing
    "landing.hero_title": "La Chaîne Agricole du Futur",
    "landing.hero_subtitle": "Connectez producteurs, coopératives et acheteurs à travers une plateforme intelligente de traçabilité et de commerce agricole en Afrique de l'Ouest.",
    "landing.cta_start": "Commencer Gratuitement",
    "landing.cta_demo": "Voir la Démo",
    "landing.stats_farmers": "Agriculteurs",
    "landing.stats_transactions": "Transactions",
    "landing.stats_countries": "Pays",
    "landing.stats_products": "Produits Tracés",

    // Features
    "features.title": "Fonctionnalités Puissantes",
    "features.subtitle": "Tout ce dont vous avez besoin pour gérer votre chaîne d'approvisionnement agricole",
    "features.traceability": "Traçabilité Blockchain",
    "features.traceability_desc": "Suivez chaque produit de la ferme à l'assiette avec notre technologie blockchain.",
    "features.ai": "Conseiller IA AGRI",
    "features.ai_desc": "Obtenez des recommandations personnalisées pour vos cultures grâce à l'intelligence artificielle.",
    "features.marketplace": "Marché B2B/B2C",
    "features.marketplace_desc": "Achetez et vendez directement avec des milliers de partenaires vérifiés.",
    "features.logistics": "Logistique Intégrée",
    "features.logistics_desc": "Gérez vos livraisons en temps réel avec suivi GPS et notifications.",
    "features.wallet": "Portefeuille Digital",
    "features.wallet_desc": "Paiements sécurisés, transferts instantanés et historique complet.",
    "features.education": "Centre de Formation",
    "features.education_desc": "Accédez à des cours et des ressources pour améliorer vos pratiques agricoles.",

    // Auth
    "auth.login_title": "Bon Retour !",
    "auth.login_subtitle": "Connectez-vous à votre compte AgriChain",
    "auth.register_title": "Créer un Compte",
    "auth.register_subtitle": "Rejoignez la révolution agricole",
    "auth.email": "Adresse e-mail",
    "auth.password": "Mot de passe",
    "auth.confirm_password": "Confirmer le mot de passe",
    "auth.name": "Nom complet",
    "auth.phone": "Téléphone",
    "auth.role": "Rôle",
    "auth.forgot_password": "Mot de passe oublié ?",
    "auth.no_account": "Pas encore de compte ?",
    "auth.has_account": "Déjà un compte ?",
    "auth.or_continue": "Ou continuer avec",

    // Dashboard
    "dashboard.welcome": "Bienvenue",
    "dashboard.total_revenue": "Revenu Total",
    "dashboard.total_orders": "Total Commandes",
    "dashboard.active_products": "Produits Actifs",
    "dashboard.pending_deliveries": "Livraisons en Cours",
    "dashboard.recent_activity": "Activité Récente",
    "dashboard.quick_actions": "Actions Rapides",
    "dashboard.revenue_chart": "Revenus",
    "dashboard.orders_chart": "Commandes",

    // Marketplace
    "marketplace.title": "Marché AgriChain",
    "marketplace.search": "Rechercher des produits...",
    "marketplace.filter": "Filtrer",
    "marketplace.sort": "Trier",
    "marketplace.add_to_cart": "Ajouter au Panier",
    "marketplace.buy_now": "Acheter Maintenant",
    "marketplace.categories": "Catégories",
    "marketplace.price_range": "Fourchette de prix",
    "marketplace.per_kg": "/kg",
    "marketplace.in_stock": "En stock",
    "marketplace.out_of_stock": "Rupture de stock",

    // AI Advisor
    "ai.title": "Conseiller AGRI",
    "ai.subtitle": "Votre assistant agricole intelligent",
    "ai.placeholder": "Posez votre question agricole...",
    "ai.send": "Envoyer",
    "ai.suggestions": "Suggestions",
    "ai.crop_prediction": "Prédiction de Culture",
    "ai.disease_detection": "Détection de Maladie",
    "ai.market_prices": "Prix du Marché",

    // Traceability
    "trace.title": "Traçabilité",
    "trace.scan_qr": "Scanner QR Code",
    "trace.enter_code": "Entrer le code de traçabilité",
    "trace.timeline": "Chronologie",
    "trace.certificates": "Certificats",
    "trace.origin": "Origine",
    "trace.blockchain_verified": "Vérifié par Blockchain",

    // Common
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.view": "Voir",
    "common.search": "Rechercher",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
    "common.warning": "Attention",
    "common.info": "Information",
    "common.close": "Fermer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.submit": "Soumettre",
    "common.confirm": "Confirmer",
    "common.yes": "Oui",
    "common.no": "Non",
    "common.all": "Tout",
    "common.none": "Aucun",
    "common.more": "Plus",
    "common.less": "Moins",
    "common.notifications": "Notifications",
    "common.profile": "Profil",
    "common.theme_light": "Mode Clair",
    "common.theme_dark": "Mode Sombre",
    "common.language": "Langue",

    // Roles
    "role.producer": "Producteur",
    "role.cooperative": "Coopérative",
    "role.logistics": "Logistique",
    "role.industry": "Industriel",
    "role.consumer": "Consommateur",
    "role.admin": "Administrateur",
    "role.investor": "Investisseur",

    // Pricing
    "pricing.title": "Nos Offres",
    "pricing.subtitle": "Choisissez le plan qui correspond à vos besoins",
    "pricing.free": "Gratuit",
    "pricing.starter": "Starter",
    "pricing.pro": "Professionnel",
    "pricing.enterprise": "Entreprise",
    "pricing.per_month": "/mois",
    "pricing.get_started": "Commencer",
    "pricing.contact_us": "Contactez-nous",
    "pricing.popular": "Populaire",

    // Footer
    "footer.about": "À propos",
    "footer.contact": "Contact",
    "footer.privacy": "Confidentialité",
    "footer.terms": "Conditions d'utilisation",
    "footer.blog": "Blog",
    "footer.support": "Support",
    "footer.careers": "Carrières",
    "footer.partners": "Partenaires",
    "footer.description": "AgriChain Solutions connecte les acteurs de la chaîne agricole en Afrique de l'Ouest avec une plateforme intelligente de traçabilité, de commerce et de gestion.",
    "footer.newsletter": "Inscrivez-vous à notre newsletter",
    "footer.newsletter_placeholder": "Votre adresse e-mail",
    "footer.subscribe": "S'abonner",
    "footer.rights": "Tous droits réservés",

    // Wallet
    "wallet.title": "Mon Portefeuille",
    "wallet.balance": "Solde",
    "wallet.send": "Envoyer",
    "wallet.receive": "Recevoir",
    "wallet.history": "Historique",
    "wallet.pending": "En Attente",

    // Settings
    "settings.title": "Paramètres",
    "settings.profile": "Profil",
    "settings.security": "Sécurité",
    "settings.notifications_pref": "Notifications",
    "settings.language_pref": "Langue",
    "settings.theme_pref": "Thème",
    "settings.subscription": "Abonnement",

    // Onboarding
    "onboarding.step1_title": "Bienvenue sur AgriChain",
    "onboarding.step1_desc": "La plateforme qui révolutionne l'agriculture en Afrique de l'Ouest",
    "onboarding.step2_title": "Choisissez votre rôle",
    "onboarding.step2_desc": "Sélectionnez le rôle qui décrit le mieux votre activité",
    "onboarding.step3_title": "Personnalisez votre profil",
    "onboarding.step3_desc": "Ajoutez vos informations pour une meilleure expérience",
    "onboarding.complete": "Commencer l'aventure",
  },

  en: {
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.marketplace": "Marketplace",
    "nav.orders": "Orders",
    "nav.tracking": "Tracking",
    "nav.wallet": "Wallet",
    "nav.ai_advisor": "AI Advisor",
    "nav.traceability": "Traceability",
    "nav.education": "Education",
    "nav.settings": "Settings",
    "nav.admin": "Administration",
    "nav.logout": "Logout",
    "nav.login": "Login",
    "nav.register": "Register",

    "landing.hero_title": "The Agricultural Chain of the Future",
    "landing.hero_subtitle": "Connect producers, cooperatives and buyers through an intelligent traceability and agricultural trade platform in West Africa.",
    "landing.cta_start": "Get Started Free",
    "landing.cta_demo": "Watch Demo",
    "landing.stats_farmers": "Farmers",
    "landing.stats_transactions": "Transactions",
    "landing.stats_countries": "Countries",
    "landing.stats_products": "Traced Products",

    "features.title": "Powerful Features",
    "features.subtitle": "Everything you need to manage your agricultural supply chain",
    "features.traceability": "Blockchain Traceability",
    "features.traceability_desc": "Track every product from farm to plate with our blockchain technology.",
    "features.ai": "AGRI AI Advisor",
    "features.ai_desc": "Get personalized recommendations for your crops using artificial intelligence.",
    "features.marketplace": "B2B/B2C Marketplace",
    "features.marketplace_desc": "Buy and sell directly with thousands of verified partners.",
    "features.logistics": "Integrated Logistics",
    "features.logistics_desc": "Manage your deliveries in real-time with GPS tracking and notifications.",
    "features.wallet": "Digital Wallet",
    "features.wallet_desc": "Secure payments, instant transfers and complete history.",
    "features.education": "Training Center",
    "features.education_desc": "Access courses and resources to improve your farming practices.",

    "auth.login_title": "Welcome Back!",
    "auth.login_subtitle": "Sign in to your AgriChain account",
    "auth.register_title": "Create Account",
    "auth.register_subtitle": "Join the agricultural revolution",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.confirm_password": "Confirm password",
    "auth.name": "Full name",
    "auth.phone": "Phone",
    "auth.role": "Role",
    "auth.forgot_password": "Forgot password?",
    "auth.no_account": "Don't have an account?",
    "auth.has_account": "Already have an account?",
    "auth.or_continue": "Or continue with",

    "dashboard.welcome": "Welcome",
    "dashboard.total_revenue": "Total Revenue",
    "dashboard.total_orders": "Total Orders",
    "dashboard.active_products": "Active Products",
    "dashboard.pending_deliveries": "Pending Deliveries",
    "dashboard.recent_activity": "Recent Activity",
    "dashboard.quick_actions": "Quick Actions",
    "dashboard.revenue_chart": "Revenue",
    "dashboard.orders_chart": "Orders",

    "marketplace.title": "AgriChain Marketplace",
    "marketplace.search": "Search products...",
    "marketplace.filter": "Filter",
    "marketplace.sort": "Sort",
    "marketplace.add_to_cart": "Add to Cart",
    "marketplace.buy_now": "Buy Now",
    "marketplace.categories": "Categories",
    "marketplace.price_range": "Price Range",
    "marketplace.per_kg": "/kg",
    "marketplace.in_stock": "In stock",
    "marketplace.out_of_stock": "Out of stock",

    "ai.title": "AGRI Advisor",
    "ai.subtitle": "Your intelligent farming assistant",
    "ai.placeholder": "Ask your farming question...",
    "ai.send": "Send",
    "ai.suggestions": "Suggestions",
    "ai.crop_prediction": "Crop Prediction",
    "ai.disease_detection": "Disease Detection",
    "ai.market_prices": "Market Prices",

    "trace.title": "Traceability",
    "trace.scan_qr": "Scan QR Code",
    "trace.enter_code": "Enter traceability code",
    "trace.timeline": "Timeline",
    "trace.certificates": "Certificates",
    "trace.origin": "Origin",
    "trace.blockchain_verified": "Blockchain Verified",

    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.warning": "Warning",
    "common.info": "Information",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.submit": "Submit",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    "common.all": "All",
    "common.none": "None",
    "common.more": "More",
    "common.less": "Less",
    "common.notifications": "Notifications",
    "common.profile": "Profile",
    "common.theme_light": "Light Mode",
    "common.theme_dark": "Dark Mode",
    "common.language": "Language",

    "role.producer": "Producer",
    "role.cooperative": "Cooperative",
    "role.logistics": "Logistics",
    "role.industry": "Industry",
    "role.consumer": "Consumer",
    "role.admin": "Administrator",
    "role.investor": "Investor",

    "pricing.title": "Our Plans",
    "pricing.subtitle": "Choose the plan that fits your needs",
    "pricing.free": "Free",
    "pricing.starter": "Starter",
    "pricing.pro": "Professional",
    "pricing.enterprise": "Enterprise",
    "pricing.per_month": "/month",
    "pricing.get_started": "Get Started",
    "pricing.contact_us": "Contact Us",
    "pricing.popular": "Popular",

    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms of Service",
    "footer.blog": "Blog",
    "footer.support": "Support",
    "footer.careers": "Careers",
    "footer.partners": "Partners",
    "footer.description": "AgriChain Solutions connects agricultural chain actors in West Africa with an intelligent platform for traceability, trade and management.",
    "footer.newsletter": "Subscribe to our newsletter",
    "footer.newsletter_placeholder": "Your email address",
    "footer.subscribe": "Subscribe",
    "footer.rights": "All rights reserved",

    "wallet.title": "My Wallet",
    "wallet.balance": "Balance",
    "wallet.send": "Send",
    "wallet.receive": "Receive",
    "wallet.history": "History",
    "wallet.pending": "Pending",

    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.security": "Security",
    "settings.notifications_pref": "Notifications",
    "settings.language_pref": "Language",
    "settings.theme_pref": "Theme",
    "settings.subscription": "Subscription",

    "onboarding.step1_title": "Welcome to AgriChain",
    "onboarding.step1_desc": "The platform revolutionizing agriculture in West Africa",
    "onboarding.step2_title": "Choose your role",
    "onboarding.step2_desc": "Select the role that best describes your activity",
    "onboarding.step3_title": "Customize your profile",
    "onboarding.step3_desc": "Add your information for a better experience",
    "onboarding.complete": "Start the adventure",
  },

  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.dashboard": "Panel de control",
    "nav.marketplace": "Mercado",
    "nav.orders": "Órdenes",
    "nav.tracking": "Seguimiento",
    "nav.wallet": "Billetera",
    "nav.ai_advisor": "Asesor IA",
    "nav.traceability": "Trazabilidad",
    "nav.education": "Educación",
    "nav.settings": "Configuración",
    "nav.admin": "Administración",
    "nav.logout": "Cerrar sesión",
    "nav.login": "Iniciar sesión",
    "nav.register": "Registrarse",

    // Landing
    "landing.hero_title": "La Cadena Agrícola del Futuro",
    "landing.hero_subtitle": "Conecta productores, cooperativas y compradores a través de una plataforma inteligente de trazabilidad y comercio agrícola en África Occidental.",
    "landing.cta_start": "Comenzar Gratis",
    "landing.cta_demo": "Ver Demo",
    "landing.stats_farmers": "Agricultores",
    "landing.stats_transactions": "Transacciones",
    "landing.stats_countries": "Países",
    "landing.stats_products": "Productos Trazados",

    // Features
    "features.title": "Funcionalidades Poderosas",
    "features.subtitle": "Todo lo que necesitas para gestionar tu cadena de suministro agrícola",
    "features.traceability": "Trazabilidad Blockchain",
    "features.traceability_desc": "Rastrea cada producto desde la granja hasta el plato con nuestra tecnología blockchain.",
    "features.ai": "Asesor IA AGRI",
    "features.ai_desc": "Obtén recomendaciones personalizadas para tus cultivos usando inteligencia artificial.",
    "features.marketplace": "Mercado B2B/B2C",
    "features.marketplace_desc": "Compra y vende directamente con miles de socios verificados.",
    "features.logistics": "Logística Integrada",
    "features.logistics_desc": "Gestiona tus entregas en tiempo real con seguimiento GPS y notificaciones.",
    "features.wallet": "Billetera Digital",
    "features.wallet_desc": "Pagos seguros, transferencias instantáneas y historial completo.",
    "features.education": "Centro de Capacitación",
    "features.education_desc": "Accede a cursos y recursos para mejorar tus prácticas agrícolas.",

    // Auth
    "auth.login_title": "¡Bienvenido de nuevo!",
    "auth.login_subtitle": "Inicia sesión en tu cuenta AgriChain",
    "auth.register_title": "Crear una cuenta",
    "auth.register_subtitle": "Únete a la revolución agrícola",
    "auth.email": "Dirección de correo electrónico",
    "auth.password": "Contraseña",
    "auth.confirm_password": "Confirmar contraseña",
    "auth.name": "Nombre completo",
    "auth.phone": "Teléfono",
    "auth.role": "Rol",
    "auth.forgot_password": "¿Olvidaste tu contraseña?",
    "auth.no_account": "¿No tienes una cuenta?",
    "auth.has_account": "¿Ya tienes una cuenta?",
    "auth.or_continue": "O continuar con",

    // Dashboard
    "dashboard.welcome": "Bienvenido",
    "dashboard.total_revenue": "Ingreso Total",
    "dashboard.total_orders": "Total de Órdenes",
    "dashboard.active_products": "Productos Activos",
    "dashboard.pending_deliveries": "Entregas Pendientes",
    "dashboard.recent_activity": "Actividad Reciente",
    "dashboard.quick_actions": "Acciones Rápidas",
    "dashboard.revenue_chart": "Ingresos",
    "dashboard.orders_chart": "Órdenes",

    // Marketplace
    "marketplace.title": "Mercado AgriChain",
    "marketplace.search": "Buscar productos...",
    "marketplace.filter": "Filtrar",
    "marketplace.sort": "Ordenar",
    "marketplace.add_to_cart": "Agregar al Carrito",
    "marketplace.buy_now": "Comprar Ahora",
    "marketplace.categories": "Categorías",
    "marketplace.price_range": "Rango de Precio",
    "marketplace.per_kg": "/kg",
    "marketplace.in_stock": "En existencia",
    "marketplace.out_of_stock": "Agotado",

    // AI Advisor
    "ai.title": "Asesor AGRI",
    "ai.subtitle": "Tu asistente agrícola inteligente",
    "ai.placeholder": "Haz tu pregunta agrícola...",
    "ai.send": "Enviar",
    "ai.suggestions": "Sugerencias",
    "ai.crop_prediction": "Predicción de Cultivo",
    "ai.disease_detection": "Detección de Enfermedad",
    "ai.market_prices": "Precios del Mercado",

    // Traceability
    "trace.title": "Trazabilidad",
    "trace.scan_qr": "Escanear Código QR",
    "trace.enter_code": "Ingresar código de trazabilidad",
    "trace.timeline": "Línea de Tiempo",
    "trace.certificates": "Certificados",
    "trace.origin": "Origen",
    "trace.blockchain_verified": "Verificado por Blockchain",

    // Common
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.view": "Ver",
    "common.search": "Buscar",
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.warning": "Advertencia",
    "common.info": "Información",
    "common.close": "Cerrar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.submit": "Enviar",
    "common.confirm": "Confirmar",
    "common.yes": "Sí",
    "common.no": "No",
    "common.all": "Todo",
    "common.none": "Ninguno",
    "common.more": "Más",
    "common.less": "Menos",
    "common.notifications": "Notificaciones",
    "common.profile": "Perfil",
    "common.theme_light": "Modo Claro",
    "common.theme_dark": "Modo Oscuro",
    "common.language": "Idioma",

    // Roles
    "role.producer": "Productor",
    "role.cooperative": "Cooperativa",
    "role.logistics": "Logística",
    "role.industry": "Industria",
    "role.consumer": "Consumidor",
    "role.admin": "Administrador",
    "role.investor": "Inversor",

    // Pricing
    "pricing.title": "Nuestros Planes",
    "pricing.subtitle": "Elige el plan que se ajuste a tus necesidades",
    "pricing.free": "Gratis",
    "pricing.starter": "Inicial",
    "pricing.pro": "Profesional",
    "pricing.enterprise": "Empresarial",
    "pricing.per_month": "/mes",
    "pricing.get_started": "Comenzar",
    "pricing.contact_us": "Contáctanos",
    "pricing.popular": "Popular",

    // Footer
    "footer.about": "Acerca de",
    "footer.contact": "Contacto",
    "footer.privacy": "Privacidad",
    "footer.terms": "Términos de Servicio",
    "footer.blog": "Blog",
    "footer.support": "Soporte",
    "footer.careers": "Carreras",
    "footer.partners": "Socios",
    "footer.description": "AgriChain Solutions conecta a los actores de la cadena agrícola en África Occidental con una plataforma inteligente de trazabilidad, comercio y gestión.",
    "footer.newsletter": "Suscríbete a nuestro boletín",
    "footer.newsletter_placeholder": "Tu dirección de correo electrónico",
    "footer.subscribe": "Suscribirse",
    "footer.rights": "Todos los derechos reservados",

    // Wallet
    "wallet.title": "Mi Billetera",
    "wallet.balance": "Saldo",
    "wallet.send": "Enviar",
    "wallet.receive": "Recibir",
    "wallet.history": "Historial",
    "wallet.pending": "Pendiente",

    // Settings
    "settings.title": "Configuración",
    "settings.profile": "Perfil",
    "settings.security": "Seguridad",
    "settings.notifications_pref": "Preferencias de Notificaciones",
    "settings.language_pref": "Preferencia de Idioma",
    "settings.theme_pref": "Preferencia de Tema",
    "settings.subscription": "Suscripción",

    // Onboarding
    "onboarding.step1_title": "Bienvenido a AgriChain",
    "onboarding.step1_desc": "La plataforma que révolutiona la agricultura en África Occidental",
    "onboarding.step2_title": "Elige tu rol",
    "onboarding.step2_desc": "Selecciona el rol que mejor describa tu actividad",
    "onboarding.step3_title": "Personaliza tu perfil",
    "onboarding.step3_desc": "Agrega tu información para una mejor experiencia",
    "onboarding.complete": "Comenzar la aventura",
  },
  pt: {
    "nav.dashboard": "Painel", "nav.marketplace": "Mercado", "nav.orders": "Pedidos", "nav.tracking": "Rastreamento", "nav.wallet": "Carteira", "nav.ai_advisor": "Consultor IA", "nav.traceability": "Rastreabilidade", "nav.education": "Formação", "nav.settings": "Definições", "nav.login": "Entrar", "nav.register": "Criar conta", "nav.logout": "Sair",
    "auth.login_title": "Bem-vindo de volta", "auth.register_title": "Criar conta", "auth.email": "E-mail", "auth.password": "Senha", "auth.confirm_password": "Confirmar senha", "auth.name": "Nome completo", "auth.phone": "Telefone",
    "dashboard.welcome": "Bem-vindo", "marketplace.title": "Mercado AgriChain", "marketplace.search": "Pesquisar produtos...", "marketplace.in_stock": "Disponível", "ai.title": "Consultor AGRI", "ai.placeholder": "Faça sua pergunta agrícola...", "trace.blockchain_verified": "Verificado por blockchain", "common.loading": "Carregando...", "common.search": "Pesquisar", "common.save": "Salvar", "common.cancel": "Cancelar", "common.next": "Próximo", "common.back": "Voltar", "common.all": "Tudo",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم", "nav.marketplace": "السوق", "nav.orders": "الطلبات", "nav.tracking": "التتبع", "nav.wallet": "المحفظة", "nav.ai_advisor": "مستشار الذكاء الاصطناعي", "nav.traceability": "التتبع الزراعي", "nav.education": "التدريب", "nav.settings": "الإعدادات", "nav.login": "تسجيل الدخول", "nav.register": "إنشاء حساب", "nav.logout": "تسجيل الخروج",
    "auth.login_title": "مرحباً بعودتك", "auth.register_title": "إنشاء حساب", "auth.email": "البريد الإلكتروني", "auth.password": "كلمة المرور", "auth.confirm_password": "تأكيد كلمة المرور", "auth.name": "الاسم الكامل", "auth.phone": "الهاتف",
    "dashboard.welcome": "مرحباً", "marketplace.title": "سوق AgriChain", "marketplace.search": "ابحث عن المنتجات...", "marketplace.in_stock": "متوفر", "ai.title": "مستشار AGRI", "ai.placeholder": "اطرح سؤالك الزراعي...", "trace.blockchain_verified": "موثق على البلوكشين", "common.loading": "جار التحميل...", "common.search": "بحث", "common.save": "حفظ", "common.cancel": "إلغاء", "common.next": "التالي", "common.back": "رجوع", "common.all": "الكل",
  },
  zh: {
    "nav.dashboard": "仪表盘", "nav.marketplace": "市场", "nav.orders": "订单", "nav.tracking": "物流追踪", "nav.wallet": "钱包", "nav.ai_advisor": "AI 顾问", "nav.traceability": "溯源", "nav.education": "培训", "nav.settings": "设置", "nav.login": "登录", "nav.register": "注册", "nav.logout": "退出",
    "auth.login_title": "欢迎回来", "auth.register_title": "创建账户", "auth.email": "电子邮件", "auth.password": "密码", "auth.confirm_password": "确认密码", "auth.name": "姓名", "auth.phone": "电话",
    "dashboard.welcome": "欢迎", "marketplace.title": "AgriChain 市场", "marketplace.search": "搜索产品...", "marketplace.in_stock": "有库存", "ai.title": "AGRI 顾问", "ai.placeholder": "提出农业问题...", "trace.blockchain_verified": "区块链已验证", "common.loading": "加载中...", "common.search": "搜索", "common.save": "保存", "common.cancel": "取消", "common.next": "下一步", "common.back": "返回", "common.all": "全部",
  },
  dyu: { "nav.marketplace": "Sugu", "nav.orders": "Commandes", "nav.tracking": "Taa sira", "nav.wallet": "Wari bɔlɔ", "nav.ai_advisor": "AI dɛmɛna", "common.search": "Ɲini", "common.save": "Mara", "common.cancel": "Dabila", "common.loading": "A bɛ taa...", "role.producer": "Sɛnɛkɛla" },
  bci: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler", "role.producer": "Producteur" },
  adj: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
  bet: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
  ati: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
  yac: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
  gou: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
  ak: { "nav.marketplace": "Dwom", "nav.orders": "Ahyɛde", "nav.tracking": "Akyidie", "nav.wallet": "Sika kotoku", "nav.ai_advisor": "AI afotufo", "common.search": "Hwehwɛ", "common.save": "Sie", "common.cancel": "Twa mu" },
  ald: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
  sef: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
  kxb: { "nav.marketplace": "Marché", "nav.orders": "Commandes", "nav.tracking": "Suivi", "nav.wallet": "Portefeuille", "nav.ai_advisor": "Conseiller IA", "common.search": "Rechercher", "common.save": "Enregistrer", "common.cancel": "Annuler" },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  locales: LocaleConfig[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract locale from pathname
  const pathnameLocale = pathname.split('/')[1] as Locale;
  const isValidLocale = locales.some(loc => loc.code === pathnameLocale);
  const localeFromPath = isValidLocale ? pathnameLocale : "fr";

  const [locale, setLocaleState] = useState<Locale>(localeFromPath);

  useEffect(() => {
    // Update URL when locale changes (except initial render to avoid loops)
    if (locale !== localeFromPath) {
      const newPathname = pathname.replace(
        /^\/[a-z]{2}(?=\/|$)/,
        `/${locale}`
      );
      router.push(newPathname, { scroll: false });
    }
  }, [locale, pathname, router]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locales.find((loc) => loc.code === locale)?.dir || "ltr";
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value = translations[locale]?.[key] || translations["fr"]?.[key] || translations["en"]?.[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{{${k}}}`, v);
        });
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation() {
  return useI18n();
}
