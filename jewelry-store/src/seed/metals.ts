/**
 * Seed Data: Metals
 *
 * Prices are approximate market rates in INR per gram.
 * Admin can update prices from the dashboard at any time.
 */

export const metalsSeedData = [
  {
    name: "Gold",
    code: "GOLD",
    color: "Yellow" as const,
    variants: [
      {
        name: "24K Gold",
        purity: 99.9,
        pricePerGram: 7500,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "22K Gold",
        purity: 91.6,
        pricePerGram: 6900,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "18K Gold",
        purity: 75.0,
        pricePerGram: 5625,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "14K Gold",
        purity: 58.5,
        pricePerGram: 4400,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 3,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 500,
  },
  {
    name: "White Gold",
    code: "WHITE_GOLD",
    color: "White" as const,
    variants: [
      {
        name: "18K White Gold",
        purity: 75.0,
        pricePerGram: 5800,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "14K White Gold",
        purity: 58.5,
        pricePerGram: 4550,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 3,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 600,
  },
  {
    name: "Rose Gold",
    code: "ROSE_GOLD",
    color: "Rose" as const,
    variants: [
      {
        name: "18K Rose Gold",
        purity: 75.0,
        pricePerGram: 5700,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "14K Rose Gold",
        purity: 58.5,
        pricePerGram: 4500,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 3,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 600,
  },
  {
    name: "Silver",
    code: "SILVER",
    color: "Silver" as const,
    variants: [
      {
        name: "999 Fine Silver",
        purity: 99.9,
        pricePerGram: 95,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "925 Sterling Silver",
        purity: 92.5,
        pricePerGram: 85,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 5,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 200,
  },
  {
    name: "Platinum",
    code: "PLATINUM",
    color: "Grey" as const,
    variants: [
      {
        name: "950 Platinum",
        purity: 95.0,
        pricePerGram: 3200,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "900 Platinum",
        purity: 90.0,
        pricePerGram: 3050,
        unit: "gram" as const,
        isActive: true,
      },
      {
        name: "850 Platinum",
        purity: 85.0,
        pricePerGram: 2900,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 2,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 800,
  },
  {
    name: "Palladium",
    code: "PALLADIUM",
    color: "Grey" as const,
    variants: [
      {
        name: "950 Palladium",
        purity: 95.0,
        pricePerGram: 4000,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 2,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 700,
  },
  {
    name: "Titanium",
    code: "TITANIUM",
    color: "Grey" as const,
    variants: [
      {
        name: "Grade 5 Titanium",
        purity: 100,
        pricePerGram: 25,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 1,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 300,
  },
  {
    // Non-precious — for Mangalsutra and traditional jewelry
    name: "Black Beads",
    code: "BLACK_BEADS",
    color: "Other" as const,
    variants: [
      {
        name: "Karimani / Black Beads",
        purity: 0,
        pricePerGram: 5,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 0,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 0,
  },
  {
    // For Kundan and Polki jewelry
    name: "Lac / Resin",
    code: "LAC",
    color: "Other" as const,
    variants: [
      {
        name: "Lac Filling",
        purity: 0,
        pricePerGram: 2,
        unit: "gram" as const,
        isActive: true,
      },
    ],
    defaultWastagePercentage: 0,
    defaultMakingChargeType: "flat" as const,
    defaultMakingCharges: 0,
  },
];
