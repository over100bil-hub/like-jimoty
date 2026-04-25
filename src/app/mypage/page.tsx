import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Post, Profile } from "@/types";
import PostCard from "@/components/PostCard";

export const metadata = { title: "マイページ | marche" };

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const current = tab ?? "active";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/mypage");

  const statusFilter =
    current === "closed" ? "closed" : current === "all" ? null : "active";

  let query = supabase
    .from("posts")
    .select("*, categories(name,slug), prefectures(name)")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });
  if (statusFilter) query = query.eq("status", statusFilter);
  const { data: posts } = await query;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as Profile | null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-surface grid place-items-center text-2xl font-bold overflow-hidden">
          {p?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            (p?.nickname ?? user.email ?? "U")[0].toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {p?.nickname ?? "ユーザー"}
          </h1>
          <p className="text-sub text-sm">{user.email}</p>
        </div>
        <Link href="/profile/edit" className="btn-outline">
          プロフィール編集
        </Link>
      </div>

      <div className="flex items-center gap-1 border-b border-line mb-6 overflow-x-auto">
        {[
          { v: "active", l: "公開中" },
          { v: "closed", l: "取引終了" },
          { v: "all", l: "すべて" },
        ].map((t) => (
          <Link
            key={t.v}
            href={`/mypage?tab=${t.v}`}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              current === t.v
                ? "border-ink text-ink"
                : "border-transparent text-sub hover:text-ink"
            }`}
          >
            {t.l}
          </Link>
        ))}
        <Link href="/posts/new" className="ml-auto btn-primary text-sm">
          ＋ 出品する
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-sub mb-4">該当する投稿がありません</p>
          <Link href="/posts/new" className="btn-primary inline-block">
            最初の出品をする
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
          {(posts as Post[]).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
