import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import type { Category, Prefecture, DealType } from "@/types";

export const metadata = { title: "投稿する | marche" };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ deal?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const redirectUrl = params.deal
      ? `/posts/new?deal=${params.deal}`
      : "/posts/new";
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  const [{ data: categories }, { data: prefectures }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("prefectures").select("*").order("sort_order"),
  ]);

  const dealParam = params.deal;
  const initialDeal: DealType | undefined =
    dealParam === "sell" || dealParam === "give" || dealParam === "wanted"
      ? dealParam
      : undefined;

  const headlineMap: Record<DealType, string> = {
    sell: "売ります",
    give: "あげます",
    wanted: "求む",
  };
  const headline = initialDeal ? headlineMap[initialDeal] : "投稿する";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-gradient">{headline}</span>
      </h1>
      <p className="text-sub mb-8">
        商品の魅力が伝わるように、写真と説明をしっかり書きましょう。
      </p>
      <PostForm
        categories={(categories as Category[]) ?? []}
        prefectures={(prefectures as Prefecture[]) ?? []}
        userId={user.id}
        userEmail={user.email ?? ""}
        initialDeal={initialDeal}
      />
    </div>
  );
}
