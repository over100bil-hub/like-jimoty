"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？この操作は元に戻せません。"))
      return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ status: "deleted" })
        .eq("id", postId);
      if (error) throw error;
      router.push("/mypage");
      router.refresh();
    } catch (err) {
      console.error("[DeleteButton]", err);
      alert("削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-accent hover:bg-accent-soft rounded-pill px-5 py-2.5 font-semibold border border-accent disabled:opacity-50 transition"
    >
      {loading ? "削除中..." : "削除する"}
    </button>
  );
}
