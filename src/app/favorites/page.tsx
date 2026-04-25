import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Post } from "@/types";
import PostCard from "@/components/PostCard";

export const metadata = { title: "お気に入り | marche" };
export const revalidate = 0;

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/favorites");

  const { data } = await supabase
    .from("favorites")
    .select(
      "post_id, posts(*, categories(name,slug), prefectures(name), profiles(nickname,avatar_url))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const posts =
    (data as unknown as { posts: Post | Post[] | null }[] | null)
      ?.map((r) => (Array.isArray(r.posts) ? r.posts[0] : r.posts))
      .filter((p): p is Post => !!p && p.status === "active") ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      <h1 className="text-3xl font-bold mb-6">お気に入り</h1>
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🤍</div>
          <p className="text-sub mb-4">まだお気に入りはありません</p>
          <Link href="/" className="btn-primary inline-block">
            探しに行く
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
