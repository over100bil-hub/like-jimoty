"use client";

import { useState } from "react";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] sm:aspect-[2/1] bg-surface rounded-card grid place-items-center text-sub">
        <div className="text-center">
          <div className="text-5xl mb-2">📷</div>
          <div>画像はありません</div>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <button
        onClick={() => {
          setActive(0);
          setOpen(true);
        }}
        className="block w-full"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={title}
          className="w-full aspect-[16/9] sm:aspect-[2/1] object-cover rounded-card"
        />
      </button>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 aspect-[16/9] sm:aspect-[2/1] rounded-card overflow-hidden">
        <button
          className="col-span-2 row-span-2 relative"
          onClick={() => {
            setActive(0);
            setOpen(true);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover"
          />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button
            key={img}
            onClick={() => {
              setActive(i + 1);
              setOpen(true);
            }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={`${title} ${i + 2}`}
              className="w-full h-full object-cover"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 grid place-items-center text-white font-semibold">
                +{images.length - 5}
              </div>
            )}
          </button>
        ))}
      </div>
      {open && (
        <div
          className="fixed inset-0 bg-black/90 z-50 grid place-items-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute top-4 right-4 text-white w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-xl"
          >
            ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActive((a) => (a - 1 + images.length) % images.length);
            }}
            className="absolute left-4 text-white w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-2xl"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActive((a) => (a + 1) % images.length);
            }}
            className="absolute right-4 text-white w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-2xl"
          >
            ›
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
