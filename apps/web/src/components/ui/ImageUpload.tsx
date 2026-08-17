"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ImageUpload({
  label,
  value,
  onChange,
  aspect = "banner",
  theme = "dark",
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: "banner" | "square";
  theme?: "dark" | "light";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const isLight = theme === "light";

  return (
    <div>
      <span
        className={cn(
          "mb-2 block text-sm",
          isLight ? "font-medium text-foreground" : "text-zinc-300",
        )}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed transition",
          aspect === "banner" ? "h-32 w-full" : "h-24 w-24",
          isLight
            ? "border-border bg-zinc-50 hover:border-primary"
            : "border-white/20 bg-black/20 hover:border-[#8b3030]",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span
            className={cn(
              "flex h-full flex-col items-center justify-center gap-1 text-xs",
              isLight ? "text-muted" : "text-zinc-400",
            )}
          >
            <Upload className="h-5 w-5" />
            {uploading ? "Uploading…" : "Click to upload"}
          </span>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "mt-2 text-xs",
            isLight ? "text-muted hover:text-foreground" : "text-zinc-400 hover:text-white",
          )}
        >
          Remove
        </button>
      )}
      {error && (
        <p className={cn("mt-2 text-xs", isLight ? "text-red-600" : "text-red-300")}>{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
