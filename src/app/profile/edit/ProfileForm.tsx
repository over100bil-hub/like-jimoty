"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile, Prefecture } from "@/types";

export default function ProfileForm({
  userId,
  profile,
  prefectures,
}: {
  userId: string;
  profile: Profile | null;
  prefectures: Prefecture[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [prefectureId, setPrefectureId] = useState(
    profile?.prefecture_id ? String(profile.prefecture_id) : ""
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("アバターは2MB以下にしてください");
      return;
    }
    setError("");
    try {
      const path = `${userId}/${Date.now()}.${file.name.split(".").pop()}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } catch (err) {
      console.error("[Avatar]", err);
      setError("アバターのアップロードに失敗しました");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const payload = {
        id: userId,
        nickname: nickname.trim() || "ユーザー",
        bio: bio || null,
        prefecture_id: prefectureId ? Number(prefectureId) : null,
        avatar_url: avatarUrl || null,
      };
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
      setSuccess(true);
      router.refresh();
    } catch (err) {
      console.error("[ProfileForm]", err);
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-accent-soft border border-accent text-accent rounded-xl p-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-3 text-sm">
          プロフィールを保存しました
        </div>
      )}

      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-surface grid place-items-center text-2xl font-bold overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            (nickname || "U")[0].toUpperCase()
          )}
        </div>
        <label className="btn-outline cursor-pointer text-sm">
          画像を変更
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="block font-semibold mb-1">ニックネーム</label>
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
        <label className="block font-semibold mb-1">自己紹介</label>
        <textarea
          rows={5}
          maxLength={500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">エリア</label>
        <select
          value={prefectureId}
          onChange={(e) => setPrefectureId(e.target.value)}
          className="input"
        >
          <option value="">選択してください</option>
          {prefectures.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2 flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "保存中..." : "保存する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
