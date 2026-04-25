export function formatPrice(price: number, dealType?: string): string {
  if (dealType === "give" || price === 0) return "あげます";
  if (dealType === "wanted") return "求む";
  return `¥${price.toLocaleString()}`;
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffH < 24) return `${diffH}時間前`;
  if (diffD < 7) return `${diffD}日前`;
  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

export const MAX_IMAGE_MB = 5;
export const MAX_IMAGES = 8;
