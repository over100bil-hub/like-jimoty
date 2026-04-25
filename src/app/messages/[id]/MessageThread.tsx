"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import type { Message, Profile } from "@/types";

export default function MessageThread({
  conversationId,
  currentUserId,
  partner,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  partner: Profile | null;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 末尾へスクロール
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Realtime購読
  useEffect(() => {
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m]
          );
          // 自分宛なら既読化
          if (m.sender_id !== currentUserId) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", m.id)
              .then(() => {});
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          body: text,
        })
        .select()
        .single();
      if (error) throw error;
      setMessages((prev) =>
        prev.some((x) => x.id === (data as Message).id)
          ? prev
          : [...prev, data as Message]
      );
      setBody("");
    } catch (err) {
      console.error("[MessageThread]", err);
      alert("送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] sm:h-[600px] border border-line rounded-card overflow-hidden bg-white">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sub text-sm py-12">
            メッセージを送って取引を始めましょう
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <div className="w-8 h-8 rounded-full bg-surface grid place-items-center text-xs font-bold overflow-hidden shrink-0">
                  {partner?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (partner?.nickname ?? "U")[0]
                  )}
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                  mine
                    ? "bg-accent text-white rounded-br-sm"
                    : "bg-surface text-ink rounded-bl-sm"
                }`}
              >
                {m.body}
                <div
                  className={`text-[10px] mt-1 ${
                    mine ? "text-white/70" : "text-sub"
                  }`}
                >
                  {new Date(m.created_at).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={send}
        className="border-t border-line p-3 flex gap-2 items-end bg-white"
      >
        <textarea
          rows={1}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement).requestSubmit();
            }
          }}
          placeholder="メッセージを入力 (Cmd/Ctrl+Enterで送信)"
          className="input flex-1 resize-none max-h-32"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="btn-primary"
        >
          送信
        </button>
      </form>
    </div>
  );
}
