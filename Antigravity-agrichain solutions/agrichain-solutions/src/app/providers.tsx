import React from "react";
import { SessionProvider } from "next-auth/react";
import { ActivityProvider } from "@/components/providers/ActivityProvider";
import { VoiceProvider } from "@/components/providers/VoiceProvider";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "sonner";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { config, queryClient } from "@/lib/web3";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            <SessionProvider>
              <VoiceProvider>
                <ActivityProvider>
                  {children}
                  <Toaster position="top-right" richColors />
                </ActivityProvider>
              </VoiceProvider>
            </SessionProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
