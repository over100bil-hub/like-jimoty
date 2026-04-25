import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const [
    { count: usersCount },
    { count: activePosts },
    { count: closedPosts },
    { count: deletedPosts },
    { count: convCount },
    { count: msgCount },
    { count: unreadInq },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "closed"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "deleted"),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase
      .from("contact_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const stats = [
    { label: "ユーザー", value: usersCount ?? 0, color: "bg-blue-50 text-blue-700" },
    { label: "公開中の投稿", value: activePosts ?? 0, color: "bg-green-50 text-green-700" },
    { label: "取引終了", value: closedPosts ?? 0, color: "bg-amber-50 text-amber-700" },
    { label: "削除済み", value: deletedPosts ?? 0, color: "bg-gray-100 text-gray-700" },
    { label: "会話数", value: convCount ?? 0, color: "bg-purple-50 text-purple-700" },
    { label: "メッセージ総数", value: msgCount ?? 0, color: "bg-indigo-50 text-indigo-700" },
    { label: "未読のお問い合わせ", value: unreadInq ?? 0, color: "bg-accent-soft text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-card p-5 ${s.color}`}
        >
          <div className="text-xs font-semibold mb-2">{s.label}</div>
          <div className="text-3xl font-bold">{s.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
