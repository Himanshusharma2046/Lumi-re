# Jewelry Website — Development Plan

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB Atlas (free tier) |
| ODM | Mongoose |
| Image Storage | Cloudflare R2 |
| Auth | NextAuth.js (credentials for admin) |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand (lightweight) |
| Deployment | Vercel (free tier) |
| SEO | Next.js Metadata API + JSON-LD |

---

## Database Schema Design

### 1. Metal

```
{
  name: "Gold",
  code: "GOLD",                    // unique identifier for queries
  color: "Yellow",                  // Yellow, White, Rose, Silver, Grey
  variants: [
    { name: "24K Gold", purity: 99.9, pricePerGram: 7500, unit: "gram", isActive: true },
    { name: "22K Gold", purity: 91.6, pricePerGram: 6900, unit: "gram", isActive: true },
    { name: "18K Gold", purity: 75.0, pricePerGram: 5625, unit: "gram", isActive: true },
    { name: "14K Gold", purity: 58.5, pricePerGram: 4400, unit: "gram", isActive: true }
  ],
  defaultWastagePercentage: 3,      // default wastage (can override per product)
  defaultMakingChargeType: "flat",   // default (can override per product)
  defaultMakingCharges: 500,         // per gram default
  isDeleted: false,                  // soft delete — never hard delete if products reference this
  updatedAt: Date
}
```

### 2. Gemstone

```
{
  name: "Diamond",
  type: "precious",                // "precious" | "semi-precious" | "organic" (pearl, coral)
  hardness: 10,                     // Mohs scale (for care instructions)
  variants: [
    {
      name: "Round Brilliant VVS1 D",   // human-readable label
      cut: "Round Brilliant",
      clarity: "VVS1",
      color: "D",
      shape: "Round",
      origin: "Natural",               // "Natural" | "Lab-Created" | "Treated"
      pricePerCarat: 500000,
      certification: "GIA",
      isActive: true
    },
    {
      name: "Princess VS2 G",
      cut: "Princess",
      clarity: "VS2",
      color: "G",
      shape: "Square",
      origin: "Natural",
      pricePerCarat: 280000,
      certification: "IGI",
      isActive: true
    }
  ],
  isDeleted: false,                  // soft delete
  updatedAt: Date
}
```

### 3. Category

```
{
  name: "Rings",
  slug: "rings",
  subcategories: ["Engagement Rings", "Wedding Bands", "Cocktail Rings", "Eternity Rings"],
  image: "url",
  displayOrder: 1
}
```

### 4. Product

Supports **any number of metals** (e.g., Gold + Platinum two-tone) and **any number of gemstones** (e.g., center Diamond + side Sapphires + accent Emeralds). Each composition entry is independent.

