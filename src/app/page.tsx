import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import type { Post, Category, Prefecture, Announcement } from "@/types";
import CategoryTabs from "@/components/CategoryTabs";
import FilterChips from "@/components/FilterChips";
import PostCard from "@/components/PostCard";
import HeroFreeList from "@/components/HeroFreeList";
import CategoryFullList from "@/components/CategoryFullList";
import Sidebar from "@/components/Sidebar";
import PostCTA from "@/components/PostCTA";

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
        "*, categories(name,slug), prefectures(name), profiles(nickname,avatar_url)"
      )
      .eq("status", "active")
      .eq("deal_type", "give")
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
      "*, categories(name,slug), prefectures(name), profiles(nickname,avatar_url)"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) {
      // 親カテゴリ選択時は子カテゴリの投稿も含める
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
      <Suspense fallback={<div className="h-32 border-b border-line" />}>
        <CategoryTabs categories={categories} />
      </Suspense>

      {/* 無料で譲ります 新着 */}
      {!params.category && !params.q && !params.deal && (
        <HeroFreeList posts={freePosts} />
      )}

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

      {/* 下部: カテゴリ全一覧 ＋ サイドバー */}
      <div className="border-t border-line bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <CategoryFullList categories={categories} />
            </div>
            <div>
              <Sidebar announcements={announcements} />
            </div>
          </div>
        </div>
      </div>

      {/* mobile fab: 投稿プルダウン */}
      <div className="sm:hidden fixed bottom-5 right-5 z-30">
        <PostCTA variant="fab" />
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-3">🔍</div>
      <h2 className="text-xl font-bold mb-2">該当する投稿が見つかりません</h2>
      <p className="text-sub mb-6">条件を変えて検索してみてください</p>
      <Link href="/" className="inline-block btn-brand-outline">
        条件をリセット
      </Link>
    </div>
  );
}
