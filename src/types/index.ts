export type Category = {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  parent_id?: number | null;
  icon?: string | null;
};

export type Prefecture = {
  id: number;
  name: string;
  sort_order: number;
};

export type DealType = "sell" | "give" | "wanted";
export type PostStatus = "active" | "closed" | "deleted";

export type Post = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: number | null;
  prefecture_id: number | null;
  price: number;
  images: string[];
  contact_email: string | null;
  status: PostStatus;
  view_count: number;
  condition: string | null;
  deal_type: DealType;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
  prefectures?: Prefecture | null;
  profiles?: Profile | null;
};

export type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  prefecture_id: number | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Favorite = {
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  post_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  posts?: Post;
  buyer?: Profile;
  seller?: Profile;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
