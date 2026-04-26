"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  variant?: "primary" | "fab" | "compact";
  className?: string;
};

const OPTIONS: { value: "sell" | "give" | "wanted"; label: string; sub: string; icon: string }[] = [
  { value: "sell", label: "売ります", sub: "値段をつけて出品", icon: "💴" },
  { value: "give", label: "あげます", sub: "無料でお譲り", icon: "🎁" },
  { value: "wanted", label: "求む", sub: "欲しいものを募集", icon: "🙋" },
];

export default function PostCTA({ variant = "primary", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const go = (deal: string) => {
    setOpen(false);
    router.push(`/posts/new?deal=${deal}`);
  };

  const buttonCls =
    variant === "fab"
      ? "bg-gradient-brand text-white font-semibold pl-5 pr-6 py-3.5 rounded-pill shadow-airbnbLg flex items-center gap-2"
      : variant === "compact"
      ? "inline-flex items-center gap-1 text-sm font-semibold px-4 py-2.5 rounded-pill hover:bg-surface transition-colors text-ink"
      : "btn-primary inline-flex items-center gap-2 px-5 py-3";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={buttonCls}
      >
        {variant === "fab" && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 5v14M5 12h14"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
        <span>投稿する</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 ${
            variant === "fab" ? "bottom-full mb-2 right-0" : "top-full mt-2 right-0"
          } w-64 bg-white rounded-xl shadow-airbnbLg border border-line overflow-hidden`}
        >
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitem"
              onClick={() => go(o.value)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent-soft transition"
            >
              <span className="text-2xl">{o.icon}</span>
              <span className="flex-1">
                <span className="block font-bold text-ink">{o.label}</span>
                <span className="block text-xs text-sub">{o.sub}</span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-accent"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
