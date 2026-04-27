"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Category, Prefecture, Post, DealType, Attribute } from "@/types";
import { MAX_IMAGE_MB, MAX_IMAGES } from "@/lib/utils";
import {
  getCategoryFields,
  resolveTopCategorySlug,
  type CategoryField,
} from "@/lib/categoryFields";

type Props = {
  categories: Category[];
  prefectures: Prefecture[];
  userId: string;
  userEmail: string;
  post?: Post;
  initialDeal?: DealType;
  initialCategoryId?: number;
  initialPrefectureId?: number;
};

const CONDITIONS = ["新品・未使用", "未使用に近い", "目立った傷や汚れなし", "やや傷や汚れあり", "傷や汚れあり"];

export default function PostForm({
  categories,
  prefectures,
  userId,
  userEmail,
  post,
  initialDeal,
  initialCategoryId,
  initialPrefectureId,
}: Props) {
  const isEdit = !!post;
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(post?.title ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    post?.category_id?.toString() ?? initialCategoryId?.toString() ?? ""
  );
  const [prefectureId, setPrefectureId] = useState(
    post?.prefecture_id?.toString() ?? initialPrefectureId?.toString() ?? ""
  );
  const [price, setPrice] = useState(post?.price?.toString() ?? "0");
  const [contactEmail, setContactEmail] = useState(
    post?.contact_email ?? userEmail ?? ""
  );
  const [dealType, setDealType] = useState<DealType>(
    post?.deal_type ?? initialDeal ?? "sell"
  );
  const [condition, setCondition] = useState<string>(post?.condition ?? "");

  // 属性
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>(
    []
  );
  const [selectedAttrs, setSelectedAttrs] = useState<number[]>(
    post?.attribute_ids ?? []
  );

  // カテゴリ別の動的フィールド値
  const [attrs, setAttrs] = useState<Record<string, unknown>>(
    (post?.attrs as Record<string, unknown>) ?? {}
  );
  const [onlinePurchasable, setOnlinePurchasable] = useState<boolean>(
    !!post?.online_purchasable
  );

  // 現在選択中カテゴリの大カテゴリ(top) slugを解決
  const topSlug = useMemo(
    () =>
      resolveTopCategorySlug(
        categoryId ? Number(categoryId) : null,
        categories
      ),
    [categoryId, categories]
  );
  const dynamicFields: CategoryField[] = useMemo(
    () => getCategoryFields(topSlug),
    [topSlug]
  );

  // カテゴリ変更時、現在のdealTypeがそのカテゴリに合わない場合は自動補正
  useEffect(() => {
    if (!topSlug) return;
    const allowed: Record<string, DealType[]> = {
      jobs: ["job"],
      localshop: ["shop"],
      community: ["community"],
      members: ["members"],
      lesson: ["lesson"],
      foster: ["foster"],
    };
    const list = allowed[topSlug];
    if (list && !list.includes(dealType)) {
      setDealType(list[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topSlug]);

  const setAttrValue = (key: string, value: unknown) =>
    setAttrs((prev) => {
      const next = { ...prev };
      if (value === "" || value == null) delete next[key];
      else next[key] = value;
      return next;
    });

  useEffect(() => {
    if (!categoryId) {
      setAvailableAttributes([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("category_attributes")
        .select("attributes(*)")
        .eq("category_id", Number(categoryId));
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
      setAvailableAttributes(attrs);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const toggleAttr = (id: number) =>
    setSelectedAttrs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // group_label別にまとめる
  const groupedAttrs = availableAttributes.reduce<Record<string, Attribute[]>>(
    (acc, a) => {
      const key = a.group_label ?? "その他";
      (acc[key] = acc[key] ?? []).push(a);
      return acc;
    },
    {}
  );

  const [existingImages, setExistingImages] = useState<string[]>(
    post?.images ?? []
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFreeDeal = dealType === "give" || dealType === "wanted";

  // sale系（家具・家電など）かどうかを topSlug で判定
  const SALE_TOPS = new Set([
    "furniture",
    "appliances",
    "clothing",
    "baby-kids",
    "books-media",
    "sports-outdoor",
    "toys-hobby",
    "pc-mobile",
    "tickets",
    "pets",
    "others",
  ]);
  const isSaleCategory = !!topSlug && SALE_TOPS.has(topSlug);
  const showPriceField =
    isSaleCategory || topSlug === "vehicles" || topSlug === "events";
  const showConditionField = isSaleCategory;

  // 画像WebP変換 + リサイズ
  const optimizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSide = 1600;
          let { width, height } = img;
          if (width > maxSide || height > maxSide) {
            const ratio = Math.min(maxSide / width, maxSide / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context unavailable"));
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) =>
              blob ? resolve(blob) : reject(new Error("toBlob failed")),
            "image/webp",
            0.85
          );
        };
        img.onerror = () => reject(new Error("画像読み込み失敗"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("ファイル読み込み失敗"));
      reader.readAsDataURL(file);
    });
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const blob = await optimizeImage(file);
      const path = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.webp`;
      const { error: upErr } = await supabase.storage
        .from("post-images")
        .upload(path, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp",
        });
      if (upErr) throw new Error(`画像アップロード失敗: ${upErr.message}`);
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const total = existingImages.length + newImageFiles.length;
    const remaining = MAX_IMAGES - total;
    if (remaining <= 0) return;
    const files = Array.from(e.target.files ?? []).slice(0, remaining);
    const validFiles: File[] = [];
    for (const f of files) {
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        setError(`「${f.name}」は${MAX_IMAGE_MB}MBを超えています`);
        continue;
      }
      validFiles.push(f);
    }
    setNewImageFiles((p) => [...p, ...validFiles]);
    setNewImagePreviews((p) => [
      ...p,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeExistingImage = (url: string) =>
    setExistingImages((p) => p.filter((u) => u !== url));

  const removeNewImage = (i: number) => {
    setNewImageFiles((p) => p.filter((_, idx) => idx !== i));
    setNewImagePreviews((p) => {
      if (p[i]) URL.revokeObjectURL(p[i]);
      return p.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let uploaded: string[] = [];
      if (newImageFiles.length > 0) uploaded = await uploadImages(newImageFiles);
      const images = [...existingImages, ...uploaded];

      const payload = {
        title,
        description,
        category_id: categoryId ? parseInt(categoryId) : null,
        prefecture_id: prefectureId ? parseInt(prefectureId) : null,
        price: !showPriceField || isFreeDeal ? 0 : parseInt(price) || 0,
        contact_email: contactEmail,
        images,
        user_id: userId,
        status: "active" as const,
        deal_type: dealType,
        condition: condition || null,
        attribute_ids: selectedAttrs,
        attrs,
        online_purchasable: onlinePurchasable,
      };

      if (isEdit) {
        const { error: e1 } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", post!.id);
        if (e1) throw e1;
        router.refresh();
        router.push(`/posts/${post!.id}`);
      } else {
        const { data, error: e1 } = await supabase
          .from("posts")
          .insert(payload)
          .select()
          .single();
        if (e1) throw e1;
        router.refresh();
        router.push(`/posts/${data.id}`);
      }
    } catch (err: unknown) {
      console.error("[PostForm]", err);
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const totalImages = existingImages.length + newImageFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-accent-soft border border-accent text-accent rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <Field label="タイトル" required>
        <input
          type="text"
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="例: ほぼ新品の電動自転車"
        />
      </Field>

      <Field label="説明" required>
        <textarea
          required
          maxLength={2000}
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          placeholder="商品の状態、受け渡し方法、譲れる条件など詳しく書いてください"
        />
        <p className="text-xs text-sub text-right mt-1">
          {description.length}/2000
        </p>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="カテゴリ" required>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            <option value="">選択してください</option>
            {categories
              .filter((c) => !c.parent_id)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((parent) => {
                const children = categories
                  .filter((c) => c.parent_id === parent.id)
                  .sort((a, b) => a.sort_order - b.sort_order);
                if (children.length === 0) {
                  return (
                    <option key={parent.id} value={parent.id}>
                      {parent.icon ? `${parent.icon} ` : ""}
                      {parent.name}
                    </option>
                  );
                }
                return (
                  <optgroup
                    key={parent.id}
                    label={`${parent.icon ?? ""} ${parent.name}`}
                  >
                    <option value={parent.id}>{parent.name}（全般）</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        　{child.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
          </select>
        </Field>
        <Field label="エリア">
          <select
            value={prefectureId}
            onChange={(e) => setPrefectureId(e.target.value)}
            className="input"
          >
            <option value="">選択してください</option>
            {prefectures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* 取引タイプ：カテゴリ別に候補を切替 */}
      {(() => {
        const dealOptions: { v: DealType; l: string }[] = isSaleCategory
          ? [
              { v: "sell", l: "売ります" },
              { v: "give", l: "あげます" },
              { v: "wanted", l: "求む" },
            ]
          : topSlug === "jobs"
          ? [{ v: "job", l: "求人" }]
          : topSlug === "localshop"
          ? [{ v: "shop", l: "店舗PR" }]
          : topSlug === "community"
          ? [{ v: "community", l: "助けてほしい" }]
          : topSlug === "members"
          ? [{ v: "members", l: "メンバー募集" }]
          : topSlug === "lesson"
          ? [{ v: "lesson", l: "教室" }]
          : topSlug === "foster"
          ? [{ v: "foster", l: "里親募集" }]
          : topSlug === "realestate"
          ? [
              { v: "sell", l: "売ります" },
              { v: "wanted", l: "求む" },
            ]
          : [];
        if (dealOptions.length === 0) return null;
        return (
          <Field label="取引タイプ" required>
            <div className="flex flex-wrap gap-2">
              {dealOptions.map((o) => (
                <button
                  type="button"
                  key={o.v}
                  onClick={() => setDealType(o.v)}
                  className={`pill ${dealType === o.v ? "pill-active" : ""}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </Field>
        );
      })()}

      {showConditionField && (
        <Field label="商品状態">
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCondition(c === condition ? "" : c)}
                className={`pill ${condition === c ? "pill-active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* カテゴリ別の専用フィールド */}
      {dynamicFields.length > 0 && (
        <Field label="カテゴリ別の詳細情報">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dynamicFields.map((f) => (
              <DynamicField
                key={f.key}
                field={f}
                value={attrs[f.key]}
                onChange={(v) => setAttrValue(f.key, v)}
              />
            ))}
          </div>
        </Field>
      )}

      {/* オンライン決済対応フラグ */}
      <Field label="オンライン決済">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={onlinePurchasable}
            onChange={(e) => setOnlinePurchasable(e.target.checked)}
            className="w-5 h-5 accent-orange-500"
          />
          <span className="text-sm">
            オンライン決済に対応する
            <span className="text-xs text-sub block">
              ※ チェックするとフィルタで「オンライン決済対応」として表示されます
            </span>
          </span>
        </label>
      </Field>

      {availableAttributes.length > 0 && (
        <Field label="詳細属性・条件">
          <div className="space-y-4">
            {Object.entries(groupedAttrs).map(([group, attrs]) => (
              <div key={group}>
                <p className="text-xs font-bold text-sub mb-2">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {attrs.map((a) => {
                    const active = selectedAttrs.includes(a.id);
                    return (
                      <button
                        type="button"
                        key={a.id}
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
            ))}
          </div>
        </Field>
      )}

      {showPriceField && (
        <Field
          label={
            <>
              価格
              {isFreeDeal && (
                <span className="text-sub text-xs ml-2">
                  （あげます・求むは無料固定）
                </span>
              )}
            </>
          }
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sub">
              ¥
            </span>
            <input
              type="number"
              min={0}
              value={isFreeDeal ? "0" : price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isFreeDeal}
              className="input pl-8 disabled:bg-surface disabled:text-sub"
            />
          </div>
        </Field>
      )}

      <Field label="連絡先メール" required>
        <input
          type="email"
          required
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="input"
        />
      </Field>

      <Field
        label={
          <>
            写真
            <span className="text-sub text-xs ml-2 font-normal">
              (最大{MAX_IMAGES}枚 / 1枚{MAX_IMAGE_MB}MB以下、自動でWebPに最適化)
            </span>
          </>
        }
      >
        <div className="flex flex-wrap gap-3 mb-3">
          {existingImages.map((url, idx) => (
            <ImageThumb
              key={url}
              src={url}
              onRemove={() => removeExistingImage(url)}
              label={`画像${idx + 1}`}
            />
          ))}
          {newImagePreviews.map((p, i) => (
            <ImageThumb
              key={`new-${i}`}
              src={p}
              onRemove={() => removeNewImage(i)}
              label={`画像${existingImages.length + i + 1}`}
              isNew
            />
          ))}
        </div>
        {canAddMore && (
          <label className="block">
            <div className="border-2 border-dashed border-line rounded-card p-8 text-center hover:border-ink transition cursor-pointer">
              <div className="text-3xl mb-2">📷</div>
              <div className="font-semibold">写真を追加</div>
              <div className="text-sm text-sub mt-1">
                残り {MAX_IMAGES - totalImages} 枚
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddImages}
            />
          </label>
        )}
      </Field>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-line">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? "保存中..." : isEdit ? "更新する" : "出品する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-semibold mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: CategoryField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "select") {
    return (
      <label className="block">
        <span className="text-sm text-sub mb-1 block">{field.label}</span>
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || "")}
          className="input"
        >
          <option value="">選択してください</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (field.type === "number") {
    return (
      <label className="block">
        <span className="text-sm text-sub mb-1 block">
          {field.label}
          {field.unit && <span className="text-xs ml-1">({field.unit})</span>}
        </span>
        <input
          type="number"
          value={(value as number | string) ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          min={field.min}
          max={field.max}
          className="input"
        />
      </label>
    );
  }
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 cursor-pointer pt-6">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 accent-orange-500"
        />
        <span className="text-sm">{field.label}</span>
      </label>
    );
  }
  if (field.type === "date") {
    return (
      <label className="block">
        <span className="text-sm text-sub mb-1 block">{field.label}</span>
        <input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      </label>
    );
  }
  // text
  return (
    <label className="block">
      <span className="text-sm text-sub mb-1 block">{field.label}</span>
      <input
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        className="input"
      />
    </label>
  );
}

function ImageThumb({
  src,
  onRemove,
  label,
  isNew,
}: {
  src: string;
  onRemove: () => void;
  label: string;
  isNew?: boolean;
}) {
  return (
    <div className="relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label}
        className={`h-28 w-28 object-cover rounded-card ${
          isNew ? "ring-2 ring-accent ring-offset-1" : "border border-line"
        }`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-ink text-white rounded-full w-7 h-7 grid place-items-center text-sm shadow-airbnb hover:bg-accent transition"
        aria-label="削除"
      >
        ✕
      </button>
    </div>
  );
}
