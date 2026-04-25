"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostStatus } from "@/types";

export default function StatusToggle({
  postId,
  currentStatus,
}: {
  postId: string;
  currentStatus: PostStatus;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggle = async () => {
    setLoading(true);
    try {
      const next = currentStatus === "active" ? "closed" : "active";
      const { error } = await supabase
        .from("posts")
        .update({ status: next })
        .eq("id", postId);
      if (error) throw error;
      router.refresh();
    } catch (e) {
      console.error("[StatusToggle]", e);
      alert("ステータス変更に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggle} disabled={loading} className="btn-outline">
      {loading
        ? "更新中..."
        : currentStatus === "active"
        ? "取引終了にする"
        : "再公開する"}
    </button>
  );
}
