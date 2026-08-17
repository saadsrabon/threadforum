"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Globe, Link2, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

function resolveShareUrl(url?: string) {
  if (!url) {
    return typeof window !== "undefined" ? window.location.href : "";
  }
  if (url.startsWith("http")) return url;
  if (typeof window === "undefined") return url;
  return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
}

type ShareButtonProps = {
  url?: string;
  title?: string;
  className?: string;
  size?: "sm" | "md";
};

export function ShareButton({ url, title, className, size = "md" }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const shareTitle = title ?? "Check out this thread on ThreadSphere";

  useEffect(() => {
    setShareUrl(resolveShareUrl(url));
  }, [url]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function copyLink() {
    const target = shareUrl || resolveShareUrl(url);
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  }

  const socialLinks = [
    {
      label: "Facebook",
      icon: Globe,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "X (Twitter)",
      icon: MessageCircle,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      label: "WhatsApp",
      icon: Share2,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
    },
  ];

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full font-medium text-muted transition hover:bg-zinc-100 hover:text-foreground",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        )}
      >
        <Share2 className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-zinc-50"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-muted" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </button>

          {socialLinks.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-zinc-50"
            >
              <Icon className="h-4 w-4 text-muted" />
              {label}
            </a>
          ))}

          <button
            type="button"
            onClick={() => {
              void copyLink();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 border-t border-border px-4 py-2.5 text-left text-sm hover:bg-zinc-50"
          >
            <Share2 className="h-4 w-4 text-muted" />
            Copy for Instagram
          </button>

          {shareUrl && (
            <div className="border-t border-border px-4 py-2">
              <p className="flex items-center gap-1 truncate text-xs text-muted">
                <Link2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{shareUrl.replace(/^https?:\/\//, "")}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
