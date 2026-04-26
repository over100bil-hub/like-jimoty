import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Post, Category, Prefecture, Announcement } from "@/types";
import CategoryTabs from "@/components/CategoryTabs";
import FilterChips from "@/components/FilterChips";
import PostCard from "@/components/PostCard";
import HeroFreeList from "@/components/HeroFreeList";
import HeroSlider from "@/components/HeroSlider";
import CategoryFullList from "@/components/CategoryFullList";
import Sidebar from "@/components/Sidebar";
import PostCTA from "@/components/PostCTA";

export const revalidate = 30;

type SearchParams = {
  category?: string;
  q?: string;
  deal?: string;
  min?: string;
  max?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string }>;
}) {
  const { pref } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("prefectures")
    .select("name")
    .eq("slug", pref)
    .maybeSingle();
  return {
    title: data?.name
      ? `${data.name}の投稿一覧 | marche`
      : "投稿一覧 | marche",
  };
}

export default async function PrefHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ pref: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { pref: prefSlug } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: prefRow } = await supabase
    .from("prefectures")
    .select("*")
    .eq("slug", prefSlug)
    .maybeSingle();
  if (!prefRow) notFound();
  const prefecture = prefRow as Prefecture;

  // ※pref_slugのCookie保存はmiddlewareで実施

  const [
    { data: categoriesRaw },
    { data: prefecturesRaw },
    { data: announcementsRaw },
    { data: freePostsRaw },
  ] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("prefectures").select("*").order("sort_order"),
    supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select(
        "*, categories(name,slug), prefectures(name,slug), profiles(nickname,avatar_url)"
      )
      .eq("status", "active")
      .eq("deal_type", "give")
      .eq("prefecture_id", prefecture.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const categories = (categoriesRaw as Category[]) ?? [];
  const prefectures = (prefecturesRaw as Prefecture[]) ?? [];
  const announcements = (announcementsRaw as Announcement[]) ?? [];
  const freePosts = (freePostsRaw as Post[]) ?? [];

  let query = supabase
    .from("posts")
    .select(
      "*, categories(name,slug), prefectures(name,slug), profiles(nickname,avatar_url)"
    )
    .eq("status", "active")
    .eq("prefecture_id", prefecture.id)
    .order("created_at", { ascending: false })
    .limit(60);

  if (sp.category) {
    const cat = categories.find((c) => c.slug === sp.category);
    if (cat) {
      const isParent = !cat.parent_id;
      if (isParent) {
        const childIds = categories
          .filter((c) => c.parent_id === cat.id)
          .map((c) => c.id);
        const ids = [cat.id, ...childIds];
        query = query.in("category_id", ids);
      } else {
        query = query.eq("category_id", cat.id);
      }
    }
  }
  if (sp.deal) query = query.eq("deal_type", sp.deal);
  if (sp.min) query = query.gte("price", Number(sp.min));
  if (sp.max) query = query.lte("price", Number(sp.max));
  if (sp.q) {
    query = query.or(
      `title.ilike.%${sp.q}%,description.ilike.%${sp.q}%`
    );
  }

  const { data: posts } = await query;
  const list = (posts as Post[]) ?? [];

  return (
    <>
      <div className="bg-gradient-to-r from-accent-soft to-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <span className="text-gradient">{prefecture.name}</span>
            <span className="text-sub text-xs sm:text-sm font-normal">
              の投稿一覧
            </span>
          </h1>
          <Link
            href="/?reset=1"
            className="text-xs sm:text-sm font-semibold text-accent hover:underline"
          >
            地域を変更 →
          </Link>
        </div>
      </div>

      {!sp.category && !sp.q && !sp.deal && !sp.min && !sp.max && (
        <HeroSlider />
      )}

      <Suspense fallback={<div className="h-32 border-b border-line" />}>
        <CategoryTabs categories={categories} prefSlug={prefSlug} />
      </Suspense>

      {!sp.category && !sp.q && !sp.deal && (
        <HeroFreeList posts={freePosts} prefSlug={prefSlug} />
      )}

      <Suspense fallback={<div className="h-14 border-b border-line" />}>
        <FilterChips prefectures={prefectures} hidePrefecture />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {list.length === 0 ? (
          <EmptyState prefSlug={prefSlug} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
            {list.map((p) => (
              <PostCard key={p.id} post={p} prefSlug={prefSlug} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-line bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <CategoryFullList categories={categories} prefSlug={prefSlug} />
            </div>
            <div>
              <Sidebar announcements={announcements} prefSlug={prefSlug} />
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden fixed bottom-5 right-5 z-30">
        <PostCTA variant="fab" prefSlug={prefSlug} />
      </div>
    </>
  );
}

function EmptyState({ prefSlug }: { prefSlug: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-3">🔍</div>
      <h2 className="text-xl font-bold mb-2">該当する投稿が見つかりません</h2>
      <p className="text-sub mb-6">条件を変えて検索してみてください</p>
      <Link href={`/${prefSlug}`} className="inline-block btn-brand-outline">
        条件をリセット
      </Link>
    </div>
  );
}
