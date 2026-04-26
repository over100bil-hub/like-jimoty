"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import type { Category } from "@/types";

const FALLBACK_ICON = "📦";

export default function CategoryTabs({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("category");

  const [openParent, setOpenParent] = useState<string | null>(null);

  const parents = useMemo(
    () =>
      categories
        .filter((c) => !c.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [categories]
  );

  const childrenByParentId = useMemo(() => {
    const map = new Map<number, Category[]>();
    categories
      .filter((c) => c.parent_id)
      .forEach((c) => {
        const list = map.get(c.parent_id as number) ?? [];
        list.push(c);
        map.set(c.parent_id as number, list);
      });
    map.forEach((list) =>
      list.sort((a, b) => a.sort_order - b.sort_order)
    );
    return map;
  }, [categories]);

  // 現在選択中のslugから親を逆引きしてドロワーを自動展開
  const currentParentSlug = useMemo(() => {
    if (!current) return null;
    const cur = categories.find((c) => c.slug === current);
    if (!cur) return null;
    if (!cur.parent_id) return cur.slug;
    const parent = categories.find((c) => c.id === cur.parent_id);
    return parent?.slug ?? null;
  }, [current, categories]);

  useEffect(() => {
    setOpenParent(null);
  }, [current]);

  const select = (slug: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    router.push(`/?${params.toString()}`);
  };

  const toggleDrawer = (parent: Category) => {
    const childCount = (childrenByParentId.get(parent.id) ?? []).length;
    if (childCount === 0) {
      // 子がなければそのまま選択
      select(parent.slug);
      return;
    }
    setOpenParent((prev) => (prev === parent.slug ? null : parent.slug));
  };

  const activeParentSlug = openParent ?? currentParentSlug;
  const activeParent = parents.find((p) => p.slug === activeParentSlug);
  const activeChildren = activeParent
    ? childrenByParentId.get(activeParent.id) ?? []
    : [];

  return (
    <div className="border-b border-line bg-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="scroll-x flex items-end gap-6 sm:gap-8 py-3 sm:py-4">
          <Tab
            icon="🏠"
            label="すべて"
            active={!current}
            hasChildren={false}
            expanded={false}
            onClick={() => {
              setOpenParent(null);
              select(null);
            }}
          />
          {parents.map((p) => {
            const isParentSelected = current === p.slug;
            const isAncestorOfSelected = currentParentSlug === p.slug;
            const isExpanded = activeParentSlug === p.slug;
            const childCount = (childrenByParentId.get(p.id) ?? []).length;
            return (
              <Tab
                key={p.id}
                icon={p.icon ?? FALLBACK_ICON}
                label={p.name}
                active={isParentSelected || isAncestorOfSelected}
                hasChildren={childCount > 0}
                expanded={isExpanded}
                onClick={() => toggleDrawer(p)}
              />
            );
          })}
        </div>
      </div>

      {/* ドロワー: 小カテゴリ */}
      {activeParent && activeChildren.length > 0 && (
        <div className="border-t border-line bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <span>{activeParent.icon ?? FALLBACK_ICON}</span>
                <span>{activeParent.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => select(activeParent.slug)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-pill transition ${
                  current === activeParent.slug
                    ? "bg-ink text-white"
                    : "bg-white border border-line text-ink hover:border-ink"
                }`}
              >
                {activeParent.name}すべて
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {activeChildren.map((child) => {
                const active = current === child.slug;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => select(child.slug)}
                    className={`text-left text-sm px-3 py-2 rounded-card transition border ${
                      active
                        ? "bg-ink text-white border-ink"
                        : "bg-white border-line text-ink hover:border-ink"
                    }`}
                  >
                    {child.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tab({
  icon,
  label,
  active,
  hasChildren,
  expanded,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  hasChildren: boolean;
  expanded: boolean;
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
      aria-expanded={hasChildren ? expanded : undefined}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-xs font-semibold whitespace-nowrap flex items-center gap-0.5">
        {label}
        {hasChildren && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        )}
      </span>
    </button>
  );
}
