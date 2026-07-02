"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Package, Truck, DollarSign, Star,
  ShoppingBag, Bot, QrCode, Plus, Eye,
  Cloud, Droplets, Wind, Thermometer,
  Activity as ActivityIcon, Bell, ChevronRight, Sparkles
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store";
import dynamic from "next/dynamic";
import FinancialCockpit from "@/components/dashboard/FinancialCockpit";
import NexusFeed from "@/components/dashboard/NexusFeed";
import type { Activity, ChartDataPoint, DashboardStats, WeatherData } from "@/types";

const FieldDigitalTwin = dynamic(() => import("@/components/three/FieldDigitalTwin"), { ssr: false });

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const formatted = display >= 1000000
    ? `${(display / 1000000).toFixed(1)}M`
    : display >= 1000
    ? `${(display / 1000).toFixed(0)}K`
    : display.toLocaleString();

  return <span>{prefix}{formatted}{suffix}</span>;
}

const COLORS = ["#059669", "#facc15", "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() { return (<div>Dashboard placeholder</div>);
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<{
    stats: DashboardStats;
    revenueData: ChartDataPoint[];
    ordersData: ChartDataPoint[];
    categoryData: ChartDataPoint[];
    activities: Activity[];
    weather: WeatherData;
    nexusEvolutions: any[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setSummary(data);
      })
      .catch(() => setSummary(null));
  }, []);

  const stats = summary?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingDeliveries: 0,
    customerCount: 0,
    rating: 0,
    revenueChange: 0,
    ordersChange: 0,
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
              Elite Command Center
            </h1>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            Bienvenue, <span className="text-white font-bold">{user?.name}</span>. Le Nexus surveille votre empire.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/marketplace" className="btn-premium text-sm px-6 py-3">
            <Plus className="w-4 h-4" /> Nouveau Produit
          </Link>
        </div>
      </motion.div>

      {/* 1. Financial Cockpit - Top Tier */}
      <FinancialCockpit 
        balance={stats.totalRevenue} 
        prestige={user?.prestigeLevel || "bronze"}
        impactScore={user?.impactScore || 0}
        agriTokenBalance={user?.agriTokenBalance || 0}
      />

      {/* 2. Central Command Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Control Center (Visuals & Intel) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 3D Digital Twin Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 z-20 px-4 py-2 rounded-full bg-navy-950/80 backdrop-blur-md border border-primary-500/30 text-primary-400 text-xs font-bold flex items-center gap-2">
              <ActivityIcon className="w-3 h-3" /> LIVE SPECTRAL FEED
            </div>
            <FieldDigitalTwin fields={[
              {
                id: '1',
                name: 'Nord-Est',
                ndvi: 0.82,
                cropType: 'maize',
                growthStage: 'vegetative',
                fieldSize: 2.5
              },
              {
                id: '2',
                name: 'Secteur Sud',
                ndvi: 0.41,
                cropType: 'sorghum',
                growthStage: 'flowering',
                fieldSize: 1.8
              },
              {
                id: '3',
                name: 'Bassin Ouest',
                ndvi: 0.12,
                cropType: 'cassava',
                growthStage: 'planting',
                fieldSize: 3.2
              },
              {
                id: '4',
                name: 'Plateau Central',
                ndvi: 0.65,
                cropType: 'yam',
                growthStage: 'ripening',
                fieldSize: 1.5
              },
            ]} />
          </motion.div>

          {/* Intelligence Row: Charts & Metrics */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-8 bg-navy-900/30 border-white/5 backdrop-blur-md"
            >
              <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" /> Flux Financier
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary?.revenueData || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-8 bg-navy-900/30 border-white/5 backdrop-blur-md"
            >
              <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-400" /> Performance Ventes
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.ordersData || []}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="value2" fill="#facc15" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Yield Prediction Section */}
          <div className="lg:col-span-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-6 bg-navy-900/30 border-white/5 backdrop-blur-md"
            >
              <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" /> Prédiction de Rendement par Champ
              </h3>
              <div className="space-y-4">
                {[{
                  field: "Nord-Est",
                  yield: 4200,
                  change: "+12%",
                  trend: "up"
                }, {
                  field: "Secteur Sud",
                  yield: 2800,
                  change: "-5%",
                  trend: "down"
                }, {
                  field: "Bassin Ouest",
                  yield: 1800,
                  change: "+22%",
                  trend: "up"
                }, {
                  field: "Plateau Central",
                  yield: 5200,
                  change: "+8%",
                  trend: "up"
                }].map((item, index) => (
                  <div key={index} className="flex items-center justify-between px-4 py-3 bg-black/50 rounded-lg">
                    <div className="flex-1 space-x-3">
                      <div className="font-medium text-white">{item.field}</div>
                      <div className="text-sm text-gray-400">{item.yield} kg/ha</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`${item.trend === 'up' ? 'text-green-500' : 'text-red-500'} font-medium`}>
                        {item.change}
                      </span>
                      <div className="w-2 h-2 rounded-full">{item.trend === 'up' ? '▲' : '▼'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        {/* Right Column: The Intelligence Stream */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium p-8 bg-navy-900/50 border-primary-500/20 backdrop-blur-xl"
          >
            <NexusFeed evolutions={summary?.nexusEvolutions || []} />
          </motion.div>

          {/* Weather Intel - Compact */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium p-6 bg-gradient-to-br from-blue-600/20 to-navy-900 border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
                <Cloud className="w-4 h-4" /> Satellite Weather
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Live Update</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-display font-extrabold text-white">
                {summary?.weather?.temperature || 0}°
              </span>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{summary?.weather?.location || "CI"}</p>
                <p className="text-xs text-gray-400">{summary?.weather?.condition || "Stable"}</p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Right Column: The Intelligence Stream */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium p-8 bg-navy-900/50 border-primary-500/20 backdrop-blur-xl"
          >
            <NexusFeed evolutions={summary?.nexusEvolutions || []} />
          </motion.div>

          {/* Weather Intel - Compact */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium p-6 bg-gradient-to-br from-blue-600/20 to-navy-900 border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
                <Cloud className="w-4 h-4" /> Satellite Weather
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Live Update</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-display font-extrabold text-white">
                {summary?.weather?.temperature || 0}°
              </span>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{summary?.weather?.location || "CI"}</p>
                <p className="text-xs text-gray-400">{summary?.weather?.condition || "Stable"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
