import { NextRequest } from "next/server";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { uploadToR2, generateImageKey, deleteFromR2, getKeyFromUrl } from "@/lib/r2";
import { isAllowedImageType, MAX_IMAGE_SIZE } from "@/lib/utils";

// POST /api/upload — upload image(s) to Cloudflare R2
export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "products";

    if (!files.length) {
      return apiError("No files provided");
    }

    if (files.length > 10) {
      return apiError("Maximum 10 files allowed per upload");
    }

    const results: { url: string; alt: string; originalName: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate type
      if (!isAllowedImageType(file.type)) {
        errors.push(`${file.name}: Invalid type. Only JPG, PNG, WebP, AVIF allowed.`);
        continue;
      }

      // Validate size
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: File too large. Max 5MB.`);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = generateImageKey(folder, file.name);
        const url = await uploadToR2(key, buffer, file.type);

        results.push({
          url,
          alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          originalName: file.name,
        });
      } catch (uploadError) {
        console.error(`Upload failed for ${file.name}:`, uploadError);
        errors.push(`${file.name}: Upload failed.`);
      }
    }

    return apiSuccess({
      uploaded: results,
      errors,
      total: files.length,
      successful: results.length,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return apiError("Upload failed", 500);
  }
}

// DELETE /api/upload — delete image from R2
export async function DELETE(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { url } = await req.json();
    if (!url) return apiError("URL is required");

    const key = getKeyFromUrl(url);
    await deleteFromR2(key);

    return apiSuccess({ message: "Image deleted" });
  } catch (error) {
    console.error("DELETE /api/upload error:", error);
    return apiError("Failed to delete image", 500);
  }
}
