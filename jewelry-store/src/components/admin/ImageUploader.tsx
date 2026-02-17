"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Star } from "lucide-react";
import { useToast, ToastContainer } from "@/components/ui/Toast";

interface UploadedImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > maxImages) {
      addToast(`Maximum ${maxImages} images allowed`, "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      formData.append("folder", "products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newImages: UploadedImage[] = data.uploaded.map(
        (u: { url: string; alt: string }, i: number) => ({
          url: u.url,
          alt: u.alt,
          isPrimary: images.length === 0 && i === 0,
          displayOrder: images.length + i,
        })
      );

      onChange([...images, ...newImages]);

      if (data.errors.length > 0) {
        addToast(`${data.errors.length} file(s) failed`, "error");
      } else {
        addToast(`${data.successful} image(s) uploaded`, "success");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    // Try to delete from R2
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: img.url }),
      });
    } catch {
      // Non-critical, continue removing from form
    }

    let updated = images.filter((_, i) => i !== index);
    // If removed the primary, set first one as primary
    if (img.isPrimary && updated.length > 0) {
      updated = updated.map((img, i) => ({
        ...img,
        isPrimary: i === 0,
        displayOrder: i,
      }));
    } else {
      updated = updated.map((img, i) => ({
        ...img,
        displayOrder: i,
      }));
    }
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    onChange(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const updateAlt = (index: number, alt: string) => {
    onChange(
      images.map((img, i) =>
        i === index ? { ...img, alt } : img
      )
    );
  };

  return (
    <div className="space-y-3">
      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          uploading
            ? "border-amber-300 bg-amber-50/50"
            : "border-slate-200 hover:border-amber-400 hover:bg-amber-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Click to upload images</p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, WebP, AVIF · Max 5MB each · Up to {maxImages - images.length} more
            </p>
          </>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <div className="aspect-square relative">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setPrimary(i)}
                    className={`p-1.5 rounded-lg ${
                      img.isPrimary ? "bg-amber-500 text-white" : "bg-white/90 text-slate-700 hover:bg-amber-500 hover:text-white"
                    } transition-colors`}
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeImage(i)}
                    className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Primary badge */}
                {img.isPrimary && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-md flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" />
                    PRIMARY
                  </div>
                )}
              </div>
              <div className="p-2">
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="Alt text"
                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
