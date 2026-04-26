"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({
  postId,
  initialActive = false,
  size = "md",
  variant = "overlay",
  fullWidth = false,
}: {
  postId: string;
  initialActive?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "overlay" | "inline";
  fullWidth?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const [hasUser, setHasUser] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setHasUser(!!data.user);
      if (data.user) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("user_id")
          .eq("user_id", data.user.id)
          .eq("post_id", postId)
          .maybeSingle();
        setActive(!!fav);
      }
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const onToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (!hasUser) {
      router.push(`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      if (active) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", data.user.id)
          .eq("post_id", postId);
        setActive(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: data.user.id, post_id: postId });
        setActive(true);
      }
    } catch (err) {
      console.error("[FavoriteButton]", err);
    } finally {
      setLoading(false);
    }
  };

  const sizes = {
    sm: { btn: "w-8 h-8", icon: 16 },
    md: { btn: "w-9 h-9", icon: 18 },
    lg: { btn: "w-11 h-11", icon: 22 },
  } as const;
  const cls = sizes[size];

  if (variant === "inline") {
    return (
      <button
        onClick={onToggle}
        disabled={loading}
        className={`${
          fullWidth ? "w-full justify-center" : "inline-flex"
        } inline-flex items-center gap-2 px-4 py-2.5 rounded-pill border border-line hover:bg-accent-soft hover:border-accent transition-colors text-sm font-semibold disabled:opacity-50`}
        aria-pressed={active}
      >
        <Heart filled={active} size={cls.icon} />
        {active ? "お気に入り済み" : "お気に入りに追加"}
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`absolute top-3 right-3 ${cls.btn} rounded-full grid place-items-center bg-black/30 hover:bg-black/40 transition-colors disabled:opacity-50 backdrop-blur-sm`}
      aria-label={active ? "お気に入り解除" : "お気に入りに追加"}
      aria-pressed={active}
    >
      <Heart filled={active} size={cls.icon} />
    </button>
  );
}

function Heart({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "var(--color-accent)" : "rgba(0,0,0,0.5)"}
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
