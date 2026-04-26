"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Prefecture, Attribute } from "@/types";
import {
  getCategoryFields,
  type CategoryField,
} from "@/lib/categoryFields";

export default function FilterChips({
  prefectures,
  hidePrefecture = false,
}: {
  prefectures: Prefecture[];
  hidePrefecture?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const [openPref, setOpenPref] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const [openDeal, setOpenDeal] = useState(false);
  const [openAttr, setOpenAttr] = useState(false);
  const [availableAttrs, setAvailableAttrs] = useState<Attribute[]>([]);
  const [topCategorySlug, setTopCategorySlug] = useState<string | null>(null);
  const [openRange, setOpenRange] = useState<string | null>(null);
  const supabase = createClient();
  const categorySlug = sp.get("category");
  const selectedAttrs = (sp.get("attrs") ?? "")
    .split(",")
    .filter(Boolean)
    .map((s) => Number(s));

  const dynamicFields: CategoryField[] = useMemo(
    () => getCategoryFields(topCategorySlug),
    [topCategorySlug]
  );
  const rangeFields = dynamicFields.filter(
    (f) => f.type === "number" && f.filterable === "range"
  );
  const exactFields = dynamicFields.filter(
    (f) =>
      (f.type === "select" && f.filterable === "exact") ||
      (f.type === "boolean" && f.filterable === "exact")
  );

  // 選択中カテゴリに紐づく属性＋大カテゴリslugを解決
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!categorySlug) {
        setAvailableAttrs([]);
        setTopCategorySlug(null);
        return;
      }
      // 全カテゴリを軽量取得して階層遡及
      const { data: catsRaw } = await supabase
        .from("categories")
        .select("id,slug,parent_id");
      if (cancelled) return;
      const cats =
        (catsRaw as { id: number; slug: string; parent_id: number | null }[]) ??
        [];
      let cur = cats.find((c) => c.slug === categorySlug) ?? null;
      const startId = cur?.id ?? null;
      while (cur?.parent_id) {
        const parent = cats.find((c) => c.id === cur!.parent_id);
        if (!parent) break;
        cur = parent;
      }
      setTopCategorySlug(cur?.slug ?? null);

      if (!startId) {
        setAvailableAttrs([]);
        return;
      }
      const { data } = await supabase
        .from("category_attributes")
        .select("attributes(*)")
        .eq("category_id", startId);
      if (cancelled) return;
      const rows = (data ?? []) as unknown as {
        attributes: Attribute | Attribute[] | null;
      }[];
      const attrs: Attribute[] = rows
        .flatMap((r) =>
          Array.isArray(r.attributes)
            ? r.attributes
            : r.attributes
            ? [r.attributes]
            : []
        )
        .sort(
          (a, b) =>
            (a.group_label ?? "").localeCompare(b.group_label ?? "") ||
            (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
      setAvailableAttrs(attrs);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  const update = (kv: Record<string, string | null>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(kv)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const reset = () => router.push(pathname);
  const filterKeys = hidePrefecture
    ? ["q", "category", "deal", "min", "max", "attrs", "online"]
    : ["q", "category", "prefecture", "deal", "min", "max", "attrs", "online"];
  const isFiltered =
    filterKeys.some((k) => sp.get(k)) ||
    Array.from(sp.keys()).some((k) => k.startsWith("f_"));

  const toggleAttr = (id: number) => {
    const next = selectedAttrs.includes(id)
      ? selectedAttrs.filter((x) => x !== id)
      : [...selectedAttrs, id];
    update({ attrs: next.length > 0 ? next.join(",") : null });
  };

  const prefName =
    prefectures.find((p) => String(p.id) === sp.get("prefecture"))?.name ?? null;

  return (
    <div className="border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 scroll-x">
        {!hidePrefecture && (
          <FilterPill
            label={prefName ?? "エリア"}
            active={!!prefName}
            onClick={() => setOpenPref(true)}
          />
        )}
        <FilterPill
          label={
            sp.get("deal") === "give"
              ? "あげます"
              : sp.get("deal") === "wanted"
              ? "求む"
              : sp.get("deal") === "sell"
              ? "売ります"
              : "取引タイプ"
          }
          active={!!sp.get("deal")}
          onClick={() => setOpenDeal(true)}
        />
        <FilterPill
          label={
            sp.get("min") || sp.get("max")
              ? `${sp.get("min") ?? "0"}円〜${sp.get("max") ?? "上限なし"}`
              : "価格"
          }
          active={!!(sp.get("min") || sp.get("max"))}
          onClick={() => setOpenPrice(true)}
        />
        {availableAttrs.length > 0 && (
          <FilterPill
            label={
              selectedAttrs.length > 0
                ? `条件 ${selectedAttrs.length}件`
                : "詳細条件"
            }
            active={selectedAttrs.length > 0}
            onClick={() => setOpenAttr(true)}
          />
        )}

        {/* カテゴリ別: 単一選択(select/boolean) */}
        {exactFields.map((f) => {
          const cur = sp.get(`f_${f.key}`);
          const label =
            f.type === "select" && cur
              ? f.options.find((o) => o.value === cur)?.label ?? f.label
              : f.label;
          return (
            <FilterPill
              key={f.key}
              label={cur ? `${f.label}: ${label}` : f.label}
              active={!!cur}
              onClick={() => setOpenRange(`exact:${f.key}`)}
            />
          );
        })}

        {/* カテゴリ別: 範囲フィルタ */}
        {rangeFields.map((f) => {
          const minV = sp.get(`f_${f.key}_min`);
          const maxV = sp.get(`f_${f.key}_max`);
          const active = !!(minV || maxV);
          const unit = f.type === "number" ? f.unit ?? "" : "";
          const labelText = active
            ? `${f.label}: ${minV ?? "0"}〜${maxV ?? "上限なし"}${unit}`
            : f.label;
          return (
            <FilterPill
              key={f.key}
              label={labelText}
              active={active}
              onClick={() => setOpenRange(`range:${f.key}`)}
            />
          );
        })}

        {/* オンライン決済 */}
        {topCategorySlug && (
          <FilterPill
            label={
              sp.get("online") === "true"
                ? "オンライン決済のみ"
                : "オンライン決済"
            }
            active={sp.get("online") === "true"}
            onClick={() =>
              update({ online: sp.get("online") === "true" ? null : "true" })
            }
          />
        )}

        {isFiltered && (
          <button
            onClick={reset}
            className="ml-auto pill text-sub hover:text-ink"
          >
            条件クリア
          </button>
        )}
      </div>

      {openPref && (
        <Sheet onClose={() => setOpenPref(false)} title="エリアを選択">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                update({ prefecture: null });
                setOpenPref(false);
              }}
              className={`pill ${!sp.get("prefecture") ? "pill-active" : ""}`}
            >
              すべて
            </button>
            {prefectures.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  update({ prefecture: String(p.id) });
                  setOpenPref(false);
                }}
                className={`pill ${
                  sp.get("prefecture") === String(p.id) ? "pill-active" : ""
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {openDeal && (
        <Sheet onClose={() => setOpenDeal(false)} title="取引タイプ">
          <div className="flex flex-wrap gap-2">
            {[
              { v: null, l: "すべて" },
              { v: "sell", l: "売ります" },
              { v: "give", l: "あげます" },
              { v: "wanted", l: "求む" },
            ].map((o) => (
              <button
                key={o.v ?? "all"}
                onClick={() => {
                  update({ deal: o.v ?? null });
                  setOpenDeal(false);
                }}
                className={`pill ${
                  (sp.get("deal") ?? null) === o.v ? "pill-active" : ""
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {openAttr && (
        <Sheet onClose={() => setOpenAttr(false)} title="詳細条件で絞り込む">
          <div className="space-y-4">
            {(() => {
              const grouped = availableAttrs.reduce<
                Record<string, Attribute[]>
              >((acc, a) => {
                const key = a.group_label ?? "その他";
                (acc[key] = acc[key] ?? []).push(a);
                return acc;
              }, {});
              return Object.entries(grouped).map(([group, attrs]) => (
                <div key={group}>
                  <p className="text-xs font-bold text-sub mb-2">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {attrs.map((a) => {
                      const active = selectedAttrs.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAttr(a.id)}
                          className={`pill text-sm ${
                            active ? "pill-active" : ""
                          }`}
                        >
                          {active && "✓ "}
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
            <button
              type="button"
              onClick={() => setOpenAttr(false)}
              className="btn-primary w-full mt-2"
            >
              閉じる
            </button>
          </div>
        </Sheet>
      )}
      {/* カテゴリ別: exact / range の動的シート */}
      {openRange && (() => {
        const [mode, key] = openRange.split(":");
        const field = dynamicFields.find((f) => f.key === key);
        if (!field) return null;
        const close = () => setOpenRange(null);
        return (
          <Sheet onClose={close} title={field.label}>
            {mode === "exact" && field.type === "select" && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    update({ [`f_${key}`]: null });
                    close();
                  }}
                  className={`pill ${
                    !sp.get(`f_${key}`) ? "pill-active" : ""
                  }`}
                >
                  すべて
                </button>
                {field.options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => {
                      update({ [`f_${key}`]: o.value });
                      close();
                    }}
                    className={`pill ${
                      sp.get(`f_${key}`) === o.value ? "pill-active" : ""
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {mode === "exact" && field.type === "boolean" && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    update({ [`f_${key}`]: null });
                    close();
                  }}
                  className={`pill ${
                    !sp.get(`f_${key}`) ? "pill-active" : ""
                  }`}
                >
                  指定なし
                </button>
                <button
                  onClick={() => {
                    update({ [`f_${key}`]: "true" });
                    close();
                  }}
                  className={`pill ${
                    sp.get(`f_${key}`) === "true" ? "pill-active" : ""
                  }`}
                >
                  はい
                </button>
              </div>
            )}
            {mode === "range" && field.type === "number" && (
              <RangeForm
                unit={field.unit}
                initialMin={sp.get(`f_${key}_min`) ?? ""}
                initialMax={sp.get(`f_${key}_max`) ?? ""}
                onApply={(min, max) => {
                  update({
                    [`f_${key}_min`]: min || null,
                    [`f_${key}_max`]: max || null,
                  });
                  close();
                }}
              />
            )}
          </Sheet>
        );
      })()}
      {openPrice && (
        <Sheet onClose={() => setOpenPrice(false)} title="価格帯">
          <PriceForm
            initialMin={sp.get("min") ?? ""}
            initialMax={sp.get("max") ?? ""}
            onApply={(min, max) => {
              update({ min: min || null, max: max || null });
              setOpenPrice(false);
            }}
          />
        </Sheet>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`pill ${active ? "pill-active" : ""}`}>
      {label}
    </button>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 grid place-items-end sm:place-items-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full w-8 h-8 grid place-items-center hover:bg-surface"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PriceForm({
  initialMin,
  initialMax,
  onApply,
}: {
  initialMin: string;
  initialMax: string;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-sub">最低価格 (円)</span>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="input mt-1"
            min={0}
          />
        </label>
        <label className="block">
          <span className="text-sm text-sub">最高価格 (円)</span>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="input mt-1"
            min={0}
          />
        </label>
      </div>
      <button
        onClick={() => onApply(min, max)}
        className="btn-primary w-full"
      >
        適用
      </button>
    </div>
  );
}

function RangeForm({
  unit,
  initialMin,
  initialMax,
  onApply,
}: {
  unit?: string;
  initialMin: string;
  initialMax: string;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-sub">下限{unit ? ` (${unit})` : ""}</span>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm text-sub">上限{unit ? ` (${unit})` : ""}</span>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="input mt-1"
          />
        </label>
      </div>
      <button onClick={() => onApply(min, max)} className="btn-primary w-full">
        適用
      </button>
    </div>
  );
}
