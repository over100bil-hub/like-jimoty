import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Prefecture } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 300;
export const metadata = { title: "都道府県を選ぶ | Machi-Chika" };

const REGION_ORDER = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州",
  "沖縄",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const savedPref = cookieStore.get("pref_slug")?.value;
  // ?reset=1 が無く、Cookieがあれば自動リダイレクト
  // ?reset=1 のときはmiddlewareがCookieを削除するため、ここでは選択画面を表示
  if (!sp.reset && savedPref) {
    redirect(`/${savedPref}`);
  }

  const supabase = await createClient();
  const { data: prefsRaw } = await supabase
    .from("prefectures")
    .select("*")
    .order("sort_order");
  const prefectures = (prefsRaw as Prefecture[]) ?? [];

  const grouped = new Map<string, Prefecture[]>();
  prefectures.forEach((p) => {
    const r = p.region ?? "その他";
    const list = grouped.get(r) ?? [];
    list.push(p);
    grouped.set(r, list);
  });

  return (
    <div className="bg-gradient-to-br from-accent-soft via-white to-accent-soft min-h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">
            <span className="text-gradient">お住まいの地域</span>
            を選んでください
          </h1>
          <p className="text-sub text-sm sm:text-base">
            ジモティのように地域別で投稿が表示されます
          </p>
        </div>

        {/* 主要都市ショートカット */}
        <section className="mb-10">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="bg-gradient-brand text-white text-[10px] px-2 py-0.5 rounded-pill">
              人気
            </span>
            主要エリア
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["tokyo", "osaka", "aichi", "fukuoka"].map((slug) => {
              const p = prefectures.find((x) => x.slug === slug);
              if (!p) return null;
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="bg-white border-2 border-transparent hover:border-accent rounded-card p-5 text-center shadow-airbnb hover:shadow-airbnbLg transition group"
                >
                  <div className="text-2xl font-extrabold text-gradient">
                    {p.name}
                  </div>
                  <div className="text-xs text-sub mt-1 group-hover:text-accent">
                    投稿を見る →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 地方別 */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold">すべての都道府県</h2>
          {REGION_ORDER.map((region) => {
            const list = grouped.get(region);
            if (!list || list.length === 0) return null;
            return (
              <div
                key={region}
                className="bg-white border border-line rounded-card overflow-hidden"
              >
                <div className="px-4 py-2 bg-accent-soft border-b border-line">
                  <h3 className="font-bold text-sm text-ink">{region}</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 divide-x divide-y divide-line">
                  {list.map((p) => (
                    <Link
                      key={p.id}
                      href={`/${p.slug}`}
                      className="px-3 py-3 text-sm font-semibold text-ink hover:bg-accent-soft hover:text-accent text-center transition"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
