"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Zap, ShieldCheck, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma"; // This is a client component, so I'll actually need a server action or API route

/**
 * NexusFeed: Visual timeline of the Autonomous AI's decisions.
 * This component displays the 'reasoning' and 'actions' of the SNC.
 */
export default function NexusFeed({ evolutions = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400">
          <Bot className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-lg text-white">Nexus Autonomous Feed</h3>
      </div>

      <div className="relative border-l-2 border-primary-500/30 ml-3 space-y-8">
        {evolutions.length === 0 ? (
          <div className="pl-6 text-sm text-gray-500 font-medium italic">
            Le Nexus analyse actuellement le système... aucune évolution majeure détectée.
          </div>
        ) : (
          evolutions.map((evo: any, i: number) => (
            <motion.div 
              key={evo.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-8"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-navy-950 border-2 border-primary-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              
              <div className="card-premium p-5 bg-navy-900/50 border-white/5 backdrop-blur-md group hover:border-primary-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      evo.trigger === 'CROP_STRESS' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {evo.trigger}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{new Date(evo.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" /> ANCHORED
                  </div>
                </div>
                
                <p className="text-sm font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {evo.actionTaken}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed italic mb-3">
                  "{evo.reasoning}"
                </p>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <Activity className="w-3 h-3" /> Impact: {evo.expectedImpact}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