```
{
  name: "Royal Two-Tone Diamond & Sapphire Ring",
  slug: "royal-two-tone-diamond-sapphire-ring",
  sku: "JW-RNG-042",
  description: "...",
  shortDescription: "...",

  // Category
  category: ObjectId (ref: Category),
  subcategory: "Cocktail Rings",
  tags: ["bestseller", "new-arrival", "trending"],

  // ─── METAL COMPOSITION (1 or more entries) ───
  metalComposition: [
    {
      metal: ObjectId (ref: Metal),       // e.g., Gold
      variantName: "22K Gold",            // stored as string for clarity
      variantIndex: 1,                    // index into Metal.variants[]
      weightInGrams: 3.8,
      part: "Band",                       // which part of the jewelry (optional label)
      wastagePercentage: 3,               // per-metal wastage (can vary by metal)
      makingCharges: 2500,                // per-metal making charge
      makingChargeType: "flat",           // "flat" | "percentage"
    },
    {
      metal: ObjectId (ref: Metal),       // e.g., Platinum
      variantName: "950 Platinum",
      variantIndex: 0,
      weightInGrams: 1.2,
      part: "Setting / Prongs",
      wastagePercentage: 2,
      makingCharges: 4000,
      makingChargeType: "flat",
    }
  ],

  // ─── GEMSTONE COMPOSITION (0 or more entries) ───
  gemstoneComposition: [
    {
      gemstone: ObjectId (ref: Gemstone), // e.g., Diamond
      variantName: "Round Brilliant VVS1 D",
      variantIndex: 0,
      quantity: 1,                        // number of stones of this type
      totalCaratWeight: 0.75,             // total weight for this entry
      setting: "Prong",                   // Prong, Bezel, Channel, Pavé, Flush, etc.
      position: "Center Stone",           // Center / Side / Accent / Halo
      certification: "GIA",               // per-stone cert (optional)
      stoneCharges: 0,                    // any additional per-stone setting charge
    },
    {
      gemstone: ObjectId (ref: Gemstone), // e.g., Sapphire
      variantName: "Blue Sapphire Natural",
      variantIndex: 0,
      quantity: 6,
      totalCaratWeight: 0.90,             // 6 stones × 0.15ct each
      setting: "Channel",
      position: "Side Stones",
      certification: null,
      stoneCharges: 1500,
    },
    {
      gemstone: ObjectId (ref: Gemstone), // e.g., Diamond (small accents)
      variantName: "Round Brilliant VS2 G",
      variantIndex: 2,
      quantity: 12,
      totalCaratWeight: 0.36,             // 12 × 0.03ct
      setting: "Pavé",
      position: "Accent / Halo",
      certification: null,
      stoneCharges: 800,
    }
  ],

  // ─── ADDITIONAL CHARGES ───
  additionalCharges: [
    { label: "Rhodium Plating", amount: 500 },
    { label: "Engraving", amount: 300 },
    { label: "Gift Box & Certificate", amount: 200 }
  ],

  // ─── PRICING (auto-calculated) ───
  gstPercentage: 3,
  calculatedPrice: 0,          // auto-computed from all compositions + charges
  discount: { type: "percentage", value: 10 },
  finalPrice: 0,               // after discount

  // ─── PRODUCT DETAILS ───
  totalWeightGrams: 5.0,       // auto-summed from metalComposition weights
  totalCaratWeight: 2.01,      // auto-summed from gemstoneComposition carats
  size: ["6", "7", "8", "9"],
  customSizeAvailable: true,
  gender: "Women",
  occasion: ["Wedding", "Anniversary", "Engagement"],
  style: "Classic",
  certification: "BIS Hallmark",
  returnPolicy: "15-day return",
  deliveryDays: 7,

  // ─── IMAGES (Cloudflare R2) ───
  images: [
    { url: "https://r2.example.com/...", alt: "front view", isPrimary: true, displayOrder: 1 },
    { url: "https://r2.example.com/...", alt: "side view", isPrimary: false, displayOrder: 2 },
    { url: "https://r2.example.com/...", alt: "on hand", isPrimary: false, displayOrder: 3 }
  ],
  video: { url: "https://r2.example.com/...", alt: "360° view" },  // optional product video

  // ─── SEO ───
  metaTitle: "...",
  metaDescription: "...",

  // ─── STATUS ───
  isActive: true,
  isFeatured: false,
  inStock: true,
  madeToOrder: false,           // if true → no stock, made on demand

  createdAt: Date,
  updatedAt: Date
}
```

**Real-world composition examples this schema handles:**

| Product | Metals | Gemstones |
|---------|--------|-----------|
| Simple Gold Chain | 1× 22K Gold (25g) | None |
| Diamond Solitaire Ring | 1× 18K White Gold (3g) | 1× Diamond (1ct) |
| Two-Tone Band | 1× 22K Gold + 1× Rose Gold | None |
| Bridal Necklace Set | 1× 22K Gold (45g) | 3× Diamond (accent) + 5× Ruby (center) + 20× Emerald (border) |
| Platinum & Gold Bracelet | 1× Platinum + 1× 18K Gold | 8× Sapphire + 16× Diamond |
| Silver Gemstone Earrings | 1× 925 Sterling Silver | 2× Amethyst + 4× Topaz |
| Temple Mangalsutra | 1× 22K Gold + 1× Black Beads (non-metal component) | 1× Diamond pendant |
| Men's Signet Ring | 1× 18K Gold | None (or 1× Onyx) |
| Kundan Choker | 1× 24K Gold foil + 1× Lac filling | Multiple Kundan stones + Pearls |

### 5. Admin

```
{
  email: "admin@jewelry.com",
  passwordHash: "...",
  name: "Admin",
  role: "admin"
}
```

### 6. PriceHistory (for tracking price changes)

```
{
  entityType: "metal" | "gemstone",
  entityId: ObjectId,
  variantName: "22K Gold",
  oldPrice: 6800,
  newPrice: 6900,
  changedAt: Date,
  changedBy: ObjectId (ref: Admin)
}
```

---

## Project Structure

