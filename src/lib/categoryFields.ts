/**
 * カテゴリ別の専用入力フィールド定義
 * - 大カテゴリ slug をキーにフィールド配列を返す
 * - PostForm はこの定義を見て動的にフォームをレンダリング
 * - FilterChips も範囲検索可能なフィールドをこの定義から拾う
 */

export type FieldOption = { value: string; label: string };

export type CategoryField =
  | {
      type: "text";
      key: string;
      label: string;
      placeholder?: string;
      maxLength?: number;
    }
  | {
      type: "number";
      key: string;
      label: string;
      placeholder?: string;
      unit?: string;
      min?: number;
      max?: number;
      filterable?: "range";
    }
  | {
      type: "select";
      key: string;
      label: string;
      options: FieldOption[];
      filterable?: "exact";
    }
  | {
      type: "boolean";
      key: string;
      label: string;
      filterable?: "exact";
    }
  | {
      type: "date";
      key: string;
      label: string;
    };

const yearOptions: FieldOption[] = Array.from({ length: 31 }, (_, i) => {
  const y = 2026 - i;
  return { value: String(y), label: `${y}年` };
});

export const CATEGORY_FIELDS: Record<string, CategoryField[]> = {
  // ==== 中古車 ====
  vehicles: [
    {
      type: "select",
      key: "maker",
      label: "メーカー",
      filterable: "exact",
      options: [
        { value: "toyota", label: "トヨタ" },
        { value: "nissan", label: "日産" },
        { value: "honda", label: "ホンダ" },
        { value: "mazda", label: "マツダ" },
        { value: "subaru", label: "スバル" },
        { value: "suzuki", label: "スズキ" },
        { value: "daihatsu", label: "ダイハツ" },
        { value: "mitsubishi", label: "三菱" },
        { value: "lexus", label: "レクサス" },
        { value: "benz", label: "ベンツ" },
        { value: "bmw", label: "BMW" },
        { value: "audi", label: "アウディ" },
        { value: "vw", label: "フォルクスワーゲン" },
        { value: "mini", label: "ミニ" },
        { value: "volvo", label: "ボルボ" },
        { value: "peugeot", label: "プジョー" },
        { value: "alfa", label: "アルファロメオ" },
        { value: "other", label: "その他" },
      ],
    },
    {
      type: "select",
      key: "body_type",
      label: "ボディタイプ",
      filterable: "exact",
      options: [
        { value: "kei", label: "軽自動車" },
        { value: "compact", label: "コンパクトカー" },
        { value: "sedan", label: "セダン" },
        { value: "suv", label: "SUV" },
        { value: "minivan", label: "ミニバン" },
        { value: "wagon", label: "ステーションワゴン" },
        { value: "coupe", label: "クーペ" },
        { value: "open", label: "オープンカー" },
        { value: "truck", label: "トラック" },
      ],
    },
    {
      type: "number",
      key: "year",
      label: "年式",
      unit: "年",
      filterable: "range",
      min: 1980,
      max: 2026,
    },
    {
      type: "number",
      key: "mileage",
      label: "走行距離",
      unit: "km",
      filterable: "range",
      min: 0,
    },
    {
      type: "select",
      key: "transmission",
      label: "ミッション",
      options: [
        { value: "AT", label: "AT" },
        { value: "MT", label: "MT" },
        { value: "CVT", label: "CVT" },
        { value: "other", label: "その他" },
      ],
    },
    {
      type: "select",
      key: "fuel",
      label: "燃料",
      options: [
        { value: "gasoline", label: "ガソリン" },
        { value: "diesel", label: "ディーゼル" },
        { value: "hybrid", label: "ハイブリッド" },
        { value: "ev", label: "EV" },
        { value: "phev", label: "PHEV" },
      ],
    },
    { type: "number", key: "displacement", label: "排気量", unit: "cc" },
    { type: "text", key: "color", label: "ボディカラー" },
    { type: "boolean", key: "no_accident", label: "修復歴なし", filterable: "exact" },
    { type: "boolean", key: "non_smoker", label: "禁煙車", filterable: "exact" },
    { type: "boolean", key: "one_owner", label: "ワンオーナー", filterable: "exact" },
  ],

  // ==== 不動産 ====
  realestate: [
    {
      type: "select",
      key: "property_type",
      label: "物件種別",
      filterable: "exact",
      options: [
        { value: "rent_mansion", label: "マンション賃貸" },
        { value: "rent_apartment", label: "アパート賃貸" },
        { value: "rent_house", label: "一戸建て賃貸" },
        { value: "sale_mansion", label: "マンション売買" },
        { value: "sale_house", label: "一戸建て売買" },
        { value: "share", label: "シェアハウス" },
        { value: "shop", label: "店舗" },
        { value: "office", label: "事務所" },
        { value: "warehouse", label: "倉庫・工場" },
        { value: "land", label: "土地" },
        { value: "parking", label: "駐車場" },
      ],
    },
    {
      type: "select",
      key: "layout",
      label: "間取り",
      filterable: "exact",
      options: [
        { value: "1R", label: "1R" },
        { value: "1K", label: "1K" },
        { value: "1DK", label: "1DK" },
        { value: "1LDK", label: "1LDK" },
        { value: "2K", label: "2K" },
        { value: "2DK", label: "2DK" },
        { value: "2LDK", label: "2LDK" },
        { value: "3DK", label: "3DK" },
        { value: "3LDK", label: "3LDK" },
        { value: "4LDK+", label: "4LDK以上" },
      ],
    },
    {
      type: "number",
      key: "area_m2",
      label: "専有面積",
      unit: "㎡",
      filterable: "range",
      min: 0,
    },
    { type: "number", key: "rent", label: "賃料/価格", unit: "円", filterable: "range" },
    { type: "number", key: "deposit", label: "敷金", unit: "ヶ月" },
    { type: "number", key: "key_money", label: "礼金", unit: "ヶ月" },
    { type: "text", key: "station", label: "最寄駅" },
    { type: "number", key: "walk_minutes", label: "駅徒歩", unit: "分" },
    { type: "number", key: "building_year", label: "築年月(西暦)", unit: "年" },
    { type: "boolean", key: "pet_ok", label: "ペット可", filterable: "exact" },
    { type: "boolean", key: "parking_avail", label: "駐車場あり", filterable: "exact" },
    { type: "boolean", key: "auto_lock", label: "オートロック", filterable: "exact" },
  ],

  // ==== 求人(jobs)：親カテゴリ + 子カテゴリ(parttime/fulltime)で共通 ====
  jobs: [
    {
      type: "select",
      key: "employment_type",
      label: "雇用形態",
      filterable: "exact",
      options: [
        { value: "fulltime", label: "正社員" },
        { value: "parttime", label: "アルバイト・パート" },
        { value: "contract", label: "業務委託" },
        { value: "intern", label: "インターン" },
        { value: "spot", label: "日雇い・短期" },
      ],
    },
    {
      type: "select",
      key: "salary_type",
      label: "給与形態",
      filterable: "exact",
      options: [
        { value: "monthly", label: "月給" },
        { value: "hourly", label: "時給" },
      ],
    },
    {
      type: "number",
      key: "salary_min",
      label: "給与(下限)",
      unit: "円",
      filterable: "range",
    },
    { type: "number", key: "salary_max", label: "給与(上限)", unit: "円" },
    { type: "text", key: "working_hours", label: "勤務時間", placeholder: "例: 9:00〜18:00" },
    { type: "text", key: "days_per_week", label: "勤務日数", placeholder: "例: 週3〜5日" },
    { type: "text", key: "workplace", label: "勤務地", placeholder: "市区町村など" },
    { type: "text", key: "qualification", label: "応募資格", placeholder: "経験/資格など" },
  ],

  // ==== 教室・スクール ====
  lesson: [
    {
      type: "select",
      key: "lesson_type",
      label: "形式",
      filterable: "exact",
      options: [
        { value: "group", label: "グループ" },
        { value: "private", label: "マンツーマン" },
        { value: "online", label: "オンライン" },
        { value: "hybrid", label: "対面+オンライン" },
      ],
    },
    { type: "number", key: "fee", label: "料金", unit: "円", filterable: "range" },
    {
      type: "select",
      key: "fee_period",
      label: "料金単位",
      options: [
        { value: "monthly", label: "月額" },
        { value: "lesson", label: "1回あたり" },
        { value: "course", label: "コース" },
      ],
    },
    { type: "text", key: "frequency", label: "頻度", placeholder: "例: 週1回" },
    {
      type: "select",
      key: "age_target",
      label: "対象年齢",
      options: [
        { value: "kids", label: "子供向け" },
        { value: "student", label: "学生" },
        { value: "adult", label: "大人" },
        { value: "senior", label: "シニア" },
        { value: "all", label: "全年齢" },
      ],
    },
    { type: "boolean", key: "trial_available", label: "体験レッスンあり", filterable: "exact" },
  ],

  // ==== イベント ====
  events: [
    { type: "date", key: "event_date", label: "開催日" },
    { type: "text", key: "event_time", label: "開催時間", placeholder: "例: 13:00〜15:00" },
    { type: "text", key: "venue", label: "会場" },
    { type: "number", key: "fee", label: "参加費", unit: "円", filterable: "range" },
    { type: "number", key: "capacity", label: "定員", unit: "名" },
    { type: "boolean", key: "online_available", label: "オンライン開催", filterable: "exact" },
    { type: "boolean", key: "kids_ok", label: "子供連れOK", filterable: "exact" },
  ],

  // ==== 里親募集 ====
  foster: [
    {
      type: "select",
      key: "animal_type",
      label: "種別",
      filterable: "exact",
      options: [
        { value: "dog", label: "犬" },
        { value: "cat", label: "猫" },
        { value: "small", label: "小動物" },
        { value: "bird", label: "鳥" },
        { value: "other", label: "その他" },
      ],
    },
    { type: "text", key: "breed", label: "種類・品種" },
    { type: "text", key: "age", label: "年齢" },
    {
      type: "select",
      key: "gender",
      label: "性別",
      options: [
        { value: "male", label: "オス" },
        { value: "female", label: "メス" },
        { value: "unknown", label: "不明" },
      ],
    },
    { type: "boolean", key: "vaccinated", label: "ワクチン済み", filterable: "exact" },
    { type: "boolean", key: "spayed", label: "去勢避妊済み", filterable: "exact" },
    { type: "boolean", key: "trial_ok", label: "トライアル可", filterable: "exact" },
  ],

  // ==== メンバー募集 ====
  members: [
    { type: "text", key: "activity_type", label: "活動内容" },
    { type: "text", key: "frequency", label: "活動頻度", placeholder: "例: 月2回" },
    { type: "number", key: "fee", label: "参加費", unit: "円", filterable: "range" },
    { type: "number", key: "member_count", label: "現メンバー数", unit: "名" },
    {
      type: "select",
      key: "level",
      label: "レベル",
      options: [
        { value: "beginner", label: "初心者歓迎" },
        { value: "intermediate", label: "中級者" },
        { value: "advanced", label: "上級者" },
      ],
    },
    {
      type: "select",
      key: "gender_target",
      label: "性別",
      options: [
        { value: "all", label: "誰でも" },
        { value: "men", label: "男性のみ" },
        { value: "women", label: "女性のみ" },
      ],
    },
  ],

  // ==== 助け合い ====
  community: [
    {
      type: "select",
      key: "help_type",
      label: "種類",
      filterable: "exact",
      options: [
        { value: "lend", label: "物の貸し借り" },
        { value: "teach", label: "教えて欲しい" },
        { value: "together", label: "一緒にやりたい" },
        { value: "want", label: "譲って欲しい" },
        { value: "proxy", label: "代行・代理" },
      ],
    },
    {
      type: "select",
      key: "fee_type",
      label: "料金タイプ",
      options: [
        { value: "free", label: "無償" },
        { value: "paid", label: "有償" },
        { value: "negotiable", label: "応相談" },
      ],
    },
    { type: "text", key: "time_period", label: "希望期間", placeholder: "例: 1週間程度" },
  ],

  // ==== 地元のお店 ====
  localshop: [
    {
      type: "select",
      key: "shop_type",
      label: "業種",
      filterable: "exact",
      options: [
        { value: "restaurant", label: "飲食店" },
        { value: "salon", label: "美容・サロン" },
        { value: "massage", label: "整体・マッサージ" },
        { value: "medical", label: "医療・歯科" },
        { value: "retail", label: "小売店" },
        { value: "other", label: "その他" },
      ],
    },
    { type: "text", key: "business_hours", label: "営業時間" },
    { type: "text", key: "holiday", label: "定休日" },
    { type: "text", key: "address", label: "住所" },
    { type: "text", key: "phone", label: "電話番号" },
    { type: "boolean", key: "parking_avail", label: "駐車場あり", filterable: "exact" },
    { type: "boolean", key: "reservable", label: "予約可", filterable: "exact" },
    { type: "boolean", key: "takeout", label: "テイクアウト", filterable: "exact" },
  ],

  // ==== 売ります・あげます (家具・家電・衣類等の物品系) ====
  // 主要slugにも適用（furnitureなど）→簡易フィールド
  sale: [
    { type: "text", key: "brand", label: "ブランド" },
    { type: "text", key: "model", label: "型番・モデル名" },
    { type: "text", key: "size", label: "サイズ" },
    { type: "text", key: "color", label: "色" },
    { type: "number", key: "purchase_year", label: "購入年", unit: "年" },
  ],
  // ==== ホテル・宿泊施設 ====
  hotel: [
    {
      type: "text",
      key: "plan_name",
      label: "プラン名",
      placeholder: "例: 朝食付き素泊まりプラン",
    },
    {
      type: "number",
      key: "plan_price",
      label: "プラン金額",
      unit: "円",
      filterable: "range",
    },
    {
      type: "select",
      key: "fee_period",
      label: "料金単位",
      options: [
        { value: "per_night", label: "1泊あたり" },
        { value: "per_person", label: "1名あたり" },
        { value: "total", label: "合計" },
      ],
    },
    { type: "number", key: "capacity", label: "定員", unit: "名" },
    { type: "text", key: "checkin_time", label: "チェックイン時間", placeholder: "例: 15:00" },
    { type: "text", key: "checkout_time", label: "チェックアウト時間", placeholder: "例: 10:00" },
    { type: "text", key: "address", label: "所在地" },
    { type: "text", key: "station", label: "最寄駅" },
    { type: "number", key: "walk_minutes", label: "駅徒歩", unit: "分" },
    {
      type: "select",
      key: "room_type",
      label: "部屋タイプ",
      options: [
        { value: "single", label: "シングル" },
        { value: "twin", label: "ツイン" },
        { value: "double", label: "ダブル" },
        { value: "japanese", label: "和室" },
        { value: "suite", label: "スイート" },
        { value: "dormitory", label: "ドミトリー" },
        { value: "other", label: "その他" },
      ],
    },
    { type: "boolean", key: "breakfast_included", label: "朝食付き", filterable: "exact" },
    { type: "boolean", key: "dinner_included", label: "夕食付き", filterable: "exact" },
    { type: "boolean", key: "onsen", label: "温泉あり", filterable: "exact" },
    { type: "boolean", key: "wifi_free", label: "Wi-Fi無料", filterable: "exact" },
    { type: "boolean", key: "parking_avail", label: "駐車場あり", filterable: "exact" },
  ],

  // ==== ボランティア ====
  volunteer: [
    { type: "date", key: "event_date", label: "活動日" },
    { type: "text", key: "venue", label: "活動場所" },
    {
      type: "select",
      key: "fee_type",
      label: "費用",
      options: [
        { value: "free", label: "無償" },
        { value: "paid", label: "謝礼あり" },
      ],
    },
  ],
};

