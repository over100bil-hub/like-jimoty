"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignupInner() {
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [requiresConfirm, setRequiresConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nickname: nickname.trim() },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
              : undefined,
        },
      });
      if (error) throw error;
      // session があれば自動ログイン済み（メール確認OFF）、なければメール確認待ち
      setRequiresConfirm(!data.session);
      setSuccess(true);
      if (data.session && typeof window !== "undefined") {
        window.location.href = redirect;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登録に失敗しました";
      setError(
        msg.includes("already registered")
          ? "このメールアドレスは既に登録されています"
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-card border border-line shadow-airbnb p-8 text-center">
          <div className="text-5xl mb-3">✉️</div>
          <h2 className="text-2xl font-bold mb-2">
            {requiresConfirm
              ? "確認メールを送信しました"
              : "登録が完了しました"}
          </h2>
          <p className="text-sub text-sm leading-relaxed">
            {requiresConfirm ? (
              <>
                <strong className="text-ink">{email}</strong> に確認メールを送りました。
                <br />
                メール内のリンクをクリックして登録を完了してください。
                <br />
                <span className="text-xs">
                  迷惑メールフォルダもご確認ください。
                </span>
              </>
            ) : (
              <>marche へようこそ！ホームに移動しています...</>
            )}
          </p>
          <Link href="/auth/login" className="btn-outline inline-block mt-6">
            ログイン画面へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-card border border-line shadow-airbnb p-8">
        <h1 className="text-2xl font-bold mb-1">marche へようこそ</h1>
        <p className="text-sub mb-6 text-sm">アカウント作成は無料です</p>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="bg-accent-soft border border-accent text-accent rounded-xl p-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1">
              ニックネーム
            </label>
            <input
              type="text"
              required
              maxLength={30}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input"
            />
          </div>
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
              パスワード（6文字以上）
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "登録中..." : "アカウントを作成"}
          </button>
        </form>
        <div className="my-6 border-t border-line" />
        <p className="text-center text-sm">
          すでにアカウントをお持ちの方は{" "}
          <Link
            href={`/auth/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-accent font-semibold hover:underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-12" />}>
      <SignupInner />
    </Suspense>
  );
}
