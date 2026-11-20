export type FloatingMode = 'solo' | 'couple' | 'group';

export type WishCategory = 'study' | 'career' | 'love' | 'health';

export type KrathongBase =
  | 'banana-leaf'
  | 'bread'
  | 'coconut'
  | 'lotus-base'
  | 'gear-base'
  | 'dictionary-base'
  | 'science-atom-base'
  | 'teacher-chalkboard-base'
  | 'stock-graph-base'
  | 'gourmet-food-base'
  | 'thai-fabric-base'
  | 'inter-globe-base'
  // Legacy aliases for backward compatibility
  | 'gold-vault-base'
  | 'cyber-chip-base'
  | 'book-lotus-base'
  | 'craft-garland-base'
  | 'textile-silk-base';

export type FlowerType = 'lotus' | 'marigold' | 'rose' | 'globe-amaranth';

export type CandleSet = 'traditional' | 'pastel-minimal' | 'twin-love';

export type SacredItem = 'coin' | 'hair' | 'nail';

export type StoryCardFormat = 'story' | 'square';

export type TimeOfDay = 'day' | 'twilight' | 'moonlight' | 'late-night';

export interface Krathong {
  id: string;
  sender_name: string;
  secondary_name?: string | null;
  mode: FloatingMode;
  faculty: string;
  wish: string;
  wish_category: WishCategory;
  base_type: KrathongBase;
  flower_type: FlowerType;
  candle_type: CandleSet;
  sacred_items?: SacredItem[];
  party_code?: string;
  party_time?: string;
  bless_count: number;
  pos_x: number; // 5 to 90 %
  pos_y: number; // 45 to 88 %
  scale: number; // 0.7 to 1.15
  created_at: string;
  is_local?: boolean; // For demo / local additions
}

export interface KrathongInput {
  sender_name: string;
  secondary_name?: string;
  mode: FloatingMode;
  faculty: string;
  wish: string;
  wish_category: WishCategory;
  base_type: KrathongBase;
  flower_type: FlowerType;
  candle_type: CandleSet;
  sacred_items?: SacredItem[];
  party_code?: string;
  party_time?: string;
}

export interface FortuneStick {
  number: number;
  level: string; // e.g. 'ดีเลิศ', 'มหาโชค', 'ก้าวหน้า', 'เตือนสติ'
  title: string;
  prediction: string;
}

export interface FacultyStats {
  faculty: string;
  count: number;
}

export interface CategoryStats {
  category: WishCategory;
  count: number;
}

export interface PondStats {
  totalKrathongs: number;
  totalBlessings: number;
  facultyDistribution: FacultyStats[];
  categoryDistribution: CategoryStats[];
}

export interface BlessResult {
  success: boolean;
  message: string;
  bless_count: number;
}
