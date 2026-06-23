"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, CreditCard, Package } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function CartPage() {
  const { t } = useI18n();
  const { cart, removeItem, updateQuantity } = useCartStore();
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-32 h-32 rounded-full bg-gray-50 dark:bg-navy-800 flex items-center justify-center mb-8 shadow-inner"
        >
          <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        </motion.div>
        <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mb-3">{t("cart.empty_title")}</h1>
        <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium">{t("cart.empty_description")}</p>
        <Link href="/dashboard/marketplace" className="btn-premium px-10 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary-500/20">
          {t("cart.go_shopping")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">{t("cart.title")}</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Vérifiez vos produits d'exception avant la validation.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-premium p-5 flex items-center gap-6 group transition-all hover:shadow-lg border-l-4 border-transparent hover:border-primary-500"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-navy-800 flex-shrink-0 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm">
                <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="font-display font-extrabold text-gray-900 dark:text-white">{item.price.toLocaleString()} FCFA</p>
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Produit certifié Blockchain</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-navy-800 rounded-xl p-1.5 border border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} 
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-navy-700 text-gray-500 hover:text-primary-600 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold w-6 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-navy-700 text-gray-500 hover:text-primary-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => removeItem(item.id)} 
                className="p-3 text-gray-300 hover:text-red-500 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Supprimer l'article"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="card-premium p-8 h-fit sticky top-24 shadow-xl border-t-4 border-primary-500">
          <h2 className="text-xl font-display font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" /> {t("cart.summary")}
          </h2>
          <div className="space-y-4 mb-10">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Sous-total</span>
              <span className="font-bold text-gray-900 dark:text-white">{totalAmount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Livraison Express</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Offert</span>
            </div>
            <div className="flex justify-between text-xl font-display font-extrabold border-t border-gray-100 dark:border-gray-800 pt-5 mt-5 text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{totalAmount.toLocaleString()} FCFA</span>
            </div>
          </div>
          <Link href="/dashboard/checkout" className="btn-premium w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base shadow-lg shadow-primary-500/30">
            {t("cart.checkout")} <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Paiement 100% Sécurisé
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return <div {...props}><div className="w-full h-full bg-current rounded-full opacity-20 absolute" /> <CreditCard className="w-full h-full relative z-10" /></div>
}
