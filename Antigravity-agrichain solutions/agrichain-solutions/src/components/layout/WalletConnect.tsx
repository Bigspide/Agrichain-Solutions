"use client";

import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ExternalLink } from "lucide-react";

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => connect({ connector: connectors[0] })}
        className="btn-secondary px-4 py-2 rounded-xl border-white/20 text-white hover:bg-white/10 backdrop-blur-md flex items-center gap-2 text-sm font-medium"
      >
        <WalletIcon className="w-4 h-4 text-primary-400" />
        Connect Wallet
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-mono text-primary-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>
      <button
        onClick={() => disconnect()}
        className="text-xs text-gray-400 hover:text-white transition-colors"
      >
        Disconnect
      </button>
    </motion.div>
  );
}
