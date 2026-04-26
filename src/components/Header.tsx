"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import PostCTA from "./PostCTA";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .maybeSingle();
        setIsAdmin(!!prof?.is_admin);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_e, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .maybeSingle();
          setIsAdmin(!!prof?.is_admin);
        } else {
          setIsAdmin(false);
        }
      }
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 未読メッセージ件数（自分が当事者の会話に絞る）
  useEffect(() => {
    if (!user) return setUnread(0);
    const fetchUnread = async () => {
      // 自分の会話IDを取得
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      const ids = (convs ?? []).map((c: { id: string }) => c.id);
      if (ids.length === 0) return setUnread(0);
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids)
        .is("read_at", null)
        .neq("sender_id", user.id);
      setUnread(count ?? 0);
    };
    fetchUnread();
    const channel = supabase
      .channel("unread-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchUnread()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get("q") as string) ?? "";
    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* ロゴ */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-accent font-extrabold text-2xl tracking-tight shrink-0"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden
            >
              <path d="M16 1.39L19.95 9.41 28.8 10.7 22.4 17.07 23.9 26 16 21.78 8.1 26 9.6 17.07 3.2 10.7 12.05 9.41z" />
            </svg>
            <span className="hidden sm:inline">marche</span>
          </Link>

          {/* 検索バー (PC) */}
          <form
            onSubmit={onSearch}
            className="hidden md:flex search-pill items-center w-full max-w-xl px-2 py-1.5"
          >
            <input
              type="text"
              name="q"
              defaultValue={sp.get("q") ?? ""}
              placeholder="何をお探しですか？"
              className="flex-1 px-4 py-2 text-sm bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-brand hover:opacity-90 text-white rounded-full p-2.5 transition-opacity"
              aria-label="検索"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </form>

          {/* 右ナビ */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden sm:block">
              <PostCTA variant="compact" />
            </div>

            {/* メニュー */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 border border-line rounded-pill pl-3 pr-1.5 py-1.5 hover:shadow-airbnb transition-shadow"
                aria-label="メニュー"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
                <div className="relative w-7 h-7 rounded-full bg-sub text-white grid place-items-center text-xs font-semibold">
                  {user ? (user.email ?? "U")[0].toUpperCase() : "?"}
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] rounded-full min-w-[16px] h-[16px] grid place-items-center px-1 font-bold">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-airbnbLg border border-line py-2 z-50 overflow-hidden">
                    {user ? (
                      <>
                        <MenuLink
                          href="/messages"
                          onClick={() => setMenuOpen(false)}
                        >
                          メッセージ
                          {unread > 0 && (
                            <span className="ml-auto bg-accent text-white text-xs rounded-full px-2 py-0.5">
                              {unread}
                            </span>
                          )}
                        </MenuLink>
                        <MenuLink
                          href="/favorites"
                          onClick={() => setMenuOpen(false)}
                        >
                          お気に入り
                        </MenuLink>
                        <MenuLink
                          href="/mypage"
                          onClick={() => setMenuOpen(false)}
                        >
                          出品管理
                        </MenuLink>
                        <MenuLink
                          href="/profile/edit"
                          onClick={() => setMenuOpen(false)}
                        >
                          プロフィール編集
                        </MenuLink>
                        <MenuLink
                          href="/posts/new"
                          onClick={() => setMenuOpen(false)}
                        >
                          出品する
                        </MenuLink>
                        {isAdmin && (
                          <>
                            <div className="border-t border-line my-1" />
                            <MenuLink
                              href="/admin"
                              onClick={() => setMenuOpen(false)}
                            >
                              管理者ダッシュボード
                            </MenuLink>
                          </>
                        )}
                        <div className="border-t border-line my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-3 hover:bg-surface text-sm"
                        >
                          ログアウト
                        </button>
                      </>
                    ) : (
                      <>
                        <MenuLink
                          href="/auth/signup"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="font-semibold">新規登録</span>
                        </MenuLink>
                        <MenuLink
                          href="/auth/login"
                          onClick={() => setMenuOpen(false)}
                        >
                          ログイン
                        </MenuLink>
                        <div className="border-t border-line my-1" />
                        <MenuLink
                          href="/posts/new"
                          onClick={() => setMenuOpen(false)}
                        >
                          出品する
                        </MenuLink>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 検索バー (mobile, トップのみ) */}
        {isHome && (
          <form
            onSubmit={onSearch}
            className="md:hidden pb-3 search-pill flex items-center px-3 py-1 mx-1 mb-3"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-sub"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={sp.get("q") ?? ""}
              placeholder="何をお探しですか？"
              className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
            />
          </form>
        )}
      </div>
    </header>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-4 py-3 hover:bg-surface text-sm"
    >
      {children}
    </Link>
  );
}
