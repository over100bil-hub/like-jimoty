import Link from "next/link";
import type { Post } from "@/types";

export default function HeroFreeList({
  posts,
  prefSlug,
}: {
  posts: Post[];
  prefSlug?: string;
}) {
  if (posts.length === 0) return null;
  const basePath = prefSlug ? `/${prefSlug}` : "";
  const postPath = (id: string) =>
    prefSlug ? `/${prefSlug}/posts/${id}` : `/posts/${id}`;

  return (
    <section className="bg-gradient-to-br from-accent-soft to-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
            <span className="bg-gradient-brand text-white text-xs px-2 py-1 rounded-pill">
              無料
            </span>
            <span className="text-ink">あげます・お譲りします（新着）</span>
          </h2>
          <Link
            href={`${basePath}?deal=give`}
            className="text-xs sm:text-sm font-semibold text-accent hover:underline"
          >
            すべて見る →
          </Link>
        </div>
        <div className="scroll-x flex gap-3 sm:gap-4 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={postPath(p.id)}
              className="shrink-0 w-32 sm:w-40 group"
            >
              <div className="aspect-square rounded-card overflow-hidden bg-white border border-line shadow-airbnb relative">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-3xl text-sub">
                    🎁
                  </div>
                )}
                <span className="absolute top-1.5 left-1.5 bg-gradient-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-pill shadow-airbnb">
                  あげます
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm font-semibold line-clamp-2 text-ink">
                {p.title}
              </p>
              {p.prefectures?.name && (
                <p className="text-[10px] sm:text-xs text-sub mt-0.5">
                  {p.prefectures.name}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
