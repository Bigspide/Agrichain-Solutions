"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Gavel, ShieldCheck, Calendar, 
  CheckCircle2, ArrowRight, AlertCircle 
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { paymentHub } from "@/lib/payment";

interface ForwardContractForm {
  product: string;
  quantity: number;
  fixedPrice: number;
  deliveryDate: string;
}

export default function ForwardContractsPage() {
  const { t } = useI18n();
  const [step, setStep] = useState<'list' | 'propose'>('list');
  const [form, setForm] = useState<ForwardContractForm>({
    product: '',
    quantity: 0,
    fixedPrice: 0,
    deliveryDate: '',
  });

  const mockContracts = [
    { id: '1', product: 'Cacao Grade A', quantity: 10, price: 1500, status: 'active', buyer: 'Industrie ChocoCI', expiry: '2026-12-01' },
    { id: '2', product: 'Anacarde', quantity: 5, price: 800, status: 'fulfilled', buyer: 'Export Nord', expiry: '2026-08-15' },
    { id: '3', product: 'Maïs', quantity: 20, price: 300, status: 'proposed', buyer: 'Coopérative Sud', expiry: '2026-11-20' },
  ];

  const handlePropose = async () => {
    const totalValue = form.quantity * form.fixedPrice;
    const deposit = totalValue * 0.2; // 20% Escrow

    try {
      const response = await paymentHub.executePayment('mobile_money', {
        amount: deposit,
        currency: 'XOF',
        orderId: `FWD-${Date.now()}`,
        userId: 'user-123',
        operator: 'wave',
      });
      
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (e) {
      alert("Erreur lors du dépôt de garantie");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Ventes à Terme <span className="gradient-text">(Forward Contracts)</span>
          </h1>
          <p className="text-gray-400 font-medium">Sécurisez vos revenus, garantissez vos approvisionnements.</p>
        </div>
        
        {step === 'list' && (
          <button 
            onClick={() => setStep('propose')}
            className="btn-premium px-6 py-3 text-sm"
          >
            <FileText className="w-4 h-4" /> Proposer un Contrat
          </button>
        )}
      </div>

      {step === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {mockContracts.map((contract) => (
              <motion.div 
                key={contract.id}
                whileHover={{ x: 10 }}
                className="card-premium p-6 bg-navy-900/50 border-white/5 backdrop-blur-md flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    contract.status === 'active' ? 'bg-primary-500/20 text-primary-400' :
                    contract.status === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    <Gavel className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{contract.product}</h3>
                    <p className="text-xs text-gray-500 font-medium">Acheteur: {contract.buyer} • Échéance: {contract.expiry}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-display font-extrabold text-white">{contract.price} <span className="text-xs text-gray-500">FCFA/unit</span></p>
                  <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full inline-block ${
                    contract.status === 'active' ? 'bg-primary-500/20 text-primary-400' :
                    contract.status === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {contract.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card-premium p-8 bg-navy-900/50 border-white/5 backdrop-blur-md">
            <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-400" /> Mécanisme Escrow
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Accord sur le prix et la quantité $\\rightarrow$ <span className="text-white font-bold">Signature Numérique</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Dépôt de garantie (20%) $\\rightarrow$ <span className="text-white font-bold">Verrouillage Blockchain</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Livraison validée $\\rightarrow$ <span className="text-white font-bold">Paiement Final Instantané</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium p-10 bg-navy-900/50 border-white/5 backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-display font-bold text-white">Nouvelle Proposition</h2>
              <button onClick={() => setStep('list')} className="text-gray-500 hover:text-white transition-colors">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Produit</label>
                <input 
                  type="text" 
                  className="input-premium" 
                  placeholder="ex: Cacao Grade A"
                  onChange={(e) => setForm({...form, product: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date de Livraison</label>
                <input 
                  type="date" 
                  className="input-premium"
                  onChange={(e) => setForm({...form, deliveryDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Quantité (kg/têtes)</label>
                <input 
                  type="number" 
                  className="input-premium" 
                  placeholder="0"
                  onChange={(e) => setForm({...form, quantity: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Prix Fixé (FCFA/unité)</label>
                <input 
                  type="number" 
                  className="input-premium" 
                  placeholder="0"
                  onChange={(e) => setForm({...form, fixedPrice: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary-400" />
                <h3 className="font-bold text-white">Dépôt de Garantie (Escrow)</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Le dépôt de 20% est requis pour valider le contrat sur la blockchain.</p>
                <p className="text-2xl font-display font-extrabold text-white">
                  {(form.quantity * form.fixedPrice * 0.2).toLocaleString()} <span className="text-sm text-gray-500">FCFA</span>
                </p>
              </div>
            </div>

            <button 
              onClick={handlePropose}
              className="btn-premium w-full py-5 text-lg"
            >
              Signer & Verrouiller le Contrat <CheckCircle2 className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}