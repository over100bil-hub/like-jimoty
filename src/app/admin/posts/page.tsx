import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminPostActions from "./AdminPostActions";
import type { Post } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("posts")
    .select("*, categories(name), prefectures(name), profiles(nickname)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (sp.status && sp.status !== "all") q = q.eq("status", sp.status);
  if (sp.q) q = q.ilike("title", `%${sp.q}%`);
  const { data } = await q;
  const posts = (data as Post[]) ?? [];

  return (
    <div>
      <form className="flex gap-2 mb-4 flex-wrap" action="/admin/posts">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="タイトル検索"
          className="input max-w-xs"
        />
        <select name="status" defaultValue={sp.status ?? "all"} className="input max-w-[180px]">
          <option value="all">すべて</option>
          <option value="active">公開中</option>
          <option value="closed">取引終了</option>
          <option value="deleted">削除済み</option>
        </select>
        <button className="btn-outline">絞り込み</button>
      </form>

      <div className="overflow-x-auto border border-line rounded-card">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left p-3">タイトル</th>
              <th className="text-left p-3">出品者</th>
              <th className="text-left p-3">カテゴリ</th>
              <th className="text-left p-3">価格</th>
              <th className="text-left p-3">状態</th>
              <th className="text-left p-3">作成</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="p-3">
                  <Link
                    href={`/posts/${p.id}`}
                    className="hover:underline line-clamp-1 max-w-xs inline-block"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">{p.profiles?.nickname ?? "-"}</td>
                <td className="p-3">{p.categories?.name ?? "-"}</td>
                <td className="p-3">¥{p.price.toLocaleString()}</td>
                <td className="p-3">
                  <span
                    className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                      p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : p.status === "closed"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.status === "active"
                      ? "公開中"
                      : p.status === "closed"
                      ? "終了"
                      : "削除"}
                  </span>
                </td>
                <td className="p-3 text-sub">
                  {formatRelativeTime(p.created_at)}
                </td>
                <td className="p-3">
                  <AdminPostActions
                    postId={p.id}
                    currentStatus={p.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
