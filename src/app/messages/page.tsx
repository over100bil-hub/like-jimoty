import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { Conversation, Post, Profile } from "@/types";

export const metadata = { title: "メッセージ | Machi-Chika" };
export const revalidate = 0;

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/messages");

  const { data: convs } = await supabase
    .from("conversations")
    .select("*, posts:post_id(id,title,images,price,deal_type,status)")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const list = (convs as (Conversation & { posts: Post | null })[]) ?? [];
  const partnerIds = Array.from(
    new Set(list.map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id)))
  );
  const profilesMap = new Map<string, Profile>();
  if (partnerIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in("id", partnerIds);
    for (const p of (profs as Profile[]) ?? []) profilesMap.set(p.id, p);
  }

  // 各会話の最新メッセージと未読件数
  const items: Array<{
    c: Conversation & { posts: Post | null };
    partner: Profile | null;
    latest: { body: string; created_at: string } | null;
    unread: number;
  }> = [];
  for (const c of list) {
    const [{ data: latest }, { count: unread }] = await Promise.all([
      supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .is("read_at", null)
        .neq("sender_id", user.id),
    ]);
    const partnerId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
    items.push({
      c,
      partner: profilesMap.get(partnerId) ?? null,
      latest: latest as { body: string; created_at: string } | null,
      unread: unread ?? 0,
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">メッセージ</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-sub">まだメッセージはありません</p>
        </div>
      ) : (
        <ul className="divide-y divide-line border border-line rounded-card overflow-hidden bg-white">
          {items.map(({ c, partner, latest, unread }) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-start gap-3 p-4 hover:bg-surface transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-surface grid place-items-center font-bold overflow-hidden shrink-0">
                  {partner?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (partner?.nickname ?? "U")[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold truncate">
                      {partner?.nickname ?? "ユーザー"}
                    </div>
                    <div className="text-xs text-sub shrink-0">
                      {formatRelativeTime(
                        latest?.created_at ?? c.last_message_at
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-sub truncate">
                    {c.posts?.title ?? "(削除された投稿)"}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div
                      className={`text-sm truncate ${
                        unread > 0 ? "text-ink font-semibold" : "text-sub"
                      }`}
                    >
                      {latest?.body ?? "メッセージはまだありません"}
                    </div>
                    {unread > 0 && (
                      <span className="bg-accent text-white text-xs rounded-full px-2 py-0.5 shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
                {c.posts?.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.posts.images[0]}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg shrink-0"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
