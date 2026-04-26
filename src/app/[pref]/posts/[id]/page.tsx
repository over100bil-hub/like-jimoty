import PostDetailPage, { generateMetadata as baseMeta } from "@/app/posts/[id]/page";
export { revalidate } from "@/app/posts/[id]/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string; id: string }>;
}) {
  const { id } = await params;
  return baseMeta({ params: Promise.resolve({ id }) });
}

export default async function Page({
  params,
}: {
  params: Promise<{ pref: string; id: string }>;
}) {
  const { id } = await params;
  return PostDetailPage({ params: Promise.resolve({ id }) });
}
