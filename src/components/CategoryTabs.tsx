"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

const ICONS: Record<string, string> = {
  all: "🏠",
  furniture: "🛋️",
  appliances: "📺",
  clothing: "👕",
  "baby-kids": "🧸",
  "books-media": "📚",
  "sports-outdoor": "⚽",
  "toys-hobby": "🎮",
  vehicles: "🚗",
  "pc-mobile": "💻",
  tickets: "🎫",
  pets: "🐾",
  members: "👥",
  others: "📦",
};

export default function CategoryTabs({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("category");

  const select = (slug: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="scroll-x flex items-end gap-8 py-4">
          <Tab
            icon={ICONS.all}
            label="すべて"
            active={!current}
            onClick={() => select(null)}
          />
          {categories.map((c) => (
            <Tab
              key={c.id}
              icon={ICONS[c.slug] ?? "📦"}
              label={c.name}
              active={current === c.slug}
              onClick={() => select(c.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 shrink-0 pb-3 border-b-2 transition-colors ${
        active
          ? "border-ink text-ink"
          : "border-transparent text-sub hover:text-ink hover:border-line"
      }`}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </button>
  );
}
