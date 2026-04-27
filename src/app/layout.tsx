import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Machi-Chika - 地域のマーケットプレイス",
  description:
    "地域の不用品・募集・サービスを無料で投稿・検索できるクラシファイドサービス",
  openGraph: {
    title: "Machi-Chika - 地域のマーケットプレイス",
    description:
      "地域の不用品・募集・サービスを無料で投稿・検索できるクラシファイドサービス",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-bg text-ink min-h-screen flex flex-col">
        <Suspense fallback={<div className="h-16 sm:h-20 border-b border-line bg-white" />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
