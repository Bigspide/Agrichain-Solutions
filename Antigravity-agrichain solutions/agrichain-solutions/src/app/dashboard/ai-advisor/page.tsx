"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Camera,
  Leaf,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  ThumbsUp,
  TrendingUp,
  User,
  Volume2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  { text: "Analyse le rendement cacao de cette saison", icon: Leaf },
  { text: "Compare les prix du marche pour le cacao et le cajou", icon: TrendingUp },
  { text: "Aide-moi a identifier une maladie sur une feuille", icon: AlertTriangle },
  { text: "Resume les risques logistiques de mes commandes", icon: BarChart3 },
];

function fallbackAnswer(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("cacao") || lower.includes("rendement")) {
    return "Analyse locale: surveillez humidite, ombrage, fermentation, maladies et prix spot avant vente. Connectez les donnees ferme et les lots traces pour une recommandation precise.";
  }
  if (lower.includes("prix") || lower.includes("marche")) {
    return "Analyse marche: comparez le prix avec certification, volume, qualite, origine et cout logistique. Les ordres recents et le wallet donnent le prix net reel.";
  }
  if (lower.includes("maladie") || lower.includes("feuille")) {
    return "Analyse sanitaire: ajoutez une photo nette, la culture, la region et les symptomes. En attendant, isolez la parcelle et evitez tout traitement non identifie.";
  }
  return "AGRI a recu votre demande. Je peux croiser ferme, marketplace, commandes, wallet, tracabilite et logistique pour produire une recommandation exploitable.";
}

function speechLocale(locale: string) {
  if (locale === "en") return "en-US";
  if (locale === "es") return "es-ES";
  if (locale === "pt") return "pt-PT";
  if (locale === "ar") return "ar-SA";
  if (locale === "zh") return "zh-CN";
  return "fr-FR";
}

export default function AIAdvisorPage() {
  const { t, locale } = useI18n();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Je suis AGRI, votre conseiller agricole multilingue. Posez une question, dictez une demande, demandez une narration ou ajoutez une photo a analyser.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    const userMessage: ChatMessage = { id: `user_${Date.now()}`, role: "user", content: cleanText };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          conversationId,
          messages: nextMessages
            .filter((message) => message.id !== "welcome")
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) throw new Error("AI request failed");
      const payload = (await response.json()) as { message?: string; conversationId?: string };
      if (payload.conversationId) setConversationId(payload.conversationId);
      setMessages((current) => [
        ...current,
        { id: `assistant_${Date.now()}`, role: "assistant", content: payload.message || fallbackAnswer(cleanText) },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: `assistant_${Date.now()}`, role: "assistant", content: fallbackAnswer(cleanText) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInput("La dictee vocale n'est pas disponible dans ce navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLocale(locale);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setInput(transcript);
    };
    recognition.start();
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`|]/g, ""));
    utterance.lang = speechLocale(locale);
    window.speechSynthesis.speak(utterance);
  };

  const handleImage = async (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("altText", `Image IA ${file.name}`);
    try {
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const payload = (await response.json()) as { url?: string };
      await sendMessage(`Analyse cette image agricole: ${payload.url || file.name}`);
    } catch {
      await sendMessage(`Analyse cette image agricole: ${file.name}`);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-6">
      {/* Header de l'Assistant */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-gray-100 pb-6 dark:border-gray-800"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/10">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">{t("ai.title")}</h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-xs font-medium text-gray-500">{t("ai.subtitle")} • Intelligence Agricole Avancée</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Zone de Conversation */}
      <div className="flex-1 space-y-6 overflow-y-auto py-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" && (
                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-md text-white">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={`max-w-2xl relative group ${
                  message.role === "user"
                    ? "rounded-2xl rounded-tr-md bg-primary-600 px-5 py-3 text-white shadow-lg"
                    : "rounded-2xl rounded-tl-md glass px-5 py-4 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                {message.role === "assistant" && (
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                    <button
                      type="button"
                      className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-400 hover:text-primary-600"
                      aria-label="Bonne reponse"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => speak(message.content)}
                      className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-400 hover:text-primary-600"
                      aria-label="Lire la reponse"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-md text-white">
                  <User className="h-5 w-5" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-md glass px-5 py-4 border border-gray-100 dark:border-gray-800">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Grid */}
      {messages.length <= 2 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.text}
                type="button"
                onClick={() => sendMessage(suggestion.text)}
                className="flex items-center gap-3 whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition-all hover:border-primary-500 hover:text-primary-600 hover:shadow-md dark:border-gray-700 dark:bg-navy-800 dark:text-gray-400"
              >
                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-navy-700 text-primary-600">
                  <Icon className="h-4 w-4" />
                </div>
                {suggestion.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Input Area - Premium Edition */}
      <div className="relative bg-gray-50 dark:bg-navy-950/50 p-4 rounded-3xl border border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleImage(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl p-3 transition-all hover:bg-white dark:hover:bg-navy-800 text-gray-400 hover:text-primary-600 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            aria-label="Ajouter une image"
          >
            <Camera className="h-5 w-5" />
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("ai.placeholder")}
              className="input-premium w-full pl-5 pr-12 py-3.5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={startDictation}
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 transition-all ${
                isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800"
              }`}
              aria-label="Dicter une demande"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-premium p-3.5 shadow-lg shadow-primary-500/30 disabled:opacity-50"
            aria-label="Envoyer"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
