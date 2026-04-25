import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import type { Category, Prefecture } from "@/types";

export const metadata = { title: "出品する | marche" };

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/posts/new");

  const [{ data: categories }, { data: prefectures }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("prefectures").select("*").order("sort_order"),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-2">出品する</h1>
      <p className="text-sub mb-8">
        商品の魅力が伝わるように、写真と説明をしっかり書きましょう。
      </p>
      <PostForm
        categories={(categories as Category[]) ?? []}
        prefectures={(prefectures as Prefecture[]) ?? []}
        userId={user.id}
        userEmail={user.email ?? ""}
      />
    </div>
  );
}
