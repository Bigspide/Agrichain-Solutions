"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowLeft, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function OrderSuccessPage() {
  const { t } = useI18n();
  const { clearCart } = useCartStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl -z-10" />
      
      <motion.div 
        initial={{ scale: 0, rotate: -45 }} 
        animate={{ scale: 1, rotate: 0 }} 
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-emerald-500/40 ring-8 ring-emerald-500/20"
      >
        <CheckCircle2 className="w-16 h-16 text-white" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Commande Confirmée !
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto mb-12 text-lg leading-relaxed font-medium">
          Votre transaction a été sécurisée et enregistrée sur la blockchain. 
          <span className="block mt-2 text-primary-600 font-bold">Un email de confirmation a été envoyé.</span>
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-6"
      >
        <Link href="/dashboard/orders" className="btn-secondary-premium px-8 py-4 rounded-2xl flex items-center gap-3 text-base font-bold shadow-lg">
          <ShoppingBag className="w-5 h-5" /> Voir mes commandes
        </Link>
        <Link href="/dashboard/marketplace" className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 text-base font-bold shadow-xl shadow-primary-500/30">
          <Sparkles className="w-5 h-5" /> Continuer les achats
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 p-6 rounded-3xl bg-gray-50 dark:bg-navy-900/50 border border-gray-100 dark:border-gray-800 max-w-sm mx-auto"
      >
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Prochaine étape</p>
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Préparation de votre colis et génération du code de traçabilité.</p>
        </div>
      </motion.div>
    </div>
  );
}

function Truck(props: any) {
  return <div {...props}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2"/><circle cx="7" cy="18" r="2"/><path d="M14 18h4a2 2 0 0 0 2-2v-// la suite du svg" /></svg></div>
}