```
src/
├── app/
│   ├── (storefront)/              # Public site routes
│   │   ├── page.tsx               # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx           # All products (filters, search, sort)
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Single product page
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Category listing
│   │   └── layout.tsx             # Storefront layout (navbar + footer)
│   │
│   ├── admin/                     # Admin panel routes
│   │   ├── layout.tsx             # Admin layout (sidebar)
│   │   ├── page.tsx               # Dashboard
│   │   ├── login/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx           # List all products
│   │   │   ├── new/page.tsx       # Create product
│   │   │   └── [id]/edit/page.tsx # Edit product
│   │   ├── metals/
│   │   │   └── page.tsx           # Manage metals & prices
│   │   ├── gemstones/
│   │   │   └── page.tsx           # Manage gemstones & prices
│   │   ├── categories/
│   │   │   └── page.tsx           # Manage categories
│   │   └── price-update/
│   │       └── page.tsx           # Bulk price recalculate
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── products/route.ts      # GET (paginated, filtered) + POST
│   │   ├── products/[id]/route.ts # GET, PUT, DELETE
│   │   ├── metals/route.ts
│   │   ├── metals/[id]/route.ts
│   │   ├── gemstones/route.ts
│   │   ├── gemstones/[id]/route.ts
│   │   ├── categories/route.ts
│   │   ├── upload/route.ts        # Image upload to R2
│   │   ├── prices/recalculate/route.ts  # Recalculate all product prices
│   │   └── search/route.ts        # Search endpoint
│   │
│   ├── layout.tsx                 # Root layout
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── storefront/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ShareButton.tsx        # WhatsApp, copy link, etc.
│   │   ├── ImageGallery.tsx       # Product image zoom/carousel
│   │   ├── PriceBreakdown.tsx
│   │   ├── CategoryCarousel.tsx
│   │   └── NewsletterSignup.tsx
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── MetalForm.tsx
│   │   ├── GemstoneForm.tsx
│   │   ├── DataTable.tsx
│   │   ├── ImageUploader.tsx
│   │   └── PriceUpdatePanel.tsx
│   └── ui/                        # Reusable primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Skeleton.tsx
│       ├── Toast.tsx
│       └── Badge.tsx
│
├── lib/
│   ├── db.ts                      # MongoDB connection (cached)
│   ├── r2.ts                      # Cloudflare R2 client (S3-compatible)
│   ├── auth.ts                    # NextAuth config
│   ├── price-calculator.ts        # Price computation logic
│   ├── validators.ts              # Zod schemas for validation
│   └── utils.ts                   # Helpers (formatPrice, slugify, etc.)
│
├── models/
│   ├── Metal.ts
│   ├── Gemstone.ts
│   ├── Category.ts
│   ├── Product.ts
│   ├── Admin.ts
│   └── PriceHistory.ts
│
├── hooks/
│   ├── useProducts.ts             # SWR/React Query for product fetching
│   ├── useFilters.ts
│   ├── useDebounce.ts
│   └── useInfiniteScroll.ts
│
├── store/
│   └── filterStore.ts             # Zustand store for filters
│
├── types/
│   └── index.ts                   # All TypeScript interfaces
│
├── seed/
│   ├── metals.ts                  # Seed data for metals
│   ├── gemstones.ts               # Seed data for gemstones
│   ├── categories.ts              # Seed data for categories
│   └── index.ts                   # Seed runner
│
└── middleware.ts                   # Protect /admin routes
```

---

## Development Phases

### Phase 1 — Project Setup & Database (Day 1–2)

| # | Task | Details |
|---|------|---------|
| 1 | Init Next.js project | `npx create-next-app@latest --typescript --tailwind --app --src-dir` |
| 2 | Install deps | `mongoose`, `next-auth`, `zustand`, `framer-motion`, `@aws-sdk/client-s3` (for R2), `zod`, `sharp`, `lucide-react`, `swr` |
| 3 | Setup MongoDB connection | Singleton pattern in `lib/db.ts`, connection string in `.env.local` |
| 4 | Create all Mongoose models | Metal, Gemstone, Category, Product, Admin, PriceHistory |
| 5 | Setup Cloudflare R2 | Create bucket, generate API keys, configure S3-compatible client in `lib/r2.ts` |
| 6 | Write seed scripts | Populate metals (Gold 24K/22K/18K/14K, Silver 999/925, Platinum), gemstones (Diamond, Ruby, Emerald, Sapphire, Pearl, etc.), and categories |
| 7 | Run seeds | Verify data in MongoDB Atlas |

