"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight, Shield, Cpu, ShoppingBag, Truck, Wallet, GraduationCap,
  Star, ChevronRight, Check, Play, Leaf, Globe, Users, BarChart3, Zap,
  ArrowUpRight, Sparkles
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/layout/Header";

type StatItem = {
  key: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<{ className??: string }>;
  color: string;
};

const GlobeScene = dynamic(() => import("@/components/three/GlobeScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-primary-950 to-navy-950" />,
});
const FieldDigitalTwin = dynamic(() => import("@/components/three/FieldDigitalTwin"), {
  ssr: false,
});

function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (startOnView && inView) setStarted(true);
  }, [inView, startOnView]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return { count, ref };
}

function HeroSection() {
  const { t } = useI18n();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-navy-950 via-primary-950 to-navy-950">
      <GlobeScene />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-sm mb-8 hover:bg-primary-500/20 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-primary-400 group-hover:animate-spin transition-all" />
            <span className="text-sm font-bold text-primary-300 tracking-wide">Plateforme #1 en Afrique de l&apos;Ouest</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="font-display text-display-lg md:text-display-xl font-extrabold text-white leading-tight mb-6 tracking-tighter"
          >
            {t("landing.hero_title").split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                className={`inline-block mr-3 ${i >= 3 ?? "gradient-text" : ""}`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed font-medium"
          >
            {t("landing.hero_subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link
              href="/register"
              className="btn-premium px-10 py-5 text-lg rounded-2xl shadow-glow-lg hover:shadow-glow group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3 font-bold">
                {t("landing.cta_start")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <Link
              href="/login"
              className="btn-secondary-premium px-10 py-5 text-lg rounded-2xl border-white/20 text-white hover:bg-white/10 group backdrop-blur-md font-bold"
            >
              <Play className="w-5 h-5 inline mr-2 group-hover:text-primary-400 transition-colors" />
              {t("landing.cta_demo")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="flex flex-wrap items-center gap-8 mt-16 text-sm text-gray-400"
          >
            {[
              { icon: Shield, text: "Blockchain V??rifi??" },
              { icon: Globe, text: "15+ Pays" },
              { icon: Users, text: "50K+ Utilisateurs" }
            ].map((badge, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, color: "#fff" }}
                className="flex items-center gap-2 cursor-pointer transition-all group"
              >
                <badge.icon className="w-5 h-5 text-primary-400 group-hover:text-white transition-colors" />
                <span className="font-medium">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5"
        >
          <motion.div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatCard({ stat, index, label }: { stat: StatItem; index: number; label: string }) {
  const counter = useCounter(stat.value, 2500);
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="text-center group"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110 shadow-xl">
        <Icon className={`w-8 h-8 ${stat.color}`} />
      </div>
      <div className="text-4xl md:text-5xl font-display font-extrabold text-white mb-2 tracking-tight">
        <span ref={counter.ref}>
          {stat.value >= 1000000
            ?? `${(counter.count / 1000000).toFixed(1)}M`
            : stat.value >= 1000
            ?? `${Math.floor(counter.count / 1000)}K`
            : counter.count}
        </span>
        {stat.suffix}
      </div>
      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

function StatsSection() {
  const { t } = useI18n();
  const stats: StatItem[] = [
    { key: "farmers", value: 50000, suffix: "+", icon: Users, color: "text-primary-400" },
    { key: "transactions", value: 2500000, suffix: "+", icon: BarChart3, color: "text-gold-400" },
    { key: "countries", value: 15, suffix: "", icon: Globe, color: "text-blue-400" },
    { key: "products", value: 125000, suffix: "+", icon: Leaf, color: "text-emerald-400" },
  ];

  return (
    <section className="relative py-24 bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <StatCard key={stat.key} stat={stat} index={i} label={t(`landing.stats_${stat.key}`)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  // ... (existing features logic)
}

function DigitalTwinSection() {
  // In a real scenario, these would come from a real API call via a hook
  const fields = [
    { id: '1', name: 'North Plot', ndvi: 0.82 },
    { id: '2', name: 'East Sector', ndvi: 0.45 },
    { id: '3', name: 'South Basin', ndvi: 0.18 },
    { id: '4', name: 'West Ridge', ndvi: 0.67 },
    { id: '5', name: 'Central Hub', ndvi: 0.91 },
  ];

  return (
    <section className="py-32 bg-navy-950 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold mb-6 border border-primary-500/20"
          >
            <Sparkles className="w-4 h-4" /> Technologie de Pointe
          </motion.span>
          <h2 className="font-display text-display-md md:text-display-lg font-extrabold text-white mb-6 tracking-tight">
            Jumeaux Num??riques <span className="gradient-text">Souverains</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Nous transformons les donn??es spectrales satellites en mod??les 3D interactifs. Visualisez la sant?? de vos cultures en temps r??el avec une pr??cision millim??trique.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative"
        >
          <FieldDigitalTwin />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold-500/20 rounded-full blur-[100px] pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Kouam?? Yao",
      role: "Producteur de Cacao",
      location: "Daloa, CI",
      text: "AgriChain a transform?? ma fa??on de vendre. Je re??ois maintenant des commandes directement des industriels et mes revenus ont augment?? de 40%.",
      rating: 5,
    },
    {
      name: "Aminata Kon??",
      role: "Directrice de Coop??rative",
      location: "Bouak??, CI",
      text: "La Traï¿½abilitï¿½ blockchain nous a permis d'obtenir la certification Fair Trade et d'acc??der ?? des march??s premium internationaux.",
      rating: 5,
    },
    {
      name: "Ibrahim Sanogo",
      role: "Responsable Logistique",
      location: "Abidjan, CI",
      text: "Le suivi en temps r??el a r??duit nos pertes de 25%. La plateforme est intuitive m??me pour nos chauffeurs peu alphab??tis??s.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-display-sm md:text-display-md font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
            Des milliers d&apos;acteurs agricoles nous font confiance
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card-premium p-8 group hover:shadow-xl transition-all"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role} ?? {testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="overflow-hidden relative">
      <div className="noise-overlay" />
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DigitalTwinSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}

function PricingSection() {
  const { t } = useI18n();
  const plans = [
    {
      name: t("pricing.free"),
      price: "0",
      period: "FCFA",
      description: "Pour d??marrer",
      features: ["5 produits", "Traï¿½abilitï¿½ de base", "Marketplace", "Support communaut??"],
      cta: t("pricing.get_started"),
      popular: false,
      gradient: "",
    },
    {
      name: t("pricing.starter"),
      price: "9,900",
      period: "FCFA/mois",
      description: "Pour les producteurs",
      features: ["50 produits", "Traï¿½abilitï¿½ avanc??e", "Conseiller IA", "Portefeuille digital", "Support prioritaire"],
      cta: t("pricing.get_started"),
      popular: false,
      gradient: "",
    },
    {
      name: t("pricing.pro"),
      price: "29,900",
      period: "FCFA/mois",
      description: "Pour les coop??ratives",
      features: ["Produits illimit??s", "Blockchain compl??te", "IA Premium", "Analytics avanc??s", "API access", "Support d??di?? 24/7"],
      cta: t("pricing.get_started"),
      popular: true,
      gradient: "from-primary-500 to-primary-700",
    },
    {
      name: t("pricing.enterprise"),
      price: "Sur mesure",
      period: "",
      description: "Pour les industriels",
      features: ["Tout illimit??", "D??ploiement sur-mesure", "Int??gration ERP", "SLA garanti", "Formation d??di??e", "Account manager"],
      cta: t("pricing.contact_us"),
      popular: false,
      gradient: "",
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-display-sm md:text-display-md font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t("pricing.title")}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            {t("pricing.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ?? "bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-glow-lg scale-105 ring-4 ring-primary-500/20"
                  : "card-premium hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-400 text-navy-950 text-xs font-bold rounded-full shadow-sm">
                  {t("pricing.popular")}
                </div>
              )}
              <h3 className={`text-xl font-display font-bold mb-2 ${plan.popular ?? "text-white" : "text-gray-900 dark:text-white"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.popular ?? "text-primary-100" : "text-gray-500"}`}>{plan.description}</p>
              <div className="mb-6">
                <span className={`text-3xl font-display font-extrabold ${plan.popular ?? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm ml-1 ${plan.popular ?? "text-primary-200" : "text-gray-500"}`}>{plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ?? "text-primary-200" : "text-primary-500"}`} />
                    <span className={plan.popular ?? "text-primary-50" : "text-gray-600 dark:text-gray-400"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.popular
                    ?? "bg-white text-primary-700 hover:bg-gray-100 shadow-md"
                    : "btn-primary w-full"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-display-sm md:text-display-md font-extrabold text-white mb-6 tracking-tight">
            Pr??t ?? r??volutionner votre cha??ne agricole ??
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto font-medium">
            Rejoignez des milliers d&apos;agriculteurs et d&apos;entreprises qui transforment l&apos;agriculture en Afrique de l&apos;Ouest.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-primary-700 font-bold rounded-2xl hover:bg-gray-100 transition-all text-lg shadow-2xl"
            >
              Commencer Maintenant <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-lg backdrop-blur-sm"
            >
              Voir la D??mo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useI18n();
  const links = {
    Produit: ["Marketplace", "Traï¿½abilitï¿½", "Conseiller IA", "Logistique", "Portefeuille"],
    Entreprise: [t("footer.about"), t("footer.careers"), t("footer.partners"), t("footer.blog")],
    Support: [t("footer.support"), t("footer.contact"), "FAQ", "Documentation"],
    Lï¿½gal: [t("footer.privacy"), t("footer.terms"), "Cookies", "RGPD"],
  };

  return (
    <footer className="bg-navy-950 text-gray-400 pt-20 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">??</span>
              </div>
              <span className="font-display font-extrabold text-2xl text-white tracking-tight">AgriChain</span>
            </Link>
            <p className="text-sm leading-relaxed mb-8 max-w-sm font-medium opacity-80">{t("footer.description")}</p>
            <div className="flex gap-4">
              {["Twitter", "LinkedIn", "Facebook", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary-500/50"
                >
                  <span className="text-sm font-bold">{social.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-primary-400 transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-10 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-medium">{t("footer.newsletter")}</p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder={t("footer.newsletter_placeholder")}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 outline-none w-72 transition-all"
              />
              <button className="btn-premium px-6 py-3 rounded-2xl text-sm font-bold">{t("footer.subscribe")}</button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium">
          <p>© 2024 AgriChain Solutions. {t("footer.rights")}.</p>
          <p className="flex items-center gap-2">
            Made with <span className="text-red-500">❤</span> in Côte d&apos;Ivoire <span>🇨🇮</span>
          </p>
        </div>
      </div>
    </footer>
  );
}



