"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["バグ報告", "機能要望", "違反報告", "アカウント", "その他"];

export default function ContactPageClient() {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "その他",
    message: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_inquiries").insert(form);
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error("[Contact]", err);
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-card border border-line shadow-airbnb p-8 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-2xl font-bold mb-2">送信しました</h2>
          <p className="text-sub text-sm">
            お問い合わせありがとうございます。担当者より追ってご連絡いたします。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-2">お問い合わせ</h1>
      <p className="text-sub mb-6 text-sm">
        ご質問・ご要望はこちらからお寄せください。
      </p>
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="bg-accent-soft border border-accent text-accent rounded-xl p-3 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block font-semibold mb-1">お名前</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">メールアドレス</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">カテゴリ</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">お問い合わせ内容</label>
          <textarea
            required
            rows={6}
            maxLength={2000}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "送信中..." : "送信する"}
        </button>
      </form>
    </div>
  );
}
