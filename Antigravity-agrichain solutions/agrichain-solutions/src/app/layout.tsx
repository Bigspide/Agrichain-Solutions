import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import Providers from "./providers";
import { OrganizationData, WebsiteData } from "@/components/StructuredData";

export async function generateMetadata({ params, searchParams }: { params: Promise<Record<string, string>>; searchParams: Promise<Record<string, string>>; }): Promise<Metadata> {
  const _resolvedParams = await params;
  const _resolvedSearchParams = await searchParams;

  // Default values
  const title = "AgriChain Solutions — La Chaîne Agricole du Futur";
  const description = "Plateforme intelligente de traçabilité et de commerce agricole en Afrique de l'Ouest. Connectez producteurs, coopératives et acheteurs.";
  const keywords = [
    "agriculture",
    "supply chain",
    "blockchain",
    "traceability",
    "West Africa",
    "Côte d'Ivoire",
    "marketplace",
    "agritech",
  ];

  // You can customize metadata based on route or search params here
  // For example:
  // if (resolvedParams.slug) {
  //   title = `Product: ${resolvedParams.slug} | AgriChain Solutions`;
  //   description = `Découvrez les détails du produit ${resolvedParams.slug} sur AgriChain`;
  // }

  return {
    title,
    description,
    keywords: [
      ...keywords,
      "agriculteurs",
      "coopératives",
      "négociants",
      "industrie agroalimentaire",
    ],
    openGraph: {
      title: {
        default: "AgriChain Solutions",
        template: "%s | AgriChain Solutions",
      },
      description: "La Chaîne Agricole du Futur - Traceabilité blockchain et intelligence artificielle pour l'agriculture africaine",
      type: "website",
      siteName: "AgriChain Solutions",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "AgriChain Solutions - Plateforme de traçabilité agricole",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: {
        default: "AgriChain Solutions",
        template: "%s | AgriChain Solutions",
      },
      description: "Plateforme intelligente de traçabilité et de commerce agricole en Afrique de l'Ouest",
      images: ["/logo.png"],
    },
    // Add alternative languages
    alternates: {
      languages: {
        en: "/en",
        fr: "/fr",
        es: "/es",
      },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-navy-950 text-gray-900 dark:text-gray-100 antialiased">
        <div className="noise-overlay" />
        {/* Skip to main content link */}
        <a href="#main-content" className="skip-link sr-only focus-not-hidden">
          Passer au contenu principal
        </a>
        {/* Structured Data for SEO */}
        <OrganizationData />
        <WebsiteData />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