### Phase 2 — Auth & Admin Foundation (Day 3–4)

| # | Task | Details |
|---|------|---------|
| 1 | Setup NextAuth | Credentials provider, JWT strategy, admin-only login |
| 2 | Create middleware | Protect all `/admin/*` routes (redirect to login if unauthenticated) |
| 3 | Admin login page | Clean login form with validation |
| 4 | Admin layout | Sidebar navigation, top bar with admin name, responsive |
| 5 | Admin dashboard | Stats cards (total products, categories, last price update) |

### Phase 3 — Admin CRUD Operations (Day 5–8)

| # | Task | Details |
|---|------|---------|
| 1 | Metal management | List all metals → expand to see variants → edit price per gram → save → log to PriceHistory |
| 2 | Gemstone management | Same pattern: list, expand variants, edit prices |
| 3 | Category management | Add/edit/delete categories with subcategories and image |
| 4 | Image upload API | Upload to R2 via presigned URL or direct stream, return public URL |
| 5 | Product creation form | Multi-step form: Basic Info → Metal Composition → Gemstone Composition → Images → Pricing Preview → Publish |
| 6 | Product edit/delete | Edit existing product, toggle active/featured, delete with confirmation |
| 7 | Price recalculation | When metal/gemstone prices update → batch recalculate all affected products → show preview before saving |

**Product Form Fields (admin — multi-step):**

**Step 1 — Basic Info:**
- Name, SKU (auto-generate option), Short Description, Full Description (rich text)
- Category (dropdown) → Subcategory (dynamic based on category)
- Gender (Men / Women / Unisex / Kids)
- Occasion tags (multi-select: Wedding, Anniversary, Engagement, Daily Wear, Festival, Gift)
- Style (Classic, Modern, Traditional, Antique, Bohemian, Minimalist)
- BIS Hallmark / Certification
- Made to Order toggle, Custom Size Available toggle
- Delivery Days, Return Policy

**Step 2 — Metal Composition (dynamic add/remove rows, min 0):**
Each row:
- Select Metal (dropdown) → Select Variant (dynamic dropdown filtered by chosen metal)
- Weight in Grams (decimal input)
- Part Label (optional — e.g., "Band", "Setting", "Clasp")
- Wastage % (prefilled default, editable)
- Making Charges (₹ amount or % toggle)
- [+ Add Another Metal] button
- Live subtotal shown per row

**Step 3 — Gemstone Composition (dynamic add/remove rows, min 0):**
Each row:
- Select Gemstone (dropdown) → Select Variant (dynamic dropdown)
- Quantity (integer)
- Total Carat Weight (decimal)
- Setting Type (Prong / Bezel / Channel / Pavé / Flush / Tension / Invisible)
- Position (Center Stone / Side Stones / Accent / Halo / Border)
- Certification (optional text field)
- Stone Setting Charges (₹)
- [+ Add Another Gemstone] button
- Live subtotal shown per row

**Step 4 — Additional Charges & Pricing:**
- Additional Charges (dynamic rows: Label + ₹ Amount) — e.g., Rhodium Plating, Engraving, Packaging
- GST % (prefilled 3%, editable)
- Discount (type: percentage / flat, value)
- **Live Price Preview Panel** — shows full breakdown table updating in real-time as admin fills form

**Step 5 — Images & Media:**
- Drag & drop image upload (max 10), reorder, mark primary
- Optional product video upload (360° view)
- Alt text per image

**Step 6 — SEO & Publish:**
- Meta Title (auto-generated from name, editable)
- Meta Description (auto-generated from short desc + metals + gemstones, editable)
- Featured / Active toggles
- **Review full product card preview** before publishing

**Validation:** Product must have at least 1 metal OR 1 gemstone. At least 1 image required. SKU must be unique.

### Phase 4 — Storefront UI (Day 9–14)

