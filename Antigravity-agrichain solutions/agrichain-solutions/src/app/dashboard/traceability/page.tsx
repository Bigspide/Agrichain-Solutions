"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Search, Shield, CheckCircle, MapPin, Calendar,
  Package, Truck, Factory, ShoppingBag, Leaf, Copy, ExternalLink, RefreshCw
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TraceRecord } from "@/types";

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  planted: Leaf,
  harvested: Package,
  collected: ShoppingBag,
  processed: Factory,
  quality_checked: CheckCircle,
  stored: Package,
  shipped: Truck,
  received: Factory,
  sold: ShoppingBag,
};

const eventColors: Record<string, string> = {
  planted: "from-green-400 to-emerald-600",
  harvested: "from-emerald-400 to-green-600",
  collected: "from-blue-400 to-indigo-600",
  processed: "from-purple-400 to-violet-600",
  quality_checked: "from-indigo-400 to-blue-600",
  stored: "from-gray-400 to-slate-600",
  shipped: "from-orange-400 to-amber-600",
  received: "from-teal-400 to-emerald-600",
  sold: "from-pink-400 to-rose-600",
};

export default function TraceabilityPage() {
  const { t } = useI18n();
  const [traceCode, setTraceCode] = useState("AGR-CI-2026-CAC-001");
  const [activeTrace, setActiveTrace] = useState<TraceRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "certificates" | "origin">("timeline");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTrace(code: string) {
    const normalized = code.trim();
    if (!normalized) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trace/${encodeURIComponent(normalized)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Trace introuvable");
      const payload = (await response.json()) as { trace?: TraceRecord };
      setActiveTrace(payload.trace || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de tracabilite");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTrace("AGR-CI-2026-CAC-001");
  }, []);

  const origin = activeTrace?.origin;
  const plantedDate = origin?.plantedDate ? new Date(origin.plantedDate).toLocaleDateString("fr") : "A verifier";
  const harvestedDate = origin?.harvestedDate ? new Date(origin.harvestedDate).toLocaleDateString("fr") : "A verifier";

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">{t("trace.title")}</h1>
        <p className="text-sm text-gray-500 font-medium">Suivez chaque produit de la ferme à l&apos;assiette, avec ancrage blockchain immuable.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={traceCode}
              onChange={(event) => setTraceCode(event.target.value)}
              placeholder={`${t("trace.enter_code")} (ex: AGR-CI-2026-CAC-001)`}
              className="input-premium w-full pl-12 pr-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => loadTrace(traceCode)} className="btn-premium px-6 flex items-center gap-2" disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Rechercher
            </button>
            <button className="btn-secondary-premium px-6 flex items-center gap-2">
              <QrCode className="w-4 h-4" /> {t("trace.scan_qr")}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-3 font-bold flex items-center gap-2"><Shield className="w-4 h-4" /> {error}</p>}
      </motion.div>

      {!isLoading && !activeTrace && !error && (
        <div className="card-premium p-16 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-navy-800 flex items-center justify-center mb-6 shadow-inner">
            <Shield className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun lot chargé</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Saisissez un code de traçabilité unique pour déverrouiller l'historique blockchain du produit.</p>
        </div>
      )}

      {activeTrace && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Identity Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-premium p-8 flex flex-col">
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-emerald-50 dark:from-primary-900/30 dark:to-emerald-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg ring-4 ring-primary-500/10">
                <Leaf className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white leading-tight">{activeTrace.productName}</h2>
              <p className="text-xs font-mono text-gray-400 mt-2 uppercase tracking-widest">{activeTrace.traceCode}</p>
              <div className="flex items-center justify-center gap-2 mt-4 py-1 px-3 bg-primary-50 dark:bg-primary-900/20 rounded-full w-max mx-auto">
                <Shield className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-tighter">{t("trace.blockchain_verified")}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {[
                { label: "Origine", value: origin?.region || "Non renseignée" },
                { label: "Producteur", value: origin?.farmer || "Non renseigné" },
                { label: "Coopérative", value: origin?.cooperative || "Indépendante" },
                { label: "Statut", value: activeTrace.status === "completed" ? "Terminé" : "Actif", isStatus: true },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-navy-800/30 px-2 rounded-lg transition-all">
                  <span className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{item.label}</span>
                  <span className={`font-bold text-gray-900 dark:text-white ${item.isStatus ? "px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] rounded-lg" : ""}`}>
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-3">
                <span className="text-gray-500">Hash Blockchain</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-900 dark:text-white bg-gray-100 dark:bg-navy-800 px-2 py-1 rounded-md">{activeTrace.blockchainHash.slice(0, 12)}...</span>
                  <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors text-gray-400 hover:text-primary-600" aria-label="Copier le hash"><Copy className="w-3 h-3" /></button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 dark:bg-navy-950 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center group transition-all hover:border-primary-300">
              <QrCode className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto transition-transform group-hover:scale-110 duration-300" />
              <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">QR Code de traçabilité</p>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex gap-1 bg-gray-100 dark:bg-navy-800 rounded-2xl p-1 w-max">
              {(["timeline", "certificates", "origin"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-white dark:bg-navy-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t(`trace.${tab}`)}
                </button>
              ))}
            </div>

            <div className="flex-1">
              {activeTab === "timeline" && (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-gray-200 to-transparent dark:from-primary-600 dark:via-gray-800" />
                  <div className="space-y-10">
                    {activeTrace.timeline.map((event, index) => {
                      const Icon = eventIcons[event.type] || Package;
                      const gradient = eventColors[event.type];
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex gap-6 ml-1 group"
                        >
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 z-10 shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 card-premium p-6 transition-all duration-300 hover:shadow-xl group-hover:border-primary-500/30">
                            <div className="flex items-start justify-between mb-2 gap-3">
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{event.title}</h4>
                              {event.verified && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                  <CheckCircle className="w-3 h-3" /> VERIFIÉ
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{event.description}</p>
                            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-gray-400">
                              <span className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary-500" /> {event.location}
                              </span>
                              <span className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                {new Date(event.timestamp).toLocaleDateString("fr", { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            {event.blockchainTx && (
                              <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-mono bg-gray-50 dark:bg-navy-950 p-2 rounded-lg w-max border border-gray-100 dark:border-navy-800">
                                <span className="text-gray-500">Hash:</span> {event.blockchainTx}
                                <ExternalLink className="w-3 h-3 text-primary-500 cursor-pointer hover:text-primary-600" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "certificates" && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {activeTrace.certificates.map((certificate) => (
                    <motion.div
                      key={certificate.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card-premium p-6 border-l-4 border-primary-500 relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                        <CheckCircle className="w-24 h-24 text-primary-500" />
                      </div>
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{certificate.name}</h4>
                          <p className="text-xs text-gray-500 font-medium">{certificate.issuer}</p>
                        </div>
                        {certificate.verified && <CheckCircle className="w-6 h-6 text-primary-500" />}
                      </div>
                      <div className="text-xs text-gray-500 space-y-2 relative z-10">
                        <div className="flex justify-between">
                          <span>Date d'émission</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{new Date(certificate.issuedDate).toLocaleDateString("fr")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date d'expiration</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{new Date(certificate.expiryDate).toLocaleDateString("fr")}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === "origin" && origin && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="h-80 bg-gradient-to-br from-primary-100 via-white to-emerald-50 dark:from-primary-900/20 dark:via-navy-900 dark:to-emerald-900/30 rounded-3xl flex items-center justify-center relative overflow-hidden border border-primary-100 dark:border-primary-900/30">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <div className="text-center relative z-10">
                      <div className="w-16 h-16 bg-white dark:bg-navy-800 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <MapPin className="w-8 h-8 text-primary-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{origin.region}, {origin.country}</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        Coordonnées GPS: {origin.coordinates.lat}, {origin.coordinates.lng}
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { label: "Ferme", value: origin.farm },
                      { label: "Producteur", value: origin.farmer },
                      { label: "Date de plantation", value: plantedDate },
                      { label: "Date de récolte", value: harvestedDate },
                    ].map((item) => (
                      <div key={item.label} className="card-premium p-6 transition-all hover:shadow-md border-l-4 border-primary-500">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
