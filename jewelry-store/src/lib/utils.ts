/**
 * Format price in Indian Rupee format
 * e.g., 494093 → "₹4,94,093"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format price with decimals
 * e.g., 494093.50 → "₹4,94,093.50"
 */
export function formatPriceDecimal(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Generate URL-friendly slug from a string.
 * Handles duplicates by appending a suffix.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique slug by checking existing slugs.
 * Returns: "my-ring", "my-ring-2", "my-ring-3", etc.
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

/**
 * Generate SKU from category code and sequential number.
 * e.g., "JW-RNG-001"
 */
export function generateSku(prefix: string, number: number): string {
  return `JW-${prefix}-${String(number).padStart(3, "0")}`;
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Create a delay (for rate limiting, etc.)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Round to 2 decimal places (for prices).
 * Returns 0 if the input is NaN, undefined, or null.
 */
export function roundPrice(amount: number): number {
  if (amount == null || isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

/**
 * Safely convert a value to a finite number.
 * Returns the fallback (default 0) if the value is NaN, undefined, null, or Infinity.
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (value == null) return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

/**
 * Parse a comma-separated string to array.
 * "gold, silver, platinum" → ["gold", "silver", "platinum"]
 */
export function parseCSV(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build WhatsApp share URL for a product.
 */
export function getWhatsAppShareUrl(
  productUrl: string,
  productName: string
): string {
  const text = encodeURIComponent(
    `Check out this beautiful piece: ${productName}\n${productUrl}`
  );
  return `https://wa.me/?text=${text}`;
}

/**
 * Build a generic share URL data object.
 */
export function getShareData(productName: string, productUrl: string) {
  return {
    title: productName,
    text: `Check out this beautiful piece: ${productName}`,
    url: productUrl,
  };
}

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Extract file extension from a filename.
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Check if a file type is an allowed image type.
 */
export function isAllowedImageType(mimeType: string): boolean {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  return allowed.includes(mimeType);
}

/**
 * Max image file size (5MB).
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Max images per product.
 */
export const MAX_IMAGES_PER_PRODUCT = 10;
