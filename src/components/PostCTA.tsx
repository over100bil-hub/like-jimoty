"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  variant?: "primary" | "fab" | "compact";
  className?: string;
  prefSlug?: string;
};

const OPTIONS: { type: string; label: string; icon: string }[] = [
  { type: "sell-give", label: "売ります・あげます", icon: "🏷️" },
  { type: "vehicles", label: "中古車", icon: "🚗" },
  { type: "foster", label: "里親募集", icon: "🐶" },
  { type: "members", label: "メンバー募集", icon: "👥" },
  { type: "community", label: "助け合い", icon: "🤝" },
  { type: "jobs-parttime", label: "アルバイト", icon: "💼" },
  { type: "jobs-fulltime", label: "正社員", icon: "🧑‍💼" },
  { type: "lesson", label: "教室・スクール", icon: "🎓" },
  { type: "events", label: "イベント", icon: "🎉" },
  { type: "realestate", label: "不動産", icon: "🏠" },
  { type: "localshop", label: "地元のお店", icon: "🏪" },
];

export default function PostCTA({
  variant = "primary",
  className = "",
  prefSlug,
}: Props) {
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

  const go = (type: string) => {
    setOpen(false);
    if (!prefSlug) {
      // 都道府県未選択時はトップへ誘導（pref選択を強制）
      router.push(`/?next=${encodeURIComponent(`/posts/new?type=${type}`)}`);
      return;
    }
    router.push(`/${prefSlug}/posts/new?type=${type}`);
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
            variant === "fab"
              ? "bottom-full mb-2 right-0"
              : "top-full mt-2 right-0"
          } w-64 bg-white rounded-xl shadow-airbnbLg border border-line overflow-hidden max-h-[70vh] overflow-y-auto`}
        >
          {OPTIONS.map((o) => (
            <button
              key={o.type}
              type="button"
              role="menuitem"
              onClick={() => go(o.type)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent-soft transition border-b border-line last:border-b-0"
            >
              <span className="text-xl shrink-0">{o.icon}</span>
              <span className="flex-1 text-sm font-semibold text-ink">
                {o.label}
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
