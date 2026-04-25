export const metadata = { title: "プライバシーポリシー | marche" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-neutral">
      <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>
      <p>
        marche（以下「当社」）は、ユーザーの個人情報の保護を最優先とし、
        個人情報保護法および関連法令を遵守します。
      </p>
      <h2 className="text-xl font-bold mt-6">取得する情報</h2>
      <p>メールアドレス、ニックネーム、プロフィール情報、投稿内容、通信記録</p>
      <h2 className="text-xl font-bold mt-6">利用目的</h2>
      <p>サービス提供、本人確認、不正利用の防止、品質向上のため</p>
      <h2 className="text-xl font-bold mt-6">第三者提供</h2>
      <p>法令に基づく場合を除き、ユーザーの同意なく第三者に提供しません。</p>
    </div>
  );
}
