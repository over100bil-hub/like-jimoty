import { createClient } from "@/lib/supabase/server";
import AdminUserActions from "./AdminUserActions";
import type { Profile } from "@/types";

export const revalidate = 0;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (sp.q) q = q.ilike("nickname", `%${sp.q}%`);
  const { data } = await q;
  const users = (data as Profile[]) ?? [];

  return (
    <div>
      <form className="flex gap-2 mb-4" action="/admin/users">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="ニックネームで検索"
          className="input max-w-xs"
        />
        <button className="btn-outline">検索</button>
      </form>
      <div className="overflow-x-auto border border-line rounded-card">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left p-3">ニックネーム</th>
              <th className="text-left p-3">自己紹介</th>
              <th className="text-left p-3">作成</th>
              <th className="text-left p-3">権限</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="p-3 font-semibold">{u.nickname}</td>
                <td className="p-3 text-sub line-clamp-1 max-w-xs">
                  {u.bio ?? "-"}
                </td>
                <td className="p-3 text-sub">
                  {new Date(u.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="p-3">
                  {u.is_admin ? (
                    <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-accent-soft text-accent">
                      管理者
                    </span>
                  ) : (
                    <span className="text-xs text-sub">一般</span>
                  )}
                </td>
                <td className="p-3">
                  <AdminUserActions userId={u.id} isAdmin={u.is_admin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
