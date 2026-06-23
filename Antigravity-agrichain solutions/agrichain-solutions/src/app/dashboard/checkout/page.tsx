"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Truck, ShieldCheck, ChevronRight, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { t } = useI18n();
  const { cart } = useCartStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "mobile_money">("mobile_money");
  const [loading, setLoading] = useState(false);

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  async function handlePayment() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/mobile-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          phone: "22500000000",
          orderId: "demo-order-123",
        }),
      });

      if (response.ok) {
        router.push("/dashboard/orders/success");
      } else {
        alert("Erreur lors du paiement");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">Finaliser la commande</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Une dernière étape pour sécuriser vos produits d'exception.</p>
      </motion.div>
      
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Livraison Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="card-premium p-8"
          >
            <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Truck className="w-5 h-5 text-primary-600" />
              </div>
              Informations de Livraison
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Adresse complète</label>
                <input type="text" placeholder="Ex: Rue des Jardins, Plateau" className="input-premium w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Ville</label>
                <input type="text" placeholder="Abidjan" className="input-premium w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Code Postal</label>
                <input type="text" placeholder="00225" className="input-premium w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Pays</label>
                <input type="text" className="input-premium w-full" defaultValue="Côte d'Ivoire" />
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="card-premium p-8"
          >
            <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <CreditCard className="w-5 h-5 text-primary-600" />
              </div>
              Mode de Paiement
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <button 
                onClick={() => setPaymentMethod("mobile_money")}
                className={`p-6 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${paymentMethod === "mobile_money" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10" : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Mobile Money</span>
                  {paymentMethod === "mobile_money" && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                </div>
                <div className="text-xs text-gray-500 font-medium">Orange, MTN, Wave</div>
                <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard className="w-16 h-16 rotate-12" />
                </div>
              </button>
              <button 
                onClick={() => setPaymentMethod("stripe")}
                className={`p-6 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${paymentMethod === "stripe" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10" : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Carte Bancaire</span>
                  {paymentMethod === "stripe" && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                </div>
                <div className="text-xs text-gray-500 font-medium">Visa, Mastercard (via Stripe)</div>
                <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard className="w-16 h-16 rotate-12" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Checkout Summary Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3 }} 
          className="card-premium p-8 h-fit sticky top-24 shadow-2xl border-t-4 border-primary-500"
        >
          <h2 className="text-xl font-display font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-500" /> Récapitulatif
          </h2>
          <div className="space-y-4 mb-10">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Total Articles</span>
              <span className="font-bold text-gray-900 dark:text-white">{totalAmount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Taxes (TVA)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Inclus</span>
            </div>
            <div className="flex justify-between text-xl font-display font-extrabold border-t border-gray-100 dark:border-gray-800 pt-5 mt-5 text-gray-900 dark:text-white">
              <span>Total à payer</span>
              <span>{totalAmount.toLocaleString()} FCFA</span>
            </div>
          </div>
          <button 
            onClick={handlePayment}
            disabled={loading}
            className="btn-premium w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base shadow-lg shadow-primary-500/30"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {loading ? "Traitement..." : "Payer Maintenant"}
          </button>
          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Sécurisée SSL 256-bit</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
