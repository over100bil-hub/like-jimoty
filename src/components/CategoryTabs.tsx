"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import type { Category } from "@/types";
import CategoryIcon from "./CategoryIcon";

export default function CategoryTabs({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("category");

  const [openParent, setOpenParent] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // 人気カテゴリ（is_popular=true）を popular_order 昇順
  const popularParents = useMemo(
    () =>
      categories
        .filter((c) => !c.parent_id && c.is_popular)
        .sort(
          (a, b) =>
            (a.popular_order ?? 999) - (b.popular_order ?? 999)
        ),
    [categories]
  );

  const allParents = useMemo(
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
    map.forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order));
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
      select(parent.slug);
      return;
    }
    setOpenParent((prev) => (prev === parent.slug ? null : parent.slug));
  };

  const activeParentSlug = openParent ?? currentParentSlug;
  const activeParent = allParents.find((p) => p.slug === activeParentSlug);
  const activeChildren = activeParent
    ? childrenByParentId.get(activeParent.id) ?? []
    : [];

  const displayList = showAll ? allParents : popularParents;

  return (
    <div className="border-b border-line bg-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between pt-3 pb-1">
          <h2 className="text-xs font-bold flex items-center gap-1.5">
            <span className="bg-gradient-brand text-white text-[10px] px-1.5 py-0.5 rounded">
              人気
            </span>
            <span className="text-ink">カテゴリから探す</span>
          </h2>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-semibold text-accent hover:underline"
          >
            {showAll ? "人気のみ表示" : "すべて表示"}
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 py-3">
          <Tab
            slug="all"
            label="すべて"
            active={!current}
            hasChildren={false}
            expanded={false}
            onClick={() => {
              setOpenParent(null);
              select(null);
            }}
          />
          {displayList.slice(0, showAll ? 999 : 9).map((p) => {
            const isParentSelected = current === p.slug;
            const isAncestorOfSelected = currentParentSlug === p.slug;
            const isExpanded = activeParentSlug === p.slug;
            const childCount = (childrenByParentId.get(p.id) ?? []).length;
            return (
              <Tab
                key={p.id}
                slug={p.slug}
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
                <span className="text-accent">
                  <CategoryIcon slug={activeParent.slug} size={20} />
                </span>
                <span>{activeParent.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => select(activeParent.slug)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-pill transition ${
                  current === activeParent.slug
                    ? "bg-gradient-brand text-white"
                    : "bg-white border border-line text-ink hover:border-accent"
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
                        ? "bg-gradient-brand text-white border-transparent"
                        : "bg-white border-line text-ink hover:border-accent"
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
  slug,
  label,
  active,
  hasChildren,
  expanded,
  onClick,
}: {
  slug: string;
  label: string;
  active: boolean;
  hasChildren: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-start gap-1.5 py-2 px-1 rounded-card transition ${
        active ? "bg-accent-soft" : "hover:bg-accent-soft/50"
      }`}
      aria-expanded={hasChildren ? expanded : undefined}
    >
      <span
        className={`grid place-items-center w-11 h-11 rounded-full transition ${
          active
            ? "bg-gradient-brand text-white shadow-airbnb"
            : "bg-accent-soft text-accent group-hover:bg-gradient-brand group-hover:text-white"
        }`}
      >
        {slug === "all" ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5h6v6H3V5zm12 0h6v6h-6V5zM3 13h6v6H3v-6zm12 0h6v6h-6v-6z" />
          </svg>
        ) : (
          <CategoryIcon slug={slug} size={22} />
        )}
      </span>
      <span
        className={`text-[11px] sm:text-xs font-semibold leading-tight text-center line-clamp-2 ${
          active ? "text-accent" : "text-ink"
        }`}
      >
        {label}
        {hasChildren && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`inline-block ml-0.5 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        )}
      </span>
    </button>
  );
}
