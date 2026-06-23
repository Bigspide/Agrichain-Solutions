"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, TrendingUp, CreditCard, Send, Download, Plus, RefreshCw, ShieldCheck, History, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "@/lib/i18n";
import type { Wallet } from "@/types";

const emptyWallet: Wallet = {
  balance: 0,
  currency: "XOF",
  pendingBalance: 0,
  totalEarnings: 0,
  totalSpent: 0,
  transactions: [],
};

function formatMoney(amount: number, currency = "XOF") {
  return `${amount.toLocaleString()} ${currency === "XOF" ? "FCFA" : currency}`;
}

function ChartShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="h-52 rounded-xl bg-gray-50 dark:bg-navy-800 animate-pulse" />;
  }

  return <div className="h-52">{children}</div>;
}

export default function WalletPage() {
  const { t } = useI18n();
  const [wallet, setWallet] = useState<Wallet>(emptyWallet);
  const [activeTab, setActiveTab] = useState<"all" | "credit" | "debit">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWallet() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/wallet", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger le portefeuille");
        const payload = (await response.json()) as { wallet?: Wallet };
        if (!cancelled) setWallet(payload.wallet || emptyWallet);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur portefeuille");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWallet();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = wallet.transactions.filter((transaction) => activeTab === "all" || transaction.type === activeTab);

  const balanceHistory = useMemo(() => {
    const ordered = [...wallet.transactions].reverse();
    let runningBalance = 0;
    const points = ordered.map((transaction) => {
      if (transaction.status === "completed") {
        runningBalance += transaction.type === "credit" ? transaction.amount : -transaction.amount;
      }
      return {
        name: new Date(transaction.timestamp).toLocaleDateString("fr", { day: "2-digit", month: "short" }),
        value: runningBalance,
      };
    });
    return points.length > 0 ? points : [{ name: "Now", value: wallet.balance }];
  }, [wallet]);

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">{t("wallet.title")}</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Gestion sécurisée de vos fonds et règlements blockchain.</p>
      </motion.div>

      {isLoading && (
        <div className="card-premium p-12 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mb-4" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Synchronisation du Ledger...</p>
        </div>
      )}

      {error && (
        <div className="card-premium p-6 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-8">Le solde est calculé dynamiquement depuis vos transactions validées.</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-emerald-700 to-navy-900 p-10 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-primary-100 text-sm font-bold uppercase tracking-widest opacity-80">{t("wallet.balance")}</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/20 text-[10px] font-bold">
              <Zap className="w-3 h-3 text-yellow-300" /> SYNCHRONISÉ
            </div>
          </div>
          <p className="text-5xl font-display font-extrabold mb-8 tracking-tighter">
            {wallet.balance.toLocaleString()} <span className="text-2xl text-primary-200 font-medium">{wallet.currency === "XOF" ? "FCFA" : wallet.currency}</span>
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button className="btn-premium !bg-white !text-primary-700 hover:bg-gray-100 flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all shadow-xl">
              <Send className="w-4 h-4" /> {t("wallet.send")}
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold text-sm rounded-2xl hover:bg-white/20 transition-all border border-white/20">
              <Download className="w-4 h-4" /> {t("wallet.receive")}
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold text-sm rounded-2xl hover:bg-white/20 transition-all border border-white/20">
              <Plus className="w-4 h-4" /> Recharger
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 card-premium p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Évolution du Solde</h3>
              <p className="text-xs text-gray-400 font-medium">Historique des flux financiers</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-navy-800 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <ChartShell>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} tickFormatter={(value) => `${(Number(value) / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", backdropFilter: "blur(10px)" }}
                  formatter={(value) => formatMoney(Number(value ?? 0), wallet.currency)} 
                />
                <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartShell>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          <div className="card-premium p-6 group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total reçu</p>
                <p className="text-xl font-display font-extrabold text-gray-900 dark:text-white">{formatMoney(wallet.totalEarnings, wallet.currency)}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-6 group hover:border-red-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total dépensé</p>
                <p className="text-xl font-display font-extrabold text-gray-900 dark:text-white">{formatMoney(wallet.totalSpent, wallet.currency)}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-6 group hover:border-yellow-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("wallet.pending")}</p>
                <p className="text-xl font-display font-extrabold text-gray-900 dark:text-white">{formatMoney(wallet.pendingBalance, wallet.currency)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-premium p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-navy-800 rounded-lg">
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">{t("wallet.history")}</h3>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-navy-800 rounded-xl p-1">
            {(["all", "credit", "debit"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-white dark:bg-navy-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab === "all" ? "Tout" : tab === "credit" ? "Reçu" : "Envoyé"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-navy-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <WalletIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune transaction</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Votre ledger est actuellement vide. Effectuez un transfert ou vendez vos produits pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((transaction) => (
              <motion.div 
                key={transaction.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-all group border border-transparent hover:border-gray-100 dark:hover:border-navy-700"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${transaction.type === "credit" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                    {transaction.type === "credit" ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-xs text-gray-400 font-medium">{transaction.reference || transaction.category} • {new Date(transaction.timestamp).toLocaleDateString("fr")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-extrabold ${transaction.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                    {transaction.type === "credit" ? "+" : "-"}{formatMoney(transaction.amount, transaction.currency)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${transaction.status === "completed" ? "text-gray-400" : "text-yellow-500"}`}>
                    {transaction.status === "completed" ? "Validé" : "En attente"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
