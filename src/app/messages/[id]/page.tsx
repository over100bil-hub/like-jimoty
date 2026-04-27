import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import MessageThread from "./MessageThread";
import type { Conversation, Message, Post, Profile } from "@/types";

export const metadata = { title: "メッセージ | Machi-Chika" };
export const revalidate = 0;

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=/messages/${id}`);

  const { data: conv } = await supabase
    .from("conversations")
    .select("*, posts:post_id(id,title,images,price,deal_type,status,user_id)")
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();
  const c = conv as Conversation & { posts: Post | null };
  if (c.buyer_id !== user.id && c.seller_id !== user.id) notFound();

  const partnerId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
  const [{ data: messages }, { data: partnerProfile }] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("*").eq("id", partnerId).maybeSingle(),
  ]);

  // 既読フラグ
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const partner = partnerProfile as Profile | null;

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
      <Link
        href="/messages"
        className="text-sm text-sub hover:text-ink inline-flex items-center gap-1 ml-2 mb-3"
      >
        ← メッセージ一覧
      </Link>

      <div className="flex items-center gap-3 p-3 mx-2 mb-3 bg-surface rounded-card">
        {c.posts?.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.posts.images[0]}
            alt=""
            className="w-14 h-14 object-cover rounded-lg shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <Link
            href={`/posts/${c.post_id}`}
            className="font-semibold hover:underline line-clamp-1"
          >
            {c.posts?.title ?? "(削除された投稿)"}
          </Link>
          <div className="text-sm text-sub mt-0.5">
            相手: {partner?.nickname ?? "ユーザー"}
          </div>
        </div>
      </div>

      <MessageThread
        conversationId={id}
        currentUserId={user.id}
        partner={partner}
        initialMessages={(messages as Message[]) ?? []}
      />
    </div>
  );
}