| # | Task | Details |
|---|------|---------|
| 1 | Root layout | Font loading (Playfair Display + Inter), global styles, metadata |
| 2 | Navbar | Logo, category mega-menu, search bar, mobile hamburger |
| 3 | Homepage | Hero banner (full-bleed with parallax), Featured Products carousel, Shop by Category grid, Trending section, Trust badges, Newsletter |
| 4 | Products listing page | Grid view, FilterSidebar (category, metal, gemstone, price range, gender, occasion), sort (price, newest, popular), search bar with debounce, **infinite scroll or paginated** |
| 5 | Single product page | Image gallery with zoom, price breakdown table, metal/gemstone details, size selector, share buttons (WhatsApp, copy link), related products, breadcrumbs |
| 6 | Category page | Filtered product listing for specific category |
| 7 | Footer | Links, contact info, social media, trust badges |
| 8 | Share feature | WhatsApp: `https://wa.me/?text=Check out: {productUrl}`, Copy link, native share API |

### Phase 5 — Performance & SEO (Day 15–16)

| # | Task | Details |
|---|------|---------|
| 1 | Image optimization | Use `next/image` with R2 URLs, configure `remotePatterns`, serve WebP |
| 2 | Static generation | Use `generateStaticParams` for product pages where possible |
| 3 | Dynamic OG images | Generate OG images with product photo + price for social sharing |
| 4 | JSON-LD | Add Product schema markup on product pages |
| 5 | Sitemap | Auto-generate `sitemap.xml` from all products |
| 6 | Robots.txt | Proper configuration |
| 7 | Metadata | Dynamic `<title>`, `<meta description>` per page |
| 8 | Loading states | Skeleton loaders for every data-fetching component |
| 9 | Pagination API | Cursor-based pagination for 2000+ products, MongoDB indexes on `category`, `slug`, `isActive`, `calculatedPrice` |

### Phase 6 — Polish & Deploy (Day 17–19)

| # | Task | Details |
|---|------|---------|
| 1 | Responsive testing | Mobile, tablet, desktop breakpoints |
| 2 | Animations | Framer Motion: page transitions, card hover effects, scroll reveals |
| 3 | Error handling | Global error boundary, 404 page, API error responses |
| 4 | Environment variables | `.env.local` → Vercel env vars |
| 5 | Deploy to Vercel | Connect GitHub repo, set env vars, deploy |
| 6 | Custom domain | Configure if available |
| 7 | Monitor | Vercel Analytics (free tier) |

---

## Price Calculation Logic (Multi-Composition)

Since a product can have **multiple metals** and **multiple gemstones**, each with their own wastage and making charges, the calculation iterates per entry:

```
For each product:

─── STEP 1: Calculate metal costs (per metal entry) ───
totalMetalCost = 0
totalMakingCharges = 0
totalWastageCost = 0

for each entry in metalComposition:
    rawMetalCost = metal.variant.pricePerGram × entry.weightInGrams
    wastageCost  = rawMetalCost × (entry.wastagePercentage / 100)
    
    if entry.makingChargeType === "flat":
        makingCost = entry.makingCharges
    else:  // percentage
        makingCost = rawMetalCost × (entry.makingCharges / 100)
    
    totalMetalCost    += rawMetalCost
    totalWastageCost  += wastageCost
    totalMakingCharges += makingCost

─── STEP 2: Calculate gemstone costs (per gemstone entry) ───
totalGemstoneCost = 0
totalStoneCharges = 0

for each entry in gemstoneComposition:
    gemCost = gemstone.variant.pricePerCarat × entry.totalCaratWeight
    totalGemstoneCost += gemCost
    totalStoneCharges += entry.stoneCharges  // setting/mounting charges

─── STEP 3: Additional charges ───
totalAdditionalCharges = Σ (charge.amount) for each additionalCharges entry

─── STEP 4: Subtotal ───
subtotal = totalMetalCost + totalWastageCost + totalMakingCharges
         + totalGemstoneCost + totalStoneCharges
         + totalAdditionalCharges

─── STEP 5: Tax ───
gst = subtotal × (gstPercentage / 100)
calculatedPrice = subtotal + gst

─── STEP 6: Discount ───
if discount:
    if discount.type === "percentage":
        finalPrice = calculatedPrice - (calculatedPrice × discount.value / 100)
    else: // flat discount
        finalPrice = calculatedPrice - discount.value
else:
    finalPrice = calculatedPrice
```

**Price Breakdown (shown to customer on product page):**

