export const metadata = { title: "サービスについて | marche" };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-neutral">
      <h1 className="text-3xl font-bold mb-6">marche について</h1>
      <p className="leading-relaxed">
        marche は、地域の不用品・募集・サービスを無料で投稿・検索できる
        コミュニティ型クラシファイドサービスです。
        身近な暮らしの中で生まれる「あげたい」「欲しい」「助けたい」を、
        誰もが手軽につなげられる場所を目指しています。
      </p>
      <h2 className="text-xl font-bold mt-8 mb-3">特長</h2>
      <ul className="list-disc pl-5 leading-relaxed">
        <li>無料で出品・閲覧できる、地域密着のマーケットプレイス</li>
        <li>アプリ内メッセージでスピーディに取引</li>
        <li>お気に入り保存でいつでも見返せる</li>
        <li>モバイル最適化、画像はWebPで高速表示</li>
      </ul>
    </div>
  );
}
