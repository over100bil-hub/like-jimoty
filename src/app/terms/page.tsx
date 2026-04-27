export const metadata = { title: "利用規約 | Machi-Chika" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-neutral">
      <h1 className="text-3xl font-bold mb-6">利用規約</h1>
      <p className="text-sub">
        本利用規約（以下「本規約」）は、Machi-Chika（以下「本サービス」）の利用条件を定めるものです。
      </p>
      <h2 className="text-xl font-bold mt-6">1. 利用登録</h2>
      <p>本サービスの利用には、メールアドレスによる登録が必要です。</p>
      <h2 className="text-xl font-bold mt-6">2. 禁止事項</h2>
      <p>
        違法行為、虚偽の情報の登録、不正アクセス、他のユーザーへの迷惑行為を禁止します。
      </p>
      <h2 className="text-xl font-bold mt-6">3. 投稿の取扱い</h2>
      <p>
        運営は不適切な投稿を予告なく非公開・削除することがあります。
      </p>
      <h2 className="text-xl font-bold mt-6">4. 免責</h2>
      <p>
        ユーザー間の取引に関するトラブルについて、運営は一切の責任を負いません。
      </p>
    </div>
  );
}
