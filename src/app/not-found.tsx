import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24 px-4">
      <p className="text-6xl mb-4">🔍</p>
      <h2 className="text-2xl font-bold mb-2">ページが見つかりません</h2>
      <p className="text-sub mb-6">
        投稿が削除されたか、URLが間違っています。
      </p>
      <Link href="/" className="btn-primary inline-block">
        トップへ戻る
      </Link>
    </div>
  );
}
