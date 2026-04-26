import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "./DeleteButton";
import StatusToggle from "./StatusToggle";
import ContactSection from "./ContactSection";
import ImageGallery from "./ImageGallery";
import FavoriteButton from "@/components/FavoriteButton";
import type { Post, Category } from "@/types";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import {
  getCategoryFields,
  resolveTopCategorySlug,
  fieldValueToLabel,
} from "@/lib/categoryFields";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, description, images")
    .eq("id", id)
    .single();
  if (!post) return { title: "投稿が見つかりません | marche" };
  return {
    title: `${post.title} | marche`,
    description: post.description?.slice(0, 140),
    openGraph: {
      title: post.title,
      description: post.description?.slice(0, 140),
      images: post.images?.[0] ? [post.images[0]] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description?.slice(0, 140),
      images: post.images?.[0] ? [post.images[0]] : [],
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "*, categories(name,slug), prefectures(name), profiles(nickname,avatar_url,bio)"
    )
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  try {
    await supabase.rpc("increment_view_count" as never, { post_id: id });
  } catch (e) {
    console.warn("[increment_view_count]", e);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const p = post as Post;
  const isOwner = user?.id === p.user_id;

  // カテゴリ別フィールド: attrs から表示用に構造化
  const { data: catsRaw } = await supabase
    .from("categories")
    .select("id,slug,parent_id");
  const cats = (catsRaw as Category[]) ?? [];
  const topSlug = resolveTopCategorySlug(p.category_id, cats);
  const categoryFields = getCategoryFields(topSlug);
  const attrs = (p.attrs ?? {}) as Record<string, unknown>;
  const specRows = categoryFields
    .map((f) => ({
      label: f.label,
      value: fieldValueToLabel(f, attrs[f.key]),
    }))
    .filter((row) => row.value !== "");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-sub hover:text-ink inline-flex items-center gap-1"
        >
          ← 戻る
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
        {p.title}
      </h1>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5 text-sm text-sub">
        <div className="flex items-center gap-2">
          {p.prefectures?.name && <span>📍 {p.prefectures.name}</span>}
          {p.categories?.name && <span>・ {p.categories.name}</span>}
          <span>・ {formatRelativeTime(p.created_at)}</span>
          <span>・ {p.view_count} 回閲覧</span>
        </div>
        <div className="flex items-center gap-2">
          {!isOwner && <FavoriteButton postId={p.id} variant="inline" size="sm" />}
        </div>
      </div>

      <ImageGallery images={p.images ?? []} title={p.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 投稿者 */}
          <div className="flex items-center gap-3 pb-6 border-b border-line">
            <div className="w-12 h-12 rounded-full bg-surface grid place-items-center font-bold text-lg overflow-hidden">
              {p.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.profiles.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                (p.profiles?.nickname ?? "U")[0]
              )}
            </div>
            <div>
              <div className="font-semibold">
                {p.profiles?.nickname ?? "ユーザー"}
              </div>
              <div className="text-sm text-sub">出品者</div>
            </div>
          </div>

          {/* スペック */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-line">
            {p.condition && (
              <Spec label="商品の状態" value={p.condition} />
            )}
            <Spec
              label="取引タイプ"
              value={
                p.deal_type === "give"
                  ? "あげます"
                  : p.deal_type === "wanted"
                  ? "求む"
                  : "売ります"
              }
            />
            <Spec
              label="エリア"
              value={p.prefectures?.name ?? "全国"}
            />
            <Spec
              label="ステータス"
              value={p.status === "active" ? "公開中" : "取引終了"}
            />
          </div>

          {/* カテゴリ別 詳細スペック */}
          {specRows.length > 0 && (
            <div>
              <h2 className="font-bold text-xl mb-3">詳細情報</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 border border-line rounded-card overflow-hidden">
                {specRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex border-b border-line last:border-b-0 sm:border-b sm:[&:nth-last-child(-n+2)]:border-b-0"
                  >
                    <dt className="w-32 px-3 py-2 bg-surface text-xs text-sub flex items-center">
                      {row.label}
                    </dt>
                    <dd className="flex-1 px-3 py-2 text-sm font-semibold">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* オンライン決済バッジ */}
          {p.online_purchasable && (
            <div className="bg-gradient-brand text-white text-sm font-bold px-4 py-3 rounded-card flex items-center gap-2">
              <span>💳</span>
              <span>オンライン決済対応</span>
            </div>
          )}

          {/* 説明 */}
          <div>
            <h2 className="font-bold text-xl mb-3">商品説明</h2>
            <p className="whitespace-pre-wrap leading-relaxed">
              {p.description}
            </p>
          </div>

          {isOwner && (
            <div className="pt-6 border-t border-line space-y-3">
              <h3 className="font-bold">出品者メニュー</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/posts/${p.id}/edit`}
                  className="btn-outline"
                >
                  編集する
                </Link>
                <StatusToggle
                  postId={p.id}
                  currentStatus={p.status}
                />
                <DeleteButton postId={p.id} />
              </div>
            </div>
          )}
        </div>

        {/* 価格 + CTA */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-card border border-line p-6 shadow-airbnb">
            <div className="text-3xl font-bold mb-1">
              {formatPrice(p.price, p.deal_type)}
            </div>
            <div className="text-sub text-sm mb-5">
              {p.deal_type === "give"
                ? "無料で譲ります"
                : p.deal_type === "wanted"
                ? "募集中"
                : "送料込みかは出品者にご確認ください"}
            </div>
            {p.status !== "active" ? (
              <div className="bg-surface text-sub text-center py-4 rounded-xl font-semibold">
                取引終了
              </div>
            ) : isOwner ? (
              <div className="bg-accent-soft text-accent text-center py-3 rounded-xl text-sm">
                あなたが出品した商品です
              </div>
            ) : (
              <ContactSection postId={p.id} sellerId={p.user_id} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-sub mb-1">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
