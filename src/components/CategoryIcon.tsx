/**
 * カテゴリ用シンプルSVGアイコン（オレンジ単色 / currentColor）
 * - parent slugに対応
 * - 24x24
 */
type Props = {
  slug?: string | null;
  className?: string;
  size?: number;
};

const ICONS: Record<string, JSX.Element> = {
  furniture: (
    <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11h18a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3v2h-2v-2H7v2H5v-2a3 3 0 0 1-3-3v-3a1 1 0 0 1 1-1z" />
  ),
  appliances: (
    <path d="M4 4h12a2 2 0 0 1 2 2v3H2V6a2 2 0 0 1 2-2zm-2 7h16v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7zm17-4h3v10a3 3 0 0 1-3 3v-2a1 1 0 0 0 1-1V7zM5 13h2v2H5v-2z" />
  ),
  clothing: (
    <path d="M16 3l5 4-3 3-2-1.5V21H8V8.5L6 10 3 7l5-4h2a2 2 0 0 0 4 0h2z" />
  ),
  "baby-kids": (
    <path d="M12 2a4 4 0 0 1 4 4c0 1.3-.6 2.4-1.5 3.2A6 6 0 0 1 18 15v1H6v-1a6 6 0 0 1 3.5-5.8A4 4 0 0 1 8 6a4 4 0 0 1 4-4zm-3 16h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3z" />
  ),
  "books-media": (
    <path d="M4 4h7v16H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm9 0h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-7V4z" />
  ),
  "sports-outdoor": (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.7 0 3.3.5 4.6 1.4l-2.1 2.1-2.5-2.5L10 5.1l2.5 2.5-2.1 2.1L8.3 7.6 7 9l2.1 2.1L7 13.2l-2.6-2.6A8 8 0 0 1 12 4zm-7.6 8.7L7 15.3l2.1-2.1 2.1 2.1L9.1 17.4l2.5 2.5-1.4 1.4-2.5-2.5-2.1 2.1A8 8 0 0 1 4.4 12.7zm15.2 0a8 8 0 0 1-2.9 5.6l-2-2 2.1-2.1 2.8-2.8z" />
  ),
  "toys-hobby": (
    <path d="M7 3h10a2 2 0 0 1 2 2v1H5V5a2 2 0 0 1 2-2zM5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8zm3 3v3h2v-3H8zm6 0v3h2v-3h-2z" />
  ),
  vehicles: (
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1zm2-1h10l-.9-2.7a1 1 0 0 0-.9-.7H8.8a1 1 0 0 0-.9.7L7 10zm0 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  ),
  "pc-mobile": (
    <path d="M4 4h12a2 2 0 0 1 2 2v8H2V6a2 2 0 0 1 2-2zm-3 12h18v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1zm19-12h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2V4z" />
  ),
  tickets: (
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 1 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V6zm6 1v2h2V7h-2zm0 4v2h2v-2h-2zm0 4v2h2v-2h-2z" />
  ),
  pets: (
    <path d="M5 9a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm10 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM4 14a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm12 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm-7 5c0-2.2 1.3-4 3-4s3 1.8 3 4c0 1.7-1.3 3-3 3s-3-1.3-3-3z" />
  ),
  members: (
    <path d="M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-7 0a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm14 0a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM4 13a4 4 0 0 1 4 4v3H0v-3a4 4 0 0 1 4-4zm16 0a4 4 0 0 1 4 4v3h-8v-3a4 4 0 0 1 4-4zm-8-1a5 5 0 0 1 5 5v3H7v-3a5 5 0 0 1 5-5z" />
  ),
  others: (
    <path d="M4 7l8-4 8 4v10l-8 4-8-4V7zm8-2L6.2 7.8 12 10.6l5.8-2.8L12 5zM5 9.4v6.4l6 3v-6.4L5 9.4zm14 0l-6 3v6.4l6-3V9.4z" />
  ),
  realestate: (
    <path d="M12 3l9 7v11h-6v-6h-6v6H3V10l9-7z" />
  ),
  jobs: (
    <path d="M9 4h6a2 2 0 0 1 2 2v2h4a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h4V6a2 2 0 0 1 2-2zm0 4h6V6H9v2z" />
  ),
  community: (
    <path d="M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10h-4z" />
  ),
  events: (
    <path d="M12 2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 15.4l-5.2 2.7 1-5.8L3.5 8.2l5.9-.9L12 2z" />
  ),
  foster: (
    <path d="M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10h-4zM7 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  ),
  lesson: (
    <path d="M12 2l11 6-4 2.2V14a8 8 0 0 1-14 0v-3.8L1 8l11-6zm-7 8.8V14a7 7 0 0 0 14 0v-3.2l-7 3.8-7-3.8z" />
  ),
  localshop: (
    <path d="M3 9l1-5h16l1 5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zm1 2c.7.6 1.6 1 2.5 1s1.8-.4 2.5-1c.7.6 1.6 1 2.5 1s1.8-.4 2.5-1c.7.6 1.6 1 2.5 1s1.8-.4 2.5-1V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z" />
  ),
  volunteer: (
    <path d="M12 2c1.7 0 3 1.3 3 3 0 1-.5 1.9-1.2 2.5L17 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2l3.2-3.5A3 3 0 0 1 9 5c0-1.7 1.3-3 3-3z" />
  ),
};

export default function CategoryIcon({ slug, className, size = 24 }: Props) {
  const icon = (slug && ICONS[slug]) || ICONS.others;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
}
