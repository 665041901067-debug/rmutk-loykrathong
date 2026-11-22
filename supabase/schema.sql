-- ==============================================================================
-- สคริปต์ฐานข้อมูล Supabase สำหรับ ลอยกระทงออนไลน์ มทร.กรุงเทพ (RMUTK)
-- ระบบสระน้ำแห่งคำอธิษฐาน มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ
-- ==============================================================================

-- 1. สร้างตารางกระทง (krathongs)
CREATE TABLE IF NOT EXISTS public.krathongs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    float_mode VARCHAR(20) NOT NULL DEFAULT 'solo' CHECK (float_mode IN ('solo', 'couple', 'group')),
    sender_name VARCHAR(50) NOT NULL,
    second_name VARCHAR(50) DEFAULT NULL,
    faculty VARCHAR(100) NOT NULL DEFAULT 'บุคคลทั่วไป',
    wish_category VARCHAR(100) NOT NULL CHECK (wish_category IN ('การเรียนและสอบผ่าน', 'การงานและฝึกงาน', 'ความรักและมิตรภาพ', 'สุขภาพและลอยเคราะห์')),
    krathong_base VARCHAR(50) NOT NULL DEFAULT 'banana-leaf',
    flower_type VARCHAR(50) NOT NULL DEFAULT 'lotus',
    candle_type VARCHAR(50) NOT NULL DEFAULT 'traditional',
    wish VARCHAR(140) NOT NULL,
    bless_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. สร้างตารางบันทึกการร่วมอธิษฐาน (krathong_blessings)
CREATE TABLE IF NOT EXISTS public.krathong_blessings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    krathong_id UUID NOT NULL REFERENCES public.krathongs(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_krathong_voter UNIQUE (krathong_id, voter_id)
);

-- สร้างดัชนี (Indexes)
CREATE INDEX IF NOT EXISTS idx_krathongs_created_at ON public.krathongs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_krathongs_faculty ON public.krathongs (faculty);
CREATE INDEX IF NOT EXISTS idx_krathongs_wish_category ON public.krathongs (wish_category);

-- 3. ระบบความปลอดภัยระดับแถว (Row Level Security - RLS)
ALTER TABLE public.krathongs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.krathong_blessings ENABLE ROW LEVEL SECURITY;

-- นโยบายสำหรับตาราง krathongs
DROP POLICY IF EXISTS "Allow public read access for krathongs" ON public.krathongs;
CREATE POLICY "Allow public read access for krathongs"
    ON public.krathongs FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert for krathongs" ON public.krathongs;
CREATE POLICY "Allow public insert for krathongs"
    ON public.krathongs FOR INSERT
    WITH CHECK (
        char_length(trim(sender_name)) > 0 AND
        char_length(sender_name) <= 50 AND
        char_length(trim(wish)) > 0 AND
        char_length(wish) <= 140
    );

DROP POLICY IF EXISTS "Allow public update bless_count for krathongs" ON public.krathongs;
CREATE POLICY "Allow public update bless_count for krathongs"
    ON public.krathongs FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- นโยบายสำหรับตาราง krathong_blessings
DROP POLICY IF EXISTS "Allow public read for blessings" ON public.krathong_blessings;
CREATE POLICY "Allow public read for blessings"
    ON public.krathong_blessings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert for blessings" ON public.krathong_blessings;
CREATE POLICY "Allow public insert for blessings"
    ON public.krathong_blessings FOR INSERT
    WITH CHECK (true);

-- 4. ฟังก์ชัน RPC: increment_bless
DROP FUNCTION IF EXISTS public.increment_bless CASCADE;
CREATE OR REPLACE FUNCTION public.increment_bless(
    row_id UUID,
    voter_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
#variable_conflict use_variable
DECLARE
    v_new_bless_count INTEGER;
BEGIN
    -- ปรับปรุงยอดร่วมอธิษฐาน
    UPDATE public.krathongs
    SET bless_count = bless_count + 1
    WHERE public.krathongs.id = increment_bless.row_id
    RETURNING bless_count INTO v_new_bless_count;

    -- พยายามบันทึกประวัติหากมีตาราง krathong_blessings
    BEGIN
        INSERT INTO public.krathong_blessings (krathong_id, voter_id)
        VALUES (increment_bless.row_id, increment_bless.voter_id);
    EXCEPTION WHEN OTHERS THEN
        NULL; -- ทำงานต่อแม้จะเคยโหวตแล้วหรือไม่มีตาราง
    END;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'ร่วมอธิษฐานสำเร็จ ขอให้คำอธิษฐานสมหวัง',
        'bless_count', COALESCE(v_new_bless_count, 1)
    );
END;
$$;

-- 5. เปิดใช้งาน Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.krathongs;

-- 6. ตารางบันทึกเหรียญบ่อเต่ามงคลแยกตามคณะ (Popcat Style Leaderboard)
CREATE TABLE IF NOT EXISTS public.turtle_coins (
    faculty VARCHAR(100) PRIMARY KEY,
    coin_count BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.turtle_coins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for turtle_coins" ON public.turtle_coins;
CREATE POLICY "Allow public read for turtle_coins"
    ON public.turtle_coins FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert/update for turtle_coins" ON public.turtle_coins;
CREATE POLICY "Allow public insert/update for turtle_coins"
    ON public.turtle_coins FOR ALL
    USING (true)
    WITH CHECK (true);

-- เปิดใช้งาน Realtime สำหรับ turtle_coins
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'turtle_coins'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.turtle_coins;
    END IF;
END $$;

-- 7. ตารางสถิติจำนวนแท่งไฟเย็น (ดอกไม้ไฟ) ที่ถูกจุดจริงในสระน้ำ มทร.กรุงเทพ
CREATE TABLE IF NOT EXISTS public.sparkler_stats (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
    total_sparklers BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.sparkler_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for sparkler_stats" ON public.sparkler_stats;
CREATE POLICY "Allow public read for sparkler_stats"
    ON public.sparkler_stats FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert/update for sparkler_stats" ON public.sparkler_stats;
CREATE POLICY "Allow public insert/update for sparkler_stats"
    ON public.sparkler_stats FOR ALL
    USING (true)
    WITH CHECK (true);

-- เปิดใช้งาน Realtime สำหรับ sparkler_stats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sparkler_stats'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sparkler_stats;
    END IF;
END $$;
