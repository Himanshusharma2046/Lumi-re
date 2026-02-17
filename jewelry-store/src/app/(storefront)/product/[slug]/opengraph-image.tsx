import { ImageResponse } from "next/og";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

/* eslint-disable @next/next/no-img-element */

export const runtime = "nodejs";
export const alt = "Product Image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Revalidate OG images alongside the page
export const revalidate = 60;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await dbConnect();

  const product = await Product.findOne({ slug, isActive: true })
    .select("name finalPrice calculatedPrice discount images category shortDescription")
    .populate("category", "name")
    .lean();

  if (!product) {
    // Fallback OG image
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 48, color: "#d4a853", fontWeight: 700 }}>
              Lumière Jewels
            </div>
            <div style={{ fontSize: 24, color: "#999", marginTop: 8 }}>
              Product Not Found
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const hasDiscount =
    product.discount &&
    product.discount.value > 0 &&
    product.finalPrice < product.calculatedPrice;

  const categoryName =
    typeof product.category === "object" && product.category
      ? (product.category as unknown as { name: string }).name
      : "";

  const productImage = product.images?.[0]?.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #d4a853 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Gold accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #d4a853, #f0d78c, #d4a853)",
          }}
        />

        {/* Left: Product Image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 480,
            height: "100%",
            padding: 40,
          }}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              width={400}
              height={400}
              style={{
                objectFit: "cover",
                borderRadius: 20,
                border: "2px solid rgba(212, 168, 83, 0.3)",
              }}
            />
          ) : (
            <div
              style={{
                width: 400,
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                background:
                  "linear-gradient(135deg, rgba(212,168,83,0.1), rgba(212,168,83,0.05))",
                border: "2px solid rgba(212,168,83,0.2)",
                fontSize: 64,
                color: "rgba(212,168,83,0.3)",
              }}
            >
              ✦
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "40px 48px 40px 0",
          }}
        >
          {/* Category badge */}
          {categoryName && (
            <div
              style={{
                display: "flex",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: "#d4a853",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontWeight: 600,
                }}
              >
                {categoryName}
              </span>
            </div>
          )}

          {/* Product Name */}
          <div
            style={{
              fontSize: product.name.length > 40 ? 32 : 40,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: 16,
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <div
              style={{
                fontSize: 16,
                color: "#9ca3af",
                lineHeight: 1.5,
                marginBottom: 24,
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.shortDescription.slice(0, 100)}
            </div>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#d4a853",
              }}
            >
              {formatPrice(product.finalPrice)}
            </span>
            {hasDiscount && (
              <span
                style={{
                  fontSize: 22,
                  color: "#6b7280",
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(product.calculatedPrice)}
              </span>
            )}
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <div style={{ display: "flex", marginTop: 12 }}>
              <span
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 8,
                }}
              >
                Save{" "}
                {product.discount!.type === "percentage"
                  ? `${product.discount!.value}%`
                  : formatPrice(product.discount!.value)}
              </span>
            </div>
          )}

          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#d4a853",
                letterSpacing: "0.05em",
              }}
            >
              ✦ Lumière Jewels
            </span>
            <span style={{ fontSize: 14, color: "#6b7280", marginLeft: 8 }}>
              Exquisite Handcrafted Jewelry
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
