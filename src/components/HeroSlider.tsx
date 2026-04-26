"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/hero/cheering_japanese_group.png",
  "/hero/three_women_traveling.png",
  "/hero/business_women_smartphone.png",
  "/hero/generated_man_portrait.png",
];

const INTERVAL_MS = 5000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      aria-label="ヒーロー"
      className="relative w-full overflow-hidden border-b border-line"
    >
      {/* Slides */}
      <div className="relative w-full h-[260px] sm:h-[380px] md:h-[460px]">
        {IMAGES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden={i !== index}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        {/* 可読性のためのオーバーレイ（多層） */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/30" />

        {/* キャッチコピー */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center max-w-3xl">
            <h1
              className="text-white font-extrabold tracking-tight leading-tight text-[26px] sm:text-5xl md:text-6xl"
              style={{
                textShadow:
                  "0 2px 8px rgba(0,0,0,0.6), 0 4px 24px rgba(0,0,0,0.45)",
              }}
            >
              あなたの街で、
              <br className="sm:hidden" />
              すぐ見つかる・すぐ決まる
            </h1>
            <p
              className="mt-3 sm:mt-5 text-white/95 text-sm sm:text-base md:text-lg font-semibold"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.55)" }}
            >
              地元の「ゆずる・もらう・売る・買う」がここに集まる
            </p>
          </div>
        </div>

        {/* インジケーター */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`スライド${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-pill transition-all ${
                i === index
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/55 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
