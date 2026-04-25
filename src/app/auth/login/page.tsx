"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ログインに失敗しました";
      setError(
        msg.includes("Invalid login credentials")
          ? "メールアドレスかパスワードが正しくありません"
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-card border border-line shadow-airbnb p-8">
        <h1 className="text-2xl font-bold mb-1">おかえりなさい</h1>
        <p className="text-sub mb-6 text-sm">marche にログインします</p>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-accent-soft border border-accent text-accent rounded-xl p-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              パスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <div className="my-6 border-t border-line" />
        <p className="text-center text-sm">
          アカウントをお持ちでない方は{" "}
          <Link
            href={`/auth/signup${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-accent font-semibold hover:underline"
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-12" />}>
      <LoginInner />
    </Suspense>
  );
}
