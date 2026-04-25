import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import type { Post, Category, Prefecture } from "@/types";
import CategoryTabs from "@/components/CategoryTabs";
import FilterChips from "@/components/FilterChips";
import PostCard from "@/components/PostCard";

export const revalidate = 30;

type SearchParams = {
  category?: string;
  prefecture?: string;
  q?: string;
  deal?: string;
  min?: string;
  max?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: categoriesRaw }, { data: prefecturesRaw }] = await Promise.all(
    [
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("prefectures").select("*").order("sort_order"),
    ]
  );
  const categories = (categoriesRaw as Category[]) ?? [];
  const prefectures = (prefecturesRaw as Prefecture[]) ?? [];

  let query = supabase
    .from("posts")
    .select("*, categories(name,slug), prefectures(name), profiles(nickname,avatar_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (params.prefecture) {
    query = query.eq("prefecture_id", Number(params.prefecture));
  }
  if (params.deal) {
    query = query.eq("deal_type", params.deal);
  }
  if (params.min) query = query.gte("price", Number(params.min));
  if (params.max) query = query.lte("price", Number(params.max));
  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }

  const { data: posts } = await query;
  const list = (posts as Post[]) ?? [];

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-line" />}>
        <CategoryTabs categories={categories} />
      </Suspense>
      <Suspense fallback={<div className="h-14 border-b border-line" />}>
        <FilterChips prefectures={prefectures} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
            {list.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>

      {/* mobile fab */}
      <Link
        href="/posts/new"
        className="sm:hidden fixed bottom-5 right-5 z-30 bg-accent hover:bg-accent-hover text-white font-semibold pl-5 pr-6 py-3.5 rounded-pill shadow-airbnbLg flex items-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
        出品する
      </Link>
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-3">🔍</div>
      <h2 className="text-xl font-bold mb-2">該当する投稿が見つかりません</h2>
      <p className="text-sub mb-6">条件を変えて検索してみてください</p>
      <Link
        href="/"
        className="inline-block btn-outline"
      >
        条件をリセット
      </Link>
    </div>
  );
}