```
┌─────────────────────────────────────┐
│ 22K Gold (3.8g)        ₹26,220     │
│   Wastage (3%)          ₹786       │
│   Making Charges        ₹2,500     │
│ 950 Platinum (1.2g)    ₹4,800      │
│   Wastage (2%)          ₹96        │
│   Making Charges        ₹4,000     │
├─────────────────────────────────────┤
│ Diamond 0.75ct (VVS1)  ₹3,75,000  │
│ Blue Sapphire 0.90ct   ₹45,000    │
│   Setting Charges       ₹1,500    │
│ Diamond Accents 0.36ct ₹18,000    │
│   Setting Charges       ₹800      │
├─────────────────────────────────────┤
│ Rhodium Plating         ₹500      │
│ Engraving               ₹300      │
│ Gift Box & Certificate  ₹200      │
├─────────────────────────────────────┤
│ Subtotal               ₹4,79,702  │
│ GST (3%)               ₹14,391    │
│ Total                  ₹4,94,093  │
│ Discount (10%)        -₹49,409    │
│ ─────────────────────────────────  │
│ FINAL PRICE            ₹4,44,684  │
└─────────────────────────────────────┘
```

**When admin updates a metal or gemstone price:**
1. Find all products that reference the updated metal/gemstone ID
2. Batch recalculate `calculatedPrice` and `finalPrice` for each affected product
3. Show admin a preview: "142 products will be updated. Total price change: ₹-2,50,000 to +₹3,80,000"
4. Admin confirms → save all + log to PriceHistory
5. ISR cache revalidates on next request

---

## Edge Cases & Validation Rules

### Composition Edge Cases

| # | Edge Case | How We Handle It |
|---|-----------|------------------|
| 1 | **Metal-only product** (plain gold chain) | `gemstoneComposition` array is empty `[]` — schema allows 0 gemstones |
| 2 | **Gemstone-only product** (loose diamond) | `metalComposition` array is empty `[]` — rare but supported |
| 3 | **Multi-metal product** (two-tone gold + platinum ring) | Multiple entries in `metalComposition[]`, each with own weight, wastage, making charge |
| 4 | **Same metal, different variants** (18K white gold band + 22K yellow gold prongs) | Two entries in `metalComposition[]` referencing same Metal doc but different `variantIndex` |
| 5 | **Same gemstone, different roles** (1ct center diamond + 12× 0.03ct accent diamonds) | Two entries in `gemstoneComposition[]` referencing same Gemstone doc but different `variantIndex`, quantity, position |
| 6 | **Multi-gemstone product** (diamond + ruby + emerald navaratna ring) | Multiple entries in `gemstoneComposition[]` — up to 9 for navaratna |
| 7 | **No making charge on certain metals** | Set `makingCharges: 0` on that specific metal entry |
| 8 | **Different wastage per metal** | Each metal entry has its own `wastagePercentage` — platinum 2%, gold 3%, silver 5% etc. |
| 9 | **Non-precious components** (black beads in mangalsutra, thread, lac in kundan) | Create a special Metal entry with `name: "Black Beads"`, `pricePerGram: 0` or small amount, track weight |
| 10 | **Certified vs uncertified stones** | `certification` field per gemstone entry — null if uncertified, "GIA"/"IGI" etc. if certified |

### Pricing Edge Cases

| # | Edge Case | How We Handle It |
|---|-----------|------------------|
| 1 | **Metal price becomes 0** (admin error) | Zod validation: `pricePerGram` must be > 0. Block save. |
| 2 | **Negative price after discount** | Validation: `finalPrice` floor at ₹0. If discount > price → set to ₹0 + flag for admin review |
| 3 | **Discount > 100%** | Validation: percentage discount capped at 100% |
| 4 | **Price overflow for heavy gold items** | Use `Number` (JS safe up to ~9 quadrillion) — sufficient. For display, `Intl.NumberFormat('en-IN')` |
| 5 | **Admin deletes a metal that products reference** | Soft-delete metals (add `isDeleted` flag). Block hard delete if products reference it. Show warning: "12 products use 22K Gold" |
| 6 | **Admin deletes a gemstone variant** | Same soft-delete approach. Prevent orphaned references. |
| 7 | **Bulk price update timeout** (2000+ products) | Batch updates in chunks of 100 with `bulkWrite()`. Use Vercel background function or queue if > 10s |
| 8 | **Concurrent price updates** | Use MongoDB `$set` with `updatedAt` check (optimistic concurrency). Last write wins with audit trail in PriceHistory |

### Product Data Edge Cases

