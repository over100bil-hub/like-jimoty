import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types";
import FavoriteButton from "./FavoriteButton";
import { formatPrice } from "@/lib/utils";

export default function PostCard({
  post,
  prefSlug,
}: {
  post: Post;
  prefSlug?: string;
}) {
  const cover = post.images?.[0];
  const href = prefSlug
    ? `/${prefSlug}/posts/${post.id}`
    : `/posts/${post.id}`;
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface">
        {cover ? (
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-sub">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
        <FavoriteButton postId={post.id} />
        {post.deal_type === "give" && (
          <span className="absolute top-3 left-3 bg-success text-white text-xs font-bold px-2 py-1 rounded-md">
            あげます
          </span>
        )}
        {post.status === "closed" && (
          <span className="absolute inset-0 bg-black/50 grid place-items-center text-white font-bold rounded-card">
            取引終了
          </span>
        )}
      </div>
      <div className="pt-2.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] leading-snug line-clamp-1 flex-1">
            {post.title}
          </h3>
        </div>
        <div className="text-sub text-sm mt-0.5 line-clamp-1">
          {post.prefectures?.name ?? "全国"}
          {post.categories?.name ? ` ・ ${post.categories.name}` : ""}
        </div>
        <div className="mt-1 font-semibold">
          {formatPrice(post.price, post.deal_type)}
        </div>
      </div>
    </Link>
  );
}
