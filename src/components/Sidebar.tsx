import Link from "next/link";
import type { Announcement } from "@/types";

export default function Sidebar({
  announcements,
  prefSlug,
}: {
  announcements: Announcement[];
  prefSlug?: string;
}) {
  const newPath = (deal: string) =>
    prefSlug ? `/${prefSlug}/posts/new?deal=${deal}` : `/posts/new?deal=${deal}`;
  return (
    <aside className="space-y-6">
      {/* お知らせ */}
      <section className="bg-white border border-line rounded-card overflow-hidden">
        <header className="bg-gradient-brand text-white px-4 py-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.92V4a1 1 0 1 0-2 0v1.08A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <h3 className="font-bold text-sm">お知らせ</h3>
        </header>
        <ul className="divide-y divide-line">
          {announcements.length === 0 ? (
            <li className="px-4 py-3 text-sm text-sub">お知らせはありません</li>
          ) : (
            announcements.map((a) => (
              <li key={a.id}>
                {a.url ? (
                  <Link
                    href={a.url}
                    className="block px-4 py-3 hover:bg-accent-soft transition"
                  >
                    <p className="text-sm font-semibold text-ink line-clamp-2">
                      {a.title}
                    </p>
                    <p className="text-xs text-sub mt-1">
                      {new Date(a.published_at).toLocaleDateString("ja-JP")}
                    </p>
                  </Link>
                ) : (
                  <div className="block px-4 py-3">
                    <p className="text-sm font-semibold text-ink line-clamp-2">
                      {a.title}
                    </p>
                    <p className="text-xs text-sub mt-1">
                      {new Date(a.published_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </section>

      {/* 投稿・取引ガイド */}
      <section className="bg-white border border-line rounded-card overflow-hidden">
        <header className="bg-gradient-brand text-white px-4 py-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h10v2H4v-2zm0 4h10v2H4v-2zM18 12l4 4-4 4v-3h-2v-2h2v-3z" />
          </svg>
          <h3 className="font-bold text-sm">投稿・取引ガイド</h3>
        </header>
        <ul className="divide-y divide-line">
          <GuideLink href={newPath("sell")} icon="💴" title="売ります" sub="値段をつけて出品する方法" />
          <GuideLink href={newPath("give")} icon="🎁" title="あげます" sub="無料でお譲りする方法" />
          <GuideLink href={newPath("wanted")} icon="🙋" title="求む" sub="欲しいものを募集する" />
          <GuideLink href="/about" icon="📘" title="サービス紹介" sub="Machi-Chikaの使い方" />
          <GuideLink href="/terms" icon="🛡️" title="利用規約" sub="安全に使うために" />
          <GuideLink href="/contact" icon="💬" title="お問い合わせ" sub="サポートに連絡する" />
        </ul>
      </section>

      {/* 安全な取引のために */}
      <section className="bg-white border border-line rounded-card overflow-hidden">
        <header className="px-4 py-3 border-b border-line">
          <h3 className="font-bold text-sm text-ink">安全な取引のために</h3>
        </header>
        <ul className="px-4 py-3 space-y-2 text-xs text-sub">
          <li>• 直接会う場合は人通りの多い場所で</li>
          <li>• 個人情報の取り扱いに注意</li>
          <li>• 不審な取引は運営に通報</li>
        </ul>
      </section>
    </aside>
  );
}

function GuideLink({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3 hover:bg-accent-soft transition"
      >
        <span className="text-xl">{icon}</span>
        <span className="flex-1">
          <span className="block text-sm font-bold text-ink">{title}</span>
          <span className="block text-xs text-sub">{sub}</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-accent"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </li>
  );
}
