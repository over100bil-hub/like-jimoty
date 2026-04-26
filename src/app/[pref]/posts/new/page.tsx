import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import type { Category, Prefecture, DealType } from "@/types";

export const metadata = { title: "投稿する | marche" };

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
  hotel: { categorySlug: "hotel", deal: "sell", headline: "ホテル・宿泊施設" },
};

export default async function NewPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ pref: string }>;
  searchParams: Promise<{ type?: string; deal?: string }>;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const qs = new URLSearchParams();
    if (sp.type) qs.set("type", sp.type);
    if (sp.deal) qs.set("deal", sp.deal);
    const redirectUrl = qs.toString()
      ? `/${prefSlug}/posts/new?${qs.toString()}`
      : `/${prefSlug}/posts/new`;
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  const [{ data: categories }, { data: prefectures }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("prefectures").select("*").order("sort_order"),
  ]);
  const cats = (categories as Category[]) ?? [];

  let initialDeal: DealType | undefined;
  let initialCategoryId: number | undefined;
  let headline = "投稿する";

  if (sp.type && TYPE_PRESETS[sp.type]) {
    const preset = TYPE_PRESETS[sp.type];
    initialDeal = preset.deal;
    headline = preset.headline;
    if (preset.categorySlug) {
      const matched = cats.find((c) => c.slug === preset.categorySlug);
      if (matched) initialCategoryId = matched.id;
    }
  } else if (
    sp.deal === "sell" ||
    sp.deal === "give" ||
    sp.deal === "wanted"
  ) {
    initialDeal = sp.deal;
    const headlineMap: Record<DealType, string> = {
      sell: "売ります",
      give: "あげます",
      wanted: "求む",
    };
    headline = headlineMap[sp.deal];
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-accent">
        📍 {prefecture.name}
      </div>
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
        initialPrefectureId={prefecture.id}
      />
    </div>
  );
}
