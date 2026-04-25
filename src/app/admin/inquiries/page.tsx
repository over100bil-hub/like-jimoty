import { createClient } from "@/lib/supabase/server";
import InquiryRow from "./InquiryRow";
import type { ContactInquiry } from "@/types";

export const revalidate = 0;

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const list = (data as ContactInquiry[]) ?? [];

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <div className="text-center py-20 text-sub">お問い合わせはまだありません</div>
      ) : (
        list.map((i) => <InquiryRow key={i.id} inquiry={i} />)
      )}
    </div>
  );
}
