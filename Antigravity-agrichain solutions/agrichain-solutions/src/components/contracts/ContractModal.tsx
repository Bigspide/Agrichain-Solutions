"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, Calendar, Hash, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";

export default function ContractModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    seller: "",
    cropType: "",
    quantity: 0,
    price: 0,
    date: "",
    batchCode: ""
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Contrat initialisé sur la Blockchain", {
      description: "Le dépôt de garantie a été verrouillé dans l'escrow.",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-navy-800 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-navy-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex items-center justify-between">
          <h3 className="text-xl font-bold">Nouveau Contrat Forward</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Vendeur (Adresse)</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 text-sm"
                  placeholder="0x..."
                  value={formData.seller}
                  onChange={(e) => setFormData({...formData, seller: e.target.value})}
                />
                <Hash className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Culture</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 text-sm"
                  placeholder="ex: Maïs"
                  value={formData.cropType}
                  onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                />
                <Package className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Quantité (Tons)</label>
              <div className="relative">
                <input 
                  type="number" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 text-sm"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
                <div className="absolute left-3 top-3.5 text-gray-400 text-xs font-bold">T</div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Prix Unitaire (USD)</label>
              <div className="relative">
                <input 
                  type="number" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 text-sm"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                />
                <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Date de Livraison Prévue</label>
            <div className="relative">
              <input 
                type="date" 
                required 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 text-sm"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
              <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Code de Lot (Blockchain Anchor)</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 text-sm"
                placeholder="BATCH-XXXX"
                value={formData.batchCode}
                onChange={(e) => setFormData({...formData, batchCode: e.target.value})}
              />
              <Hash className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
          >
            <Send className="w-5 h-5" />
            Signer et Verrouiller le Contrat
          </button>
        </form>
      </motion.div>
    </div>
  );
}
