"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Search, Download, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Order } from "@/types";

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  pending: { color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", icon: Clock, label: "En attente" },
  confirmed: { color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", icon: CheckCircle, label: "Confirmee" },
  processing: { color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20", icon: Package, label: "En traitement" },
  shipped: { color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20", icon: Truck, label: "Expediee" },
  in_transit: { color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20", icon: Truck, label: "En transit" },
  delivered: { color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle, label: "Livree" },
  cancelled: { color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20", icon: XCircle, label: "Annulee" },
  refunded: { color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20", icon: XCircle, label: "Remboursee" },
};

export default function OrdersPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les commandes");
        const payload = (await response.json()) as { orders?: Order[] };
        if (!cancelled) setOrders(payload.orders || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!query) return true;
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some((item) => item.productName.toLowerCase().includes(query))
      );
    });
  }, [filter, orders, searchQuery]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t("nav.orders")}</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} commandes synchronisees depuis la base</p>
        </div>
        <button className="btn-primary text-sm"><Download className="w-4 h-4" /> Exporter</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher une commande ou un produit..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "pending", "processing", "in_transit", "delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-primary-500 text-white"
                  : "bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {status === "all" ? "Toutes" : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading && (
        <div className="card-premium p-8 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement des commandes...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="card-premium p-6 border-red-200 dark:border-red-900">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <p className="text-xs text-gray-500 mt-1">Verifiez votre session et la connexion PostgreSQL/Supabase.</p>
        </div>
      )}

      {!isLoading && !error && filteredOrders.length === 0 && (
        <div className="card-premium p-8 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-900 dark:text-white">Aucune commande trouvee</p>
          <p className="text-sm text-gray-500 mt-1">Les commandes creees via la marketplace apparaitront ici.</p>
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.map((order, index) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="card-premium p-5 hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${status.bgColor} flex items-center justify-center`}>
                    <StatusIcon className={`w-6 h-6 ${status.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${status.bgColor} ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{order.items.map((item) => item.productName).join(", ")}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("fr", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-display font-bold text-gray-900 dark:text-white">
                      {order.totalAmount.toLocaleString()} <span className="text-xs text-gray-500">{order.currency}</span>
                    </p>
                    <p className={`text-xs ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                      {order.paymentStatus === "paid" ? "Paye" : "Paiement en attente"}
                    </p>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label={`Voir ${order.orderNumber}`}>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