| # | Edge Case | How We Handle It |
|---|-----------|------------------|
| 1 | **No images uploaded** | Validation: at least 1 image required. Show placeholder in UI if somehow missing. |
| 2 | **Duplicate SKU** | MongoDB unique index on `sku`. API returns 409 conflict. |
| 3 | **Duplicate slug** | Auto-generate slug from name. If collision → append `-2`, `-3`, etc. |
| 4 | **Product with no size** (necklaces, earrings) | `size` array can be empty. UI hides size selector. |
| 5 | **Very long product name** | Max 200 chars. Truncate in cards with `...`, full name on detail page. |
| 6 | **Product without category** | Validation: category is required. |
| 7 | **Category deleted with products inside** | Block deletion: "Cannot delete — 45 products are in this category. Reassign first." |
| 8 | **Fractional weight** (0.3g gold nose pin) | `weightInGrams` supports decimals. Display up to 2 decimal places. |
| 9 | **Zero-weight metal** (gold plated only) | Allow `weightInGrams: 0` with `makingCharges` > 0 to capture plating cost |
| 10 | **Made-to-order items** | `madeToOrder: true` — no stock tracking, show "Made to Order (7-15 days)" instead of "In Stock" |
| 11 | **Product video** | Optional `video` field. If present, show in gallery carousel alongside images. |
| 12 | **Custom size request** | `customSizeAvailable: true` flag — show "Contact for custom size" on product page |

### Admin & Upload Edge Cases

| # | Edge Case | How We Handle It |
|---|-----------|------------------|
| 1 | **Image upload fails mid-way** | Retry logic (3 attempts). Show error toast. Don't save product without successful uploads. |
| 2 | **Very large image** (10MB+) | Client-side compression with `sharp` before upload. Max 5MB per image. |
| 3 | **Unsupported image format** | Accept only JPG, PNG, WebP. Validate MIME type server-side. |
| 4 | **Admin uploads same image twice** | Generate content hash. Detect duplicate, reuse existing R2 URL. |
| 5 | **R2 bucket quota exceeded** | Graceful error: "Storage limit reached. Contact system admin." |
| 6 | **Admin session expires during long form** | Auto-save draft to localStorage every 30s. Restore on re-login. |

### Validation Schema (Zod)

```typescript
// Product creation validation
const metalEntrySchema = z.object({
  metal: z.string(),              // ObjectId as string
  variantIndex: z.number().min(0),
  variantName: z.string(),
  weightInGrams: z.number().min(0),
  part: z.string().optional(),
  wastagePercentage: z.number().min(0).max(100),
  makingCharges: z.number().min(0),
  makingChargeType: z.enum(["flat", "percentage"]),
});

const gemstoneEntrySchema = z.object({
  gemstone: z.string(),
  variantIndex: z.number().min(0),
  variantName: z.string(),
  quantity: z.number().int().min(1),
  totalCaratWeight: z.number().min(0),
  setting: z.string().optional(),
  position: z.string().optional(),
  certification: z.string().nullable().optional(),
  stoneCharges: z.number().min(0).default(0),
});

const productSchema = z.object({
  name: z.string().min(3).max(200),
  sku: z.string().min(1),
  description: z.string().min(10),
  category: z.string(),
  subcategory: z.string().optional(),
  metalComposition: z.array(metalEntrySchema).default([]),   // 0 or more
  gemstoneComposition: z.array(gemstoneEntrySchema).default([]), // 0 or more
  gstPercentage: z.number().min(0).max(100).default(3),
  images: z.array(imageSchema).min(1, "At least 1 image required"),
  // ... other fields
}).refine(
  (data) => data.metalComposition.length > 0 || data.gemstoneComposition.length > 0,
  { message: "Product must have at least one metal or gemstone" }
);
```

---

## Seed Data

### Metals
| Metal | Variants |
|-------|----------|
| Gold | 24K (99.9%), 22K (91.6%), 18K (75.0%), 14K (58.5%) |
| Silver | 999 Fine, 925 Sterling |
| Platinum | 950, 900, 850 |
| Rose Gold | 18K, 14K |
| White Gold | 18K, 14K |

### Gemstones
| Gemstone | Key Variants |
|----------|-------------|
| Diamond | Round/Princess/Oval, D-Z color, IF-I3 clarity |
| Ruby | Natural, Lab-created, Burmese, Thai |
| Emerald | Natural, Colombian, Zambian |
| Sapphire | Blue, Pink, Yellow, White |
| Pearl | Freshwater, Akoya, South Sea, Tahitian |
| Amethyst | Natural, Deep Purple |
| Topaz | Blue, White, Imperial |
| Opal | White, Black, Fire |
| Tanzanite | Natural, AAA grade |
| Garnet | Red, Green (Tsavorite) |

