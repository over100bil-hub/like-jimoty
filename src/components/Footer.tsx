import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 text-sm text-sub">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>© 2026 marche</div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/about" className="hover:underline">
              サービスについて
            </Link>
            <Link href="/terms" className="hover:underline">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:underline">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="hover:underline">
              お問い合わせ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
