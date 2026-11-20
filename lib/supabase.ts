import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ตรวจสอบว่าได้กำหนดค่าเชื่อมต่อ Supabase อย่างถูกต้องหรือไม่
export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('example.com') &&
  supabaseUrl.startsWith('http')
);

let client: SupabaseClient | null = null;

if (isConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    client = null;
  }
}

export const supabase = client;

/**
 * ส่งคืนว่าระบบกำลังทำงานในโหมดทดลอง (Demo Mode) หรือไม่
 */
export function isDemoMode(): boolean {
  return !isConfigured || !client;
}
