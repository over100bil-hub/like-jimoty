import EditPostPage from "@/app/posts/[id]/edit/page";

export { metadata } from "@/app/posts/[id]/edit/page";

export default async function Page({
  params,
}: {
  params: Promise<{ pref: string; id: string }>;
}) {
  const { id } = await params;
  return EditPostPage({ params: Promise.resolve({ id }) });
}
