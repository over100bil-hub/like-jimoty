import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "管理者 | Machi-Chika" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <nav className="flex gap-1 flex-wrap">
          <AdminTab href="/admin">概要</AdminTab>
          <AdminTab href="/admin/posts">投稿</AdminTab>
          <AdminTab href="/admin/users">ユーザー</AdminTab>
          <AdminTab href="/admin/inquiries">お問い合わせ</AdminTab>
        </nav>
      </div>
      {children}
    </div>
  );
}

function AdminTab({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-pill border border-line hover:bg-surface text-sm font-semibold"
    >
      {children}
    </Link>
  );
}
