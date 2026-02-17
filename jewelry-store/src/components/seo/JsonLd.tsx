/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * JSON-LD structured data components for SEO.
 * Follows schema.org specifications for Product, Organization, BreadcrumbList, etc.
 */

/**
 * Product JSON-LD — renders schema.org/Product markup on product pages.
 */
export function ProductJsonLd({
  product,
  url,
}: {
  product: any;
  url: string;
}) {
  const allImageUrls = (product.images || []).map((img: any) => img.url);

  const categoryName =
    typeof product.category === "object" && product.category
      ? product.category.name
      : "";

  // Build material description from composition
  const materials: string[] = [];
  product.metalComposition?.forEach((entry: any) => {
    materials.push(entry.variantName || "Metal");
  });
  product.gemstoneComposition?.forEach((entry: any) => {
    materials.push(entry.variantName || "Gemstone");
  });

  const availability = product.inStock
    ? "https://schema.org/InStock"
    : product.madeToOrder
      ? "https://schema.org/PreOrder"
      : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.shortDescription || product.description?.slice(0, 300),
    image: allImageUrls.length > 0 ? allImageUrls : undefined,
    sku: product.sku,
    url,
    brand: {
      "@type": "Brand",
      name: "Lumière Jewels",
    },
    category: categoryName || "Jewelry",
    material: materials.length > 0 ? materials.join(", ") : undefined,
    weight:
      product.totalWeightGrams > 0
        ? {
            "@type": "QuantitativeValue",
            value: product.totalWeightGrams,
            unitCode: "GRM",
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.finalPrice,
      availability,
      priceValidUntil: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split("T")[0];
      })(),
      seller: {
        "@type": "Organization",
        name: "Lumière Jewels",
      },
      ...(product.returnPolicy && {
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "IN",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: parseInt(product.returnPolicy) || 15,
        },
      }),
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: product.deliveryDays || 7,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
    ...(product.certification && {
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Certification",
          value: product.certification,
        },
      ],
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Organization JSON-LD — renders schema.org/Organization markup.
 * Place on the homepage or root layout.
 */
export function OrganizationJsonLd({
  url,
}: {
  url: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lumière Jewels",
    url,
    logo: `${url}/logo.png`,
    description:
      "Exquisite handcrafted jewelry with transparent pricing and certified gemstones.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * JewelryStore JSON-LD — renders schema.org/JewelryStore markup.
 */
export function JewelryStoreJsonLd({ url }: { url: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: "Lumière Jewels",
    url,
    description:
      "Discover exquisite handcrafted jewelry — from dazzling diamond rings to elegant gold necklaces.",
    priceRange: "₹₹₹",
    image: `${url}/logo.png`,
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * BreadcrumbList JSON-LD
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * CollectionPage JSON-LD — for category or product listing pages.
 */
export function CollectionPageJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Lumière Jewels",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * WebSite JSON-LD with SearchAction — for sitelinks search box in Google.
 */
export function WebSiteJsonLd({ url }: { url: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lumière Jewels",
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
