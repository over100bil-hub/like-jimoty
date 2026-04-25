"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContactSection({
  postId,
  sellerId,
}: {
  postId: string;
  sellerId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUser(data.user ? { id: data.user.id } : null));
  }, [supabase]);

  const startConversation = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/posts/${postId}`);
      return;
    }
    if (user.id === sellerId) return;
    setLoading(true);
    try {
      // 既存会話を確認
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("post_id", postId)
        .eq("buyer_id", user.id)
        .maybeSingle();
      if (existing?.id) {
        router.push(`/messages/${existing.id}`);
        return;
      }
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          post_id: postId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select("id")
        .single();
      if (error) throw error;
      router.push(`/messages/${created.id}`);
    } catch (e) {
      console.error("[ContactSection]", e);
      alert("メッセージを開始できませんでした");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={startConversation}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "準備中..." : "出品者にメッセージ"}
      </button>
      <p className="text-xs text-sub text-center">
        メッセージはアプリ内で送受信できます
      </p>
    </div>
  );
}
