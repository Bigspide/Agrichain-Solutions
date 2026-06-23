import React from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLdWrapper({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization structured data
export function OrganizationData() {
  return (
    <JsonLdWrapper data={{
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AgriChain Solutions",
      url: "https://agrichain-solutions.example.com",
      logo: "https://agrichain-solutions.example.com/logo.png",
      description: "Plateforme intelligente de traçabilité et de commerce agricole en Afrique de l'Ouest",
      email: "info@agrichain-solutions.example.com",
      telephone: "+225 XX XX XX XX",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Abidjan, Côte d'Ivoire",
        addressLocality: "Abidjan",
        addressRegion: "",
        postalCode: "",
        addressCountry: "CI",
      },
      sameAs: [
        "https://facebook.com/agrichain",
        "https://twitter.com/agrichain",
        "https://instagram.com/agrichain",
        "https://linkedin.com/company/agrichain"
      ],
      contactPoint: [{
        "@type": "ContactPoint",
        telephone: "+225 XX XX XX XX",
        contactType: "Customer Service",
        language: "fr"
      }]
    }} />
  );
}

// Website structured data
export function WebsiteData() {
  return (
    <JsonLdWrapper data={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "AgriChain Solutions",
      url: "https://agrichain-solutions.example.com",
      potentialAction: [{
        "@type": "SearchAction",
        target: "https://agrichain-solutions.example.com/search?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }]
    }} />
  );
}

// Breadcrumb structured data
export function BreadcrumbData({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <JsonLdWrapper data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: item.href,
      })),
    }} />
  );
}

// Product structured data
export function ProductData({ product }: { product: any }) {
  return (
    <JsonLdWrapper data={{
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.images?.[0] || "",
      description: product.description,
      sku: product.id,
      brand: {
        "@type": "Brand",
        name: product.sellerName || ""
      },
      offers: {
        "@type": "Offer",
        url: `https://agrichain-solutions.example.com/product/${product.id}`,
        priceCurrency: product.currency || "XOF",
        price: product.price,
        priceValidUntil: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: product.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      review: {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: product.rating || 0,
          bestRating: 5
        },
        author: {
          "@type": "Person",
          name: ""
        }
      }
    }} />
  );
}

export default JsonLdWrapper;
