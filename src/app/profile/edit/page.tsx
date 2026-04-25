import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import type { Profile, Prefecture } from "@/types";

export const metadata = { title: "プロフィール編集 | marche" };

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/profile/edit");

  const [{ data: profile }, { data: prefectures }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("prefectures").select("*").order("sort_order"),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-8">プロフィール編集</h1>
      <ProfileForm
        userId={user.id}
        profile={(profile as Profile) ?? null}
        prefectures={(prefectures as Prefecture[]) ?? []}
      />
    </div>
  );
}
