import Link from "next/link";
import type { Category } from "@/types";
import CategoryIcon from "./CategoryIcon";

export default function CategoryFullList({
  categories,
}: {
  categories: Category[];
}) {
  const parents = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const childrenMap = new Map<number, Category[]>();
  categories
    .filter((c) => c.parent_id)
    .forEach((c) => {
      const list = childrenMap.get(c.parent_id as number) ?? [];
      list.push(c);
      childrenMap.set(c.parent_id as number, list);
    });
  childrenMap.forEach((list) =>
    list.sort((a, b) => a.sort_order - b.sort_order)
  );

  return (
    <section className="bg-white">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-5 bg-gradient-brand rounded-pill"></span>
        <h2 className="text-lg font-extrabold text-ink">カテゴリを選択</h2>
      </div>
      <div className="border border-line rounded-card overflow-hidden divide-y divide-line">
        {parents.map((p) => {
          const children = childrenMap.get(p.id) ?? [];
          return (
            <details key={p.id} className="group">
              <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent-soft transition list-none">
                <span className="w-9 h-9 rounded-full bg-accent-soft text-accent grid place-items-center shrink-0 group-open:bg-gradient-brand group-open:text-white transition">
                  <CategoryIcon slug={p.slug} size={20} />
                </span>
                <span className="flex-1 font-bold text-sm text-ink">
                  {p.name}
                  <span className="text-xs text-sub font-normal ml-2">
                    ({children.length})
                  </span>
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-sub transition-transform group-open:rotate-180"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </summary>
              <div className="bg-surface px-4 py-3">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <Link
                    href={`/?category=${p.slug}`}
                    className="text-xs font-semibold text-accent hover:underline col-span-2 mb-1"
                  >
                    {p.name}すべて →
                  </Link>
                  {children.map((c) => (
                    <Link
                      key={c.id}
                      href={`/?category=${c.slug}`}
                      className="text-xs text-ink hover:text-accent transition py-1"
                    >
                      ・{c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
