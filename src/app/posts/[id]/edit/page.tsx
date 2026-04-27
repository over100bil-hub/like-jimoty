import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import type { Category, Prefecture, Post } from "@/types";

export const metadata = { title: "投稿を編集 | Machi-Chika" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: post }, { data: categories }, { data: prefectures }] =
    await Promise.all([
      supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("prefectures").select("*").order("sort_order"),
    ]);

  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-8">投稿を編集</h1>
      <PostForm
        categories={(categories as Category[]) ?? []}
        prefectures={(prefectures as Prefecture[]) ?? []}
        userId={user.id}
        userEmail={user.email ?? ""}
        post={post as Post}
      />
    </div>
  );
}
