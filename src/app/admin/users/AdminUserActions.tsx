"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminUserActions({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleAdmin = async () => {
    const next = !isAdmin;
    if (
      !confirm(
        next ? "このユーザーを管理者に昇格しますか？" : "管理者権限を外しますか？"
      )
    )
      return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: next })
        .eq("id", userId);
      if (error) throw error;
      router.refresh();
    } catch (e) {
      console.error("[AdminUserActions]", e);
      alert("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleAdmin}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-pill border border-line hover:bg-surface"
    >
      {isAdmin ? "管理者解除" : "管理者にする"}
    </button>
  );
}
