/**
 * 投稿の価格・取引バッジ・サブテキストの表示ロジック一元化
 * カテゴリ系統(top slug)によって表記を分岐させる
 */
import type { Post, Category } from "@/types";
import { resolveTopCategorySlug } from "./categoryFields";

const SALE_LIKE = new Set([
  "furniture",
  "appliances",
  "clothing",
  "baby-kids",
  "books-media",
  "sports-outdoor",
  "toys-hobby",
  "pc-mobile",
  "tickets",
  "pets",
  "others",
]);

export type DisplayKind =
  | "sale" // 売ります・あげます系（家具・家電など）
  | "vehicles"
  | "realestate"
  | "jobs"
  | "lesson"
  | "events"
  | "foster"
  | "members"
  | "community"
  | "localshop"
  | "volunteer"
  | "unknown";

const KNOWN_TOP_SLUGS = [
  "vehicles",
  "realestate",
  "jobs",
  "lesson",
  "events",
  "foster",
  "members",
  "community",
  "localshop",
  "volunteer",
];

function inferTopFromSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  if (KNOWN_TOP_SLUGS.includes(slug) || SALE_LIKE.has(slug)) return slug;
  // 子カテゴリslugのプレフィックスから推定（ハイフン区切り）
  const head = slug.split("-")[0];
  if (KNOWN_TOP_SLUGS.includes(head) || SALE_LIKE.has(head)) return head;
  // ジョブ系の特殊prefix（jobs-fulltime, jobs-parttime, fulltime-xxx, parttime-xxx）
  if (head === "fulltime" || head === "parttime") return "jobs";
  return null;
}

export function getDisplayKind(
  post: Post,
  cats?: Category[] | null
): DisplayKind {
  const fromCats = cats
    ? resolveTopCategorySlug(post.category_id ?? null, cats)
    : null;
  const top =
    fromCats ?? inferTopFromSlug(post.categories?.slug ?? null);
  if (!top) return "unknown";
  if (SALE_LIKE.has(top)) return "sale";
  if (KNOWN_TOP_SLUGS.includes(top)) return top as DisplayKind;
  return "unknown";
}

const yen = (n: number) => `¥${n.toLocaleString()}`;

/** カード等で出す主要な価格ラベル */
export function priceLabel(post: Post, kind: DisplayKind): string {
  const attrs = (post.attrs ?? {}) as Record<string, unknown>;
  const pickInt = (k: string): number | null => {
    const v = attrs[k];
    if (typeof v === "number") return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
    return null;
  };

  switch (kind) {
    case "sale":
    case "vehicles": {
      if (post.deal_type === "give") return "あげます";
      if (post.deal_type === "wanted") return "求む";
      if (!post.price || post.price === 0) return "応相談";
      return yen(post.price);
    }
    case "realestate": {
      const t = String(attrs.property_type ?? "");
      const rent = pickInt("rent");
      const isSale = t.startsWith("sale_") || t === "land";
      if (rent != null) {
        return isSale ? `購入価格 ${yen(rent)}` : `家賃 ${yen(rent)}/月`;
      }
      if (post.price && post.price > 0) {
        return isSale ? `購入価格 ${yen(post.price)}` : `家賃 ${yen(post.price)}/月`;
      }
      return isSale ? "価格応相談" : "家賃応相談";
    }
    case "jobs": {
      const min = pickInt("salary_min");
      const max = pickInt("salary_max");
      const type = String(attrs.salary_type ?? "");
      const unit =
        type === "hourly"
          ? "時給"
          : type === "daily"
          ? "日給"
          : type === "annual"
          ? "年俸"
          : type === "monthly"
          ? "月給"
          : "給与";
      if (min != null && max != null) return `${unit} ${yen(min)}〜${yen(max)}`;
      if (min != null) return `${unit} ${yen(min)}〜`;
      if (max != null) return `${unit} 〜${yen(max)}`;
      if (post.price && post.price > 0) return `${unit} ${yen(post.price)}`;
      return "給与応相談";
    }
    case "lesson": {
      const fee = pickInt("fee");
      const period = String(attrs.fee_period ?? "");
      const suffix =
        period === "monthly" ? "/月" : period === "lesson" ? "/回" : "";
      if (fee != null) return `受講料 ${yen(fee)}${suffix}`;
      if (post.price && post.price > 0) return `受講料 ${yen(post.price)}${suffix}`;
      return "受講料応相談";
    }
    case "events": {
      const fee = pickInt("fee");
      if (fee === 0) return "参加費無料";
      if (fee != null) return `参加費 ${yen(fee)}`;
      if (!post.price || post.price === 0) return "参加費無料";
      return `参加費 ${yen(post.price)}`;
    }
    case "members": {
      const fee = pickInt("fee");
      if (fee === 0) return "参加費無料";
      if (fee != null) return `会費 ${yen(fee)}/月`;
      return "会費応相談";
    }
    case "community": {
      const t = String(attrs.fee_type ?? "");
      if (t === "free") return "無償";
      if (t === "paid")
        return post.price && post.price > 0 ? yen(post.price) : "有償";
      return "応相談";
    }
    case "foster":
      return "里親募集中";
    case "localshop":
      return "営業中";
    case "volunteer":
      return "ボランティア";
    default:
      if (post.deal_type === "give") return "あげます";
      if (post.deal_type === "wanted") return "求む";
      return post.price ? yen(post.price) : "応相談";
  }
}

/** 詳細ページの価格欄の下に出す補足テキスト */
export function priceSubText(post: Post, kind: DisplayKind): string {
  switch (kind) {
    case "sale":
      if (post.deal_type === "give") return "無料で譲ります";
      if (post.deal_type === "wanted") return "募集中";
      return "送料込みかは出品者にご確認ください";
    case "vehicles":
      return post.deal_type === "wanted" ? "募集中" : "";
    case "realestate":
      return "管理費・敷金・礼金などは投稿者にご確認ください";
    case "jobs":
      return "勤務条件・福利厚生は投稿者にご確認ください";
    case "lesson":
      return "教材費・体験レッスンの有無はお問合せください";
    case "events":
      return "開催の最終確認は主催者にお願いします";
    case "members":
      return "活動内容・条件は投稿者にご確認ください";
    case "community":
      return "詳細は投稿者にご確認ください";
    case "foster":
      return "里親条件は投稿者にご確認ください";
    case "localshop":
      return "詳しい営業情報はお店にお問合せください";
    case "volunteer":
      return "活動内容は主催者にご確認ください";
    default:
      return "";
  }
}

/** PostCard等で価格上に表示する小さなバッジ。空文字なら非表示 */
export function dealBadge(post: Post, kind: DisplayKind): string {
  switch (kind) {
    case "sale":
      if (post.deal_type === "give") return "あげます";
      if (post.deal_type === "wanted") return "求む";
      return "";
    case "vehicles":
      if (post.deal_type === "wanted") return "求む";
      return "";
    case "realestate":
    case "jobs":
    case "lesson":
    case "events":
    case "members":
    case "community":
    case "foster":
    case "localshop":
    case "volunteer":
    case "unknown":
    default:
      return "";
  }
}

/** 詳細ページのスペック表で「取引タイプ」行を出すかどうか */
export function shouldShowDealRow(kind: DisplayKind): boolean {
  return kind === "sale";
}
