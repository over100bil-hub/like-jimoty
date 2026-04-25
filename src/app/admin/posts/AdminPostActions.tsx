"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostStatus } from "@/types";

export default function AdminPostActions({
  postId,
  currentStatus,
}: {
  postId: string;
  currentStatus: PostStatus;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async (status: PostStatus) => {
    if (status === "deleted" && !confirm("この投稿を削除しますか？")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ status })
        .eq("id", postId);
      if (error) throw error;
      router.refresh();
    } catch (e) {
      console.error("[AdminPostActions]", e);
      alert("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {currentStatus !== "active" && (
        <button
          onClick={() => update("active")}
          disabled={loading}
          className="text-xs px-2 py-1 rounded border border-line hover:bg-surface"
        >
          公開
        </button>
      )}
      {currentStatus !== "closed" && (
        <button
          onClick={() => update("closed")}
          disabled={loading}
          className="text-xs px-2 py-1 rounded border border-line hover:bg-surface"
        >
          終了
        </button>
      )}
      {currentStatus !== "deleted" && (
        <button
          onClick={() => update("deleted")}
          disabled={loading}
          className="text-xs px-2 py-1 rounded border border-accent text-accent hover:bg-accent-soft"
        >
          削除
        </button>
      )}
    </div>
  );
}
