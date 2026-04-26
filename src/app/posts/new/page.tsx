import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import type { Category, Prefecture, DealType } from "@/types";

export const metadata = { title: "投稿する | marche" };

// type パラメータ → { categorySlug, deal_type, headline }
const TYPE_PRESETS: Record<
  string,
  { categorySlug: string | null; deal: DealType; headline: string }
> = {
  "sell-give": { categorySlug: null, deal: "sell", headline: "売ります・あげます" },
  vehicles: { categorySlug: "vehicles", deal: "sell", headline: "中古車" },
  foster: { categorySlug: "foster", deal: "give", headline: "里親募集" },
  members: { categorySlug: "members", deal: "wanted", headline: "メンバー募集" },
  community: { categorySlug: "community", deal: "wanted", headline: "助け合い" },
  "jobs-parttime": {
    categorySlug: "jobs-parttime",
    deal: "wanted",
    headline: "アルバイト",
  },
  "jobs-fulltime": {
    categorySlug: "jobs-fulltime",
    deal: "wanted",
    headline: "正社員",
  },
  lesson: { categorySlug: "lesson", deal: "sell", headline: "教室・スクール" },
  events: { categorySlug: "events", deal: "give", headline: "イベント" },
  realestate: { categorySlug: "realestate", deal: "sell", headline: "不動産" },
  localshop: { categorySlug: "localshop", deal: "sell", headline: "地元のお店" },
};

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; deal?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const qs = new URLSearchParams();
    if (params.type) qs.set("type", params.type);
    if (params.deal) qs.set("deal", params.deal);
    const redirectUrl = qs.toString()
      ? `/posts/new?${qs.toString()}`
      : "/posts/new";
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  const [{ data: categories }, { data: prefectures }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("prefectures").select("*").order("sort_order"),
  ]);

  const cats = (categories as Category[]) ?? [];

  // type プリセット優先 → なければ deal クエリ
  let initialDeal: DealType | undefined;
  let initialCategoryId: number | undefined;
  let headline = "投稿する";

  if (params.type && TYPE_PRESETS[params.type]) {
    const preset = TYPE_PRESETS[params.type];
    initialDeal = preset.deal;
    headline = preset.headline;
    if (preset.categorySlug) {
      const matched = cats.find((c) => c.slug === preset.categorySlug);
      if (matched) initialCategoryId = matched.id;
    }
  } else if (
    params.deal === "sell" ||
    params.deal === "give" ||
    params.deal === "wanted"
  ) {
    initialDeal = params.deal;
    const headlineMap: Record<DealType, string> = {
      sell: "売ります",
      give: "あげます",
      wanted: "求む",
    };
    headline = headlineMap[params.deal];
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-gradient">{headline}</span>
      </h1>
      <p className="text-sub mb-8">
        商品の魅力が伝わるように、写真と説明をしっかり書きましょう。
      </p>
      <PostForm
        categories={cats}
        prefectures={(prefectures as Prefecture[]) ?? []}
        userId={user.id}
        userEmail={user.email ?? ""}
        initialDeal={initialDeal}
        initialCategoryId={initialCategoryId}
      />
    </div>
  );
}
