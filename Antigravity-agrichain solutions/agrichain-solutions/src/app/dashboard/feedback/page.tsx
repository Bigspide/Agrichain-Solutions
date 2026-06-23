"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, Lightbulb, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function UserFeedbackPage() {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      toast.success("Votre demande a été transmise à l'équipe de développement !");
      setTitle("");
      setDescription("");
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 p-8 text-white">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-500/30">
            <Lightbulb className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl font-display font-extrabold mb-4 tracking-tight">
            Améliorons <span className="text-primary-500">AgriChain</span> ensemble
          </h1>
          <p className="text-gray-400 text-lg font-medium">
            Une idée ? Une difficulté ? Dites-nous tout. Vos retours construisent l'avenir de l'agriculture.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-10 relative overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Sujet de la demande</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ajouter un mode hors-ligne pour les zones reculées"
                className="input-premium w-full px-4 py-3.5 text-sm outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Description détaillée</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Expliquez-nous en détail votre besoin ou le problème rencontré..."
                className="input-premium w-full px-4 py-3.5 text-sm outline-none min-h-[150px] resize-none"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3">
                {["low", "medium", "high"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      priority === p 
                        ? "bg-primary-500 text-white shadow-glow" 
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {p === 'low' ? 'Faible' : p === 'medium' ? 'Moyenne' : 'Haute'}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-premium px-8 py-4 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <> Envoyer la requête <Send className="w-5 h-5" /> </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Échange direct</p>
              <p className="text-xs text-gray-500">L'équipe vous répond sous 48h</p>
            </div>
          </div>
          <div className="card-premium p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Suivi transparent</p>
              <p className="text-xs text-gray-500">Suivez l'avancement via Wallet</p>
            </div>
          </div>
          <div className="card-premium p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Co-création</p>
              <p className="text-xs text-gray-500">L'utilisateur est l'architecte</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