### Categories
Rings, Necklaces, Earrings, Bracelets, Bangles, Pendants, Chains, Anklets, Mangalsutra, Nose Pins, Toe Rings, Brooches, Sets (Necklace Set, Bridal Set)

---

## Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products?page=1&limit=20&category=rings&metal=gold&minPrice=5000&maxPrice=50000&sort=price_asc&search=diamond` | Filtered/paginated product list |
| GET | `/api/products/[id]` | Single product details |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/[id]` | Update product (admin) |
| DELETE | `/api/products/[id]` | Delete product (admin) |
| GET | `/api/metals` | List all metals |
| PUT | `/api/metals/[id]` | Update metal variant prices |
| GET | `/api/gemstones` | List all gemstones |
| PUT | `/api/gemstones/[id]` | Update gemstone variant prices |
| POST | `/api/upload` | Upload image to R2 |
| POST | `/api/prices/recalculate` | Recalculate all product prices |
| GET | `/api/categories` | List categories |
| GET | `/api/search?q=diamond+ring` | Full-text search |
| POST | `/api/auth/[...nextauth]` | Admin authentication |

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_SECRET=random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=jewelry-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Admin seed
ADMIN_EMAIL=admin@jewelry.com
ADMIN_PASSWORD=securepassword
```

---

## Vercel Free Tier Constraints

| Limit | Value | Our Strategy |
|-------|-------|--------------|
| Serverless function duration | 10s | Use MongoDB indexes, lean queries, pagination |
| Bandwidth | 100 GB/month | Serve images from R2 CDN, not through Vercel |
| Builds | 6000 min/month | ISR instead of full rebuilds |
| API routes | No limit | Keep payloads small |

---

## Performance Checklist

- [ ] MongoDB compound indexes on frequently queried fields
- [ ] Cursor-based pagination (not skip/limit for large datasets)
- [ ] `next/image` with remote patterns for R2 images
- [ ] React Server Components for product listing (no client JS for initial load)
- [ ] Client components only where interactivity is needed (filters, search, gallery)
- [ ] Debounced search (300ms)
- [ ] Skeleton loading states
- [ ] `loading.tsx` files in each route
- [ ] ISR (revalidate) for product pages
- [ ] Bundle analysis before deploy

---

## Future-Ready (Order System Hooks)

The schema is designed so these can be added later without restructuring:

- **Cart** → reference products by ID + selected size + snapshot of price at add-time
- **Order** → deep snapshot of entire product (metal weights, gem carats, per-item prices frozen at order time — so price changes don't alter past orders)
- **User** → customer accounts with NextAuth (Google/Email providers)
- **Wishlist** → user + product references
- **Payment** → Razorpay/Stripe integration
- **Notifications** → order status via WhatsApp/email
- **Price Alerts** → notify customers if a wishlisted product's price drops
- **Product Comparison** → compare up to 3 products side-by-side (metal, carat, price breakdown)

No code changes needed in existing models — just add new models and routes.

---

## MongoDB Indexes Strategy

```javascript
// Products — most critical for 2000+ items
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ category: 1, isActive: 1 });
db.products.createIndex({ finalPrice: 1 });
db.products.createIndex({ isActive: 1, isFeatured: 1 });
db.products.createIndex({ "metalComposition.metal": 1 });      // for price recalc queries
db.products.createIndex({ "gemstoneComposition.gemstone": 1 }); // for price recalc queries
db.products.createIndex({ tags: 1 });
db.products.createIndex({ gender: 1 });
db.products.createIndex(
  { name: "text", description: "text", tags: "text" },
  { weights: { name: 10, tags: 5, description: 1 } }
); // full-text search

// Metals & Gemstones
db.metals.createIndex({ code: 1 }, { unique: true });
db.gemstones.createIndex({ name: 1 });

// Price History
db.priceHistory.createIndex({ entityId: 1, changedAt: -1 });
```

---

## Commands to Start

```bash
npx create-next-app@latest jewelry-store --typescript --tailwind --app --src-dir --use-npm
cd jewelry-store
npm install mongoose @aws-sdk/client-s3 next-auth zustand framer-motion zod sharp lucide-react swr bcryptjs
npm install -D @types/bcryptjs
```

---

**Total estimated timeline: ~19 working days for one developer.**

Ready to start? Say "start phase 1" and we begin building.
