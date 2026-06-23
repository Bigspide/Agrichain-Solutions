"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, ShoppingCart, ShieldCheck, 
  ArrowUpRight, Leaf, Fish, Beef, FlaskConical, 
  ChevronRight, CheckCircle2, Activity as ActivityIcon 
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { paymentHub } from "@/lib/payment";

type Category = 'CROP' | 'LIVESTOCK' | 'AQUACULTURE' | 'INPUT' | 'SERVICE';

const CATEGORIES: Record<Category, { icon: any; label: string; color: string }> = {
  CROP: { icon: Leaf, label: "Cultures", color: "text-emerald-500" },
  LIVESTOCK: { icon: Beef, label: "Élevage", color: "text-orange-500" },
  AQUACULTURE: { icon: Fish, label: "Aquaculture", color: "text-blue-500" },
  INPUT: { icon: FlaskConical, label: "Intrants", color: "text-purple-500" },
  SERVICE: { icon: ShieldCheck, label: "Services", color: "text-indigo-500" },
};

export default function MarketplacePage() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<Category>('CROP');
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?category=${activeCategory}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [activeCategory]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    try {
      const response = await paymentHub.executePayment('mobile_money', {
        amount: total,
        currency: 'XOF',
        orderId: `ORD-${Date.now()}`,
        userId: 'user-123', 
        operator: 'wave',
      });
      if (response.url) window.location.href = response.url;
    } catch (e) {
      alert("Erreur lors du paiement");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Marketplace <span className="gradient-text">Souveraine</span>
          </h1>
          <p className="text-gray-400 font-medium">Commerce direct, traçabilité absolue.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit, une coopérative..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-navy-900 border border-white/10 text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {(Object.keys(CATEGORIES) as Category[]).map((cat) => {
          const { icon: Icon, label, color } = CATEGORIES[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap border ${
                activeCategory === cat 
                ? "bg-primary-500 border-primary-400 text-white shadow-glow" 
                : "bg-navy-900 border-white/10 text-gray-400 hover:border-primary-500/50"
              }`}
            >
              <Icon className={`w-5 h-5 ${activeCategory === cat ? "text-white" : color}`} />
              <span className="font-bold text-sm">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mb-4" 
              />
              <p className="font-medium">Chargement des produits...</p>
            </div>
          ) : (
            <>
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  className="card-premium p-6 bg-navy-900/50 border-white/5 backdrop-blur-md group"
                >
                  <div className="relative aspect-square rounded-2xl bg-navy-800 mb-6 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-navy-700">
                      <Leaf className="w-20 h-20" />
                    </div>
                    {product.ndvi && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold flex items-center gap-1">
                        <ActivityIcon className="w-3 h-3 text-emerald-400" /> NDVI: {product.ndvi}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-white text-lg group-hover:text-primary-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="px-2 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-[10px] font-bold">
                      {product.unit}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {product.seller?.name || product.seller}
                  </p>

                  <div className="flex items-center justify-between mt-6">
                    <div>
                      <span className="text-2xl font-display font-extrabold text-white">{product.price}</span>
                      <span className="text-xs text-gray-500 ml-1">FCFA</span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="p-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-lg active:scale-90"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                  <p className="text-xl font-medium">Aucun produit trouvé.</p>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="card-premium p-4 bg-primary-600 text-white shadow-glow-lg flex items-center gap-6 px-8 py-4 rounded-full">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-bold">{cart.reduce((a, b) => a + b.quantity, 0)} articles</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <button 
              onClick={handleCheckout}
              className="bg-white text-primary-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-all"
            >
              Payer {cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString()} FCFA
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
