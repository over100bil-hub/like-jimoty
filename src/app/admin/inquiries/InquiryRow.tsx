"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContactInquiry } from "@/types";

export default function InquiryRow({ inquiry }: { inquiry: ContactInquiry }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(inquiry.is_read);
  const supabase = createClient();
  const router = useRouter();

  const toggleRead = async () => {
    const next = !read;
    setRead(next);
    const { error } = await supabase
      .from("contact_inquiries")
      .update({ is_read: next })
      .eq("id", inquiry.id);
    if (error) {
      console.error(error);
      setRead(!next);
    } else {
      router.refresh();
    }
  };

  return (
    <div
      className={`border ${
        read ? "border-line" : "border-accent"
      } rounded-card p-4 bg-white`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{inquiry.name}</span>
            <span className="text-xs text-sub">{inquiry.email}</span>
            {!read && (
              <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">
                未読
              </span>
            )}
          </div>
          <div className="text-xs text-sub mt-1">
            {inquiry.category} ・{" "}
            {new Date(inquiry.created_at).toLocaleString("ja-JP")}
          </div>
          {!open && (
            <div className="text-sm mt-1 line-clamp-1">{inquiry.message}</div>
          )}
        </div>
      </button>
      {open && (
        <div className="mt-3 text-sm whitespace-pre-wrap leading-relaxed">
          {inquiry.message}
          <div className="mt-3 pt-3 border-t border-line flex justify-end">
            <button
              onClick={toggleRead}
              className="btn-outline text-sm"
            >
              {read ? "未読に戻す" : "既読にする"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
