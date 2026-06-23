"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";

interface VoiceContextType {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string, locale: string) => Promise<void>;
  transcript: string;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // 1. Speech-to-Text (STT) using Web Speech API (or Whisper integration)
  const startListening = async () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = locale;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = false;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event: any) => console.error("Voice error:", event.error);
    
    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // 2. Text-to-Speech (TTS) for narration
  const speak = async (text: string, targetLocale: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("TTS not supported");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLocale;
    utterance.rate = 0.9; // slightly slower for better clarity
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <VoiceContext.Provider value={{ isListening, startListening, stopListening, speak, transcript }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
}