// 大カテゴリ slug を取得（与えられたカテゴリ階層を遡って親を返す）
export function resolveTopCategorySlug(
  categoryId: number | null | undefined,
  categories: { id: number; slug: string; parent_id?: number | null }[]
): string | null {
  if (!categoryId) return null;
  let cur = categories.find((c) => c.id === categoryId);
  while (cur?.parent_id) {
    const parent = categories.find((c) => c.id === cur!.parent_id);
    if (!parent) break;
    cur = parent;
  }
  return cur?.slug ?? null;
}

// 「売ります・あげます」系（物品売買全般）に分類される大カテゴリslug
const SALE_LIKE_TOP_SLUGS = [
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
];

// 大カテゴリslug→使用するフィールド配列
export function getCategoryFields(topSlug: string | null): CategoryField[] {
  if (!topSlug) return [];
  if (CATEGORY_FIELDS[topSlug]) return CATEGORY_FIELDS[topSlug];
  if (SALE_LIKE_TOP_SLUGS.includes(topSlug)) return CATEGORY_FIELDS.sale;
  return [];
}

// フィールドの値をラベル化（select系のオプションラベル取得）
export function fieldValueToLabel(
  field: CategoryField,
  value: unknown
): string {
  if (value == null || value === "") return "";
  if (field.type === "select") {
    const opt = field.options.find((o) => o.value === String(value));
    return opt?.label ?? String(value);
  }
  if (field.type === "boolean") return value ? "はい" : "";
  if (field.type === "number") {
    const n = typeof value === "number" ? value : Number(value);
    if (isNaN(n)) return "";
    return field.unit ? `${n.toLocaleString()}${field.unit}` : String(n);
  }
  return String(value);
}
