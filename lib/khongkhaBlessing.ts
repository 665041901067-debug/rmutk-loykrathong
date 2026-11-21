import { Krathong, WishCategory, SacredItem } from '@/types';

export interface KhongkhaBlessing {
  id: string;
  recipientName: string;
  faculty: string;
  wish: string;
  headline: string;
  cleansingWord: string;
  wishBlessing: string;
  sacredOfferingWord?: string;
  flowerSymbolism: string;
  facultyWisdom: string;
  closingVerse: string;
  waterVirtue: string;
}

type BlessingIntent = 'career' | 'study' | 'love' | 'health' | 'lifestyle' | 'wacky';

// Keyword dictionaries for intelligent wish intent detection
const CAREER_KEYWORDS = [
  'เงิน', 'รวย', 'โบนัส', 'สตาร์ท', 'งาน', 'สัมภาษณ์', 'หวย', 'รางวัล', 'ทอง', 'ลอตเตอรี่',
  'บาท', 'บัญชี', 'มั่งคั่ง', 'ช้อป', 'ลูกค้า', 'เจ้านาย', 'หัวหน้า', 'ลาออก', 'เงินเดือน',
  'กำไร', 'ขายของ', 'ธุรกิจ', 'ร้าน', 'รวยๆ', 'มีตัง', 'ปลดหนี้', 'หนี้', 'หุ้น', 'crypto',
  'บิทคอยน์', 'โปรโมท', 'เลื่อนขั้น', 'ออเดอร์', 'ยอดขาย', 'ปังๆ', 'เศรษฐี', 'ตังค์', 'ร่ำรวย', 'บรรจุ', 'ข้าราชการ'
];

const STUDY_KEYWORDS = [
  'เกรด', 'สอบ', 'เรียน', ' f', 'f ', ' a', 'a ', 'ติดเอฟ', 'เกรดเอ', 'อาจารย์', 'ไฟนอล',
  'มิดเทอม', 'โปรเจกต์', 'โปรเจค', 'ธีสิส', 'วิจัย', 'การบ้าน', 'แล็บ', 'จบ', 'รับปริญญา',
  'ซิ่ว', 'ดรอป', 'คะแนน', 'มหาลัย', 'ลงทะเบียน', 'คลาส', 'คาบ', 'วิชา', 'ผ่าน', 'ต่อโท',
  'ดึงเกรด', 'สไลด์', 'อ่านหนังสือ', 'อ่านทัน', 'วิทยานิพนธ์', 'สัมมนา', 'พรีเซนต์', 'ก.พ.'
];

const LOVE_KEYWORDS = [
  'แฟน', 'คนคุย', 'แชท', 'รัก', 'โสด', 'จีบ', 'ชอบ', 'ตอบแชท', 'ดองแชท', 'ดอง', 'แฟนเก่า',
  'อกหัก', 'สมหวัง', 'เนื้อคู่', 'คลั่งรัก', 'คนโปรด', 'มูฟออน', 'ใจสั่น', 'น่ารัก', 'แต่งงาน',
  'คืนดี', 'บอกรัก', 'มีคู่', 'ผู้ชาย', 'ผู้หญิง', 'หนุ่ม', 'สาว', 'หล่อ', 'สวย', 'สารภาพรัก', 'หวานใจ'
];

const HEALTH_KEYWORDS = [
  'สุขภาพ', 'ปวดหลัง', 'ออฟฟิศซินโดรม', 'เหนื่อย', 'นอยด์', 'เครียด', 'นอน', 'หลับ', 'ผอม',
  'หายป่วย', 'แข็งแรง', 'ตาแห้ง', 'ซึม', 'พักผ่อน', 'ความสุข', 'ใจพัง', 'ใจฟู', 'กายภาพ',
  'ไมเกรน', 'ลดน้ำหนัก', 'จิตใจ', 'สบายใจ', 'สงบ', 'ไม่ป่วย', 'ลดหุ่น', 'มีแรง', 'สดชื่น', 'สดใส', 'กายใจ'
];

const LIFESTYLE_KEYWORDS = [
  'เที่ยว', 'ญี่ปุ่น', 'เกาหลี', 'ต่างประเทศ', 'บิน', 'กิน', 'บุฟเฟต์', 'ชาบู', 'หมูกระทะ',
  'คอนเสิร์ต', 'ตั๋ว', 'บัตร', 'อปป้า', 'ไอดอล', 'กดบัตร', 'ลาพักร้อน', 'แมว', 'หมา', 'คาเฟ่',
  'ศิลปิน', 'ซีรีส์', 'ปล่อยจอย', 'พักผ่อน'
];

function extractWishSnippet(wish: string): string {
  const clean = wish.replace(/[\r\n\t]+/g, ' ').trim();
  if (!clean) return 'ความสุขสมหวัง';
  if (clean.length <= 36) return clean;
  return clean.slice(0, 33).trim() + '...';
}

function detectWishIntent(wish: string, fallbackCategory?: WishCategory): BlessingIntent {
  const lower = (wish || '').toLowerCase();
  
  const scoreCategory = (keywords: string[]): number => {
    let count = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) count++;
    }
    return count;
  };

  const scores = {
    career: scoreCategory(CAREER_KEYWORDS),
    study: scoreCategory(STUDY_KEYWORDS),
    love: scoreCategory(LOVE_KEYWORDS),
    health: scoreCategory(HEALTH_KEYWORDS),
    lifestyle: scoreCategory(LIFESTYLE_KEYWORDS),
  };

  let maxCategory: BlessingIntent = 'study';
  let maxScore = 0;

  for (const [cat, score] of Object.entries(scores) as [BlessingIntent, number][]) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = cat;
    }
  }

  if (maxScore > 0) {
    return maxCategory;
  }

  // Fallback to chosen category or wacky
  if (fallbackCategory === 'career') return 'career';
  if (fallbackCategory === 'love') return 'love';
  if (fallbackCategory === 'health') return 'health';
  if (fallbackCategory === 'study') return 'study';

  return lower.trim().length > 6 ? 'wacky' : 'study';
}

// Tailored Gen-Z blessings that seamlessly echo user wishes
const CAREER_BLESSINGS = [
  (snippet: string) =>
    `คำขอเรื่อง “${snippet}” พระแม่คงคาขออวยพรให้เส้นทางการเติบโตของเธอราบรื่น ไร้อุปสรรค ได้ทำงานที่รัก รายได้ปัง เงินทองไหลเข้าบัญชีต่อเนื่อง มีโอกาสดีๆ วิ่งเข้าหาแบบไม่ทันตั้งตัว!`,
  (snippet: string) =>
    `ขอให้คำอธิษฐานเรื่อง “${snippet}” สัมฤทธิ์ผลอย่างงดงาม ทุกโปรเจกต์ที่ตั้งใจทำจะสำเร็จเกินคาด ผู้ใหญ่เมตตา เพื่อนร่วมงานน่ารัก เงินทองเหลือเก็บ มีความมั่นคงและอิสระในชีวิต!`,
  (snippet: string) =>
    `เห็นความมุ่งมั่นในเรื่อง “${snippet}” แล้ว พระแม่ขอส่งพลังใจให้เต็มร้อย! ขอให้เป็นตัวท็อปในสายงาน หยิบจับอะไรก็เป็นเงินเป็นทอง ประสบความสำเร็จอย่างภาคภูมิใจ!`,
];

const STUDY_BLESSINGS = [
  (snippet: string) =>
    `สำหรับคำขอเรื่องเรียน “${snippet}” ขอให้ทุกความพยายามของเธอเปล่งประกาย! สมองปลอดโปร่ง เข้าใจบทเรียนง่ายดาย สอบคราวนี้เกรดสวยดั่งใจ รอดทุกวิชายาก และคว้า A มาครองได้สำเร็จ!`,
  (snippet: string) =>
    `คำขอเรื่อง “${snippet}” พระแม่รับรู้ถึงความตั้งใจของเธอแล้ว! ขอให้โปรเจกต์และการบ้านผ่านฉลุย อาจารย์เมตตา มีสมาธิแน่วแน่ เกรดเฉลี่ยพุ่งทะยานสู่เป้าหมายที่ฝันไว้!`,
  (snippet: string) =>
    `ขอให้ “${snippet}” สมความปรารถนาทุกประการ! อ่านตรงจุด เก็งตรงข้อสอบ ทำข้อสอบด้วยความมั่นใจ จบการศึกษาอย่างงดงาม และมีอนาคตที่สดใสรออยู่ข้างหน้า!`,
];

const LOVE_BLESSINGS = [
  (snippet: string) =>
    `คำขอเรื่องหัวใจ “${snippet}” ขอให้เธอได้พบกับความรักที่ดีต่อใจ เป็นเซฟโซนที่อบอุ่น คอยซัพพอร์ตซึ่งกันและกัน ใครที่ไม่ชัดเจนขอให้ปล่อยวาง แล้วเปิดรับคนที่คู่ควรเข้ามา!`,
  (snippet: string) =>
    `ขอให้ความรักในเรื่อง “${snippet}” สมหวังดั่งใจ! หากมีคู่อยู่แล้วขอให้เข้าใจกัน ทะนุถนอมกันเสมอ หากยังโสดขอให้ได้พบคนจริงใจ มีทัศนคติตรงกัน และพร้อมเดินเคียงข้างไปด้วยกัน!`,
  (snippet: string) =>
    `เรื่องความสัมพันธ์ “${snippet}” ขอให้ใจฟูในทุกๆ วัน! เธอคู่ควรกับความรักที่จริงใจและปลอดภัย ขอให้พบคนที่มองเห็นคุณค่าในตัวเธอ และมอบความสุขให้กันเสมอ!`,
];

const HEALTH_BLESSINGS = [
  (snippet: string) =>
    `สำหรับเรื่อง “${snippet}” พระแม่ขอให้ความเหนื่อยล้าและความตึงเครียดทั้งหลายไหลไปกับสายน้ำ ขอให้ร่างกายแข็งแรง สดชื่นกระปรี้กระเปร่า นอนหลับสบาย ตื่นมาพร้อมพลังบวกในทุกเช้า!`,
  (snippet: string) =>
    `ขอให้คำขอเรื่อง “${snippet}” นำพาความสุขกายสบายใจมาสู่เธอ สุขภาพแข็งแกร่ง ห่างไกลจากความเจ็บป่วย มีพลังกายและพลังใจเต็มเปี่ยม พร้อมใช้ชีวิตได้อย่างมีความสุข!`,
  (snippet: string) =>
    `อย่าลืมใจดีกับตัวเองนะกับเรื่อง “${snippet}”! พักผ่อนให้เพียงพอ ทานของอร่อย ยิ้มให้กับตัวเองเยอะๆ ร่างกายและจิตใจที่แข็งแรงคือของขวัญที่ดีที่สุดสำหรับเธอ!`,
];

const LIFESTYLE_BLESSINGS = [
  (snippet: string) =>
    `คำขอเรื่อง “${snippet}” ขอให้ชีวิตเต็มไปด้วยสีสันและความสุข! ได้ไปในที่ที่อยากไป ได้ทำสิ่งที่รัก มีเวลาพักผ่อนชาร์จพลัง และมีความสุขกับทุกโมเมนต์ของชีวิตวัยรุ่น!`,
  (snippet: string) =>
    `ขอให้เรื่อง “${snippet}” เป็นจริงอย่างราบรื่น! ชีวิตมีอิสระ พบเจอผู้คนและประสบการณ์ดีๆ มีความสุขกับความเรียบง่ายในทุกๆ วัน และเติบโตอย่างงดงาม!`,
];

const WACKY_BLESSINGS = [
  (snippet: string) =>
    `คำขอแสนพิเศษเรื่อง “${snippet}” พระแม่ขอส่งต่อพลังแห่งความสุขให้เธอ! ขอให้จักรวาลจัดสรรสิ่งดีๆ ให้เธอได้ยิ้มกว้างๆ มีเรื่องให้ชื่นใจ และสนุกกับชีวิตในทุกๆ วัน!`,
  (snippet: string) =>
    `อ่านคำขอเรื่อง “${snippet}” แล้วสัมผัสได้ถึงความสดใส! ขอให้ทุกความฝันและความหวังค่อยๆ เบ่งบานในจังหวะเวลาที่พอดี มีความสุขและสบายใจเสมอนะ!`,
];

// Topic-aligned Punchlines (คติธรรมพลังบวก ฉบับ Gen-Z)
const CAREER_PUNCHLINES = [
  'ขอให้การงานราบรื่น การเงินมั่นคง และมีความสุขกับทุกก้าวความสำเร็จ',
  'ขอให้เงินในบัญชีงอกงาม ได้ทำงานที่รัก และเติบโตอย่างมั่นใจ',
  'ตื่นมาพร้อมพลังบวก มีโอกาสดีๆ เปิดกว้าง และประสบความสำเร็จดั่งใจ',
];

const STUDY_PUNCHLINES = [
  'ขอให้สติปัญญาแจ่มใส ข้อสอบทำได้ฉลุย และคว้าเกรดที่ตั้งใจมาครอง',
  'โปรเจกต์และวิจัยสำเร็จงดงาม ความพยายามในวันนี้จะผลิดอกออกผล',
  'มั่นใจในศักยภาพของตัวเอง ทุกความตั้งใจกำลังพาเธอไปสู่เป้าหมาย',
];

const LOVE_PUNCHLINES = [
  'ขอให้ได้พบความรักที่เป็นเซฟโซน ปลอดภัย อบอุ่น และสบายใจในทุกวัน',
  'รักตัวเองให้มากๆ แล้วความรักที่งดงามจะดึงดูดเข้ามาในเวลาที่พอดี',
  'ขอให้มีความสัมพันธ์ที่เข้าใจและเติบโตไปด้วยกันอย่างมีความสุข',
];

const HEALTH_PUNCHLINES = [
  'ปล่อยวางความเครียดลงสู่สายน้ำ พักผ่อนให้เต็มที่ แล้วตื่นมารับวันใหม่ที่สดใส',
  'สุขภาพกายแข็งแรง สุขภาพใจเบิกบาน ยิ้มให้ตัวเองในทุกๆ วัน',
  'ชีวิตวัยรุ่นมีค่า ดูแลสุขภาพและมีความสุขกับปัจจุบันให้มากที่สุด',
];

const LIFESTYLE_PUNCHLINES = [
  'ขอให้ได้ใช้ชีวิตตามใจปรารถนา เที่ยวให้สนุก และมีความสุขในทุกเส้นทาง',
  'ชาร์จพลังชีวิตให้เต็มเปี่ยม ยิ้มกว้างๆ และมีความสุขกับทุกเรื่องราว',
];

const WACKY_PUNCHLINES = [
  'ขอให้ทุกวันที่ตื่นขึ้นมามีแต่รอยยิ้ม ความสุข และสิ่งดีๆ รายล้อม',
  'ความฝันที่ไม่เหมือนใครจะนำพาความสุขที่พิเศษมาสู่เธอเสมอ',
];

// ข้อความแซวของสะเดาะเคราะห์
function getSacredOfferingText(items: SacredItem[]): string | undefined {
  if (!items || items.length === 0) return undefined;
  const parts: string[] = [];
  if (items.includes('coin')) parts.push('เหรียญ 9 บาททานบารมี (พระแม่เปลี่ยนเป็นเงินทองไหลมาเทมา)');
  if (items.includes('hair')) parts.push('เศษผมลอยทุกข์ (ตัดความนอยด์และความคิดมากทิ้งลงน้ำ)');
  if (items.includes('nail')) parts.push('เศษเล็บสะเดาะเคราะห์ (ตัดเรื่องซวยและคนท็อกซิกออกไปจากชีวิต)');
  return `รับเครื่องสะเดาะเคราะห์เรียบร้อย: ${parts.join(' • ')} ความซวยลอยไป ความเฮงลอยมาแทนที่!`;
}

// ข้อคิดตามคณะของ มทร.กรุงเทพ
function getFacultyWisdom(faculty: string): string {
  if (faculty.includes('วิศวกรรม')) {
    return 'เกียร์วิศวะไม่เคยถอยหลัง ลุยโปรเจกต์ไหนก็สำเร็จ มั่นใจในตัวเองคนเก่ง!';
  }
  if (faculty.includes('บริหาร')) {
    return 'สายตาแหลมคม กราฟชีวิตพุ่งขึ้นเขียวขจี อนาคตเศรษฐีตัวท็อปแน่นอน!';
  }
  if (faculty.includes('ศิลปศาสตร์')) {
    return 'เสน่ห์ทางภาษาและความคิดสร้างสรรค์ยืนหนึ่ง พูดอะไรใครก็รักและเอ็นดู!';
  }
  if (faculty.includes('วิทยาศาสตร์')) {
    return 'ตรรกะเป๊ะ สมองไว คิดค้นอะไรก็ปัง แก้โจทย์ชีวิตได้ทุกเรื่อง!';
  }
  if (faculty.includes('ครุศาสตร์')) {
    return 'จิตวิญญาณแห่งการถ่ายทอด ส่งต่อพลังบวก มีแต่คนเคารพรักและชื่นชม!';
  }
  if (faculty.includes('คหกรรม')) {
    return 'ฝีมือระดับเชฟ รสนิยมเลิศหรู ชีวิตกลมกล่อมและเต็มไปด้วยความสุข!';
  }
  if (faculty.includes('สิ่งทอ')) {
    return 'สไตล์โดดเด่น ถักทออนาคตได้อย่างงดงาม ทุกก้าวมีแต่ความเฉิดฉาย!';
  }
  if (faculty.includes('นานาชาติ')) {
    return 'วิสัยทัศน์ระดับโลก ภาษาคล่องแคล่ว ก้าวไกลไร้พรมแดน!';
  }
  return 'ชาว มทร.กรุงเทพ มีของดีในตัวอยู่แล้ว มั่นใจในตัวเองเข้าไว้คนเก่ง!';
}

export function generateKhongkhaBlessing(krathong: Krathong): KhongkhaBlessing {
  const displayName =
    krathong.mode === 'couple' && krathong.secondary_name
      ? `${krathong.sender_name} และ ${krathong.secondary_name}`
      : krathong.sender_name;

  let hash = 0;
  for (let i = 0; i < krathong.id.length; i++) {
    hash = (hash << 5) - hash + krathong.id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const intent = detectWishIntent(krathong.wish, krathong.wish_category);
  const snippet = extractWishSnippet(krathong.wish);

  let pool = STUDY_BLESSINGS;
  let punchlinePool = STUDY_PUNCHLINES;

  switch (intent) {
    case 'career':
      pool = CAREER_BLESSINGS;
      punchlinePool = CAREER_PUNCHLINES;
      break;
    case 'love':
      pool = LOVE_BLESSINGS;
      punchlinePool = LOVE_PUNCHLINES;
      break;
    case 'health':
      pool = HEALTH_BLESSINGS;
      punchlinePool = HEALTH_PUNCHLINES;
      break;
    case 'lifestyle':
      pool = LIFESTYLE_BLESSINGS;
      punchlinePool = LIFESTYLE_PUNCHLINES;
      break;
    case 'wacky':
      pool = WACKY_BLESSINGS;
      punchlinePool = WACKY_PUNCHLINES;
      break;
    case 'study':
    default:
      pool = STUDY_BLESSINGS;
      punchlinePool = STUDY_PUNCHLINES;
      break;
  }

  const wishBlessingFn = pool[absHash % pool.length];
  const wishBlessing = wishBlessingFn(snippet);
  const punchline = punchlinePool[absHash % punchlinePool.length];

  const headlines = [
    `พระแม่คงคาขอน้อมรับคำอธิษฐานของ "${displayName}"`,
    `สายน้ำแห่งคำอธิษฐานส่งถึงพระแม่แล้ว สำหรับ "${displayName}"`,
    `พระแม่คงคาประสาทพรแด่ "${displayName}" ให้สมหวังดั่งใจ`,
    `ขอให้แสงเทียนนำพาคำขอของ "${displayName}" ไปสู่ความสำเร็จ`,
  ];
  const headline = headlines[absHash % headlines.length];

  const cleansings = [
    'ขอสายน้ำชำระล้างความเหนื่อยล้า และนำพาความสดใส พลังบวก และสิ่งดีๆ เข้ามาแทนที่',
    'ปล่อยวางความกังวลไว้กับสายน้ำ แล้วเปิดรับพลังงานดีๆ และโอกาสใหม่ๆ ในชีวิต',
    'ขอให้ความทุกข์ใจทั้งปวงลอยหายไป เหลือไว้แต่ความสุขกายสบายใจและความโชคดี',
  ];
  const cleansingWord = cleansings[absHash % cleansings.length];

  return {
    id: krathong.id,
    recipientName: displayName,
    faculty: krathong.faculty,
    wish: krathong.wish,
    headline,
    cleansingWord,
    wishBlessing,
    sacredOfferingWord: getSacredOfferingText(krathong.sacred_items || []),
    flowerSymbolism: 'ดอกไม้บูชาที่เลือกมา แสดงถึงพลังบวกและความสดใสที่จะเบ่งบานในชีวิต',
    facultyWisdom: getFacultyWisdom(krathong.faculty),
    closingVerse: 'ขอให้ทุกสิ่งที่ปรารถนาจงสำเร็จ รุ่งโรจน์ สบายใจ และสมหวังทุกประการ',
    waterVirtue: punchline,
  };
}

/**
 * สุ่มโองการประสาทพรประจำวัน สำหรับผู้ใช้ทั่วไปหรือคนที่ยังไม่ได้ลอยกระทง
 */
export function generateDailyKhongkhaBlessing(
  category: WishCategory | 'all' = 'all',
  visitorName: string = 'คนเก่งแห่ง มทร.กรุงเทพ'
): KhongkhaBlessing {
  const seed = Date.now() + Math.floor(Math.random() * 10000);
  let effectiveIntent: BlessingIntent = 'study';

  if (category === 'all') {
    const allIntents: BlessingIntent[] = ['study', 'career', 'love', 'health', 'lifestyle', 'wacky'];
    effectiveIntent = allIntents[seed % allIntents.length];
  } else if (category === 'career') {
    effectiveIntent = 'career';
  } else if (category === 'love') {
    effectiveIntent = 'love';
  } else if (category === 'health') {
    effectiveIntent = 'health';
  } else {
    effectiveIntent = 'study';
  }

  let pool = STUDY_BLESSINGS;
  let punchlinePool = STUDY_PUNCHLINES;
  let dummyWish = 'ขอให้เรียนดี โปรเจกต์ผ่านฉลุย';

  switch (effectiveIntent) {
    case 'career':
      pool = CAREER_BLESSINGS;
      punchlinePool = CAREER_PUNCHLINES;
      dummyWish = 'ขอให้การงานปัง เงินทองไหลมาเทมา';
      break;
    case 'love':
      pool = LOVE_BLESSINGS;
      punchlinePool = LOVE_PUNCHLINES;
      dummyWish = 'ขอให้พบเจอความรักที่ดีและเป็นเซฟโซน';
      break;
    case 'health':
      pool = HEALTH_BLESSINGS;
      punchlinePool = HEALTH_PUNCHLINES;
      dummyWish = 'ขอให้สุขภาพแข็งแรง จิตใจสดใสเบิกบาน';
      break;
    case 'lifestyle':
      pool = LIFESTYLE_BLESSINGS;
      punchlinePool = LIFESTYLE_PUNCHLINES;
      dummyWish = 'ขอให้ชีวิตมีอิสระ มีความสุขและรอยยิ้ม';
      break;
    case 'wacky':
      pool = WACKY_BLESSINGS;
      punchlinePool = WACKY_PUNCHLINES;
      dummyWish = 'ขอให้จักรวาลจัดสรรความเฮงและความปัง';
      break;
    case 'study':
    default:
      pool = STUDY_BLESSINGS;
      punchlinePool = STUDY_PUNCHLINES;
      dummyWish = 'ขอให้สอบผ่านฉลุย เกรดสวยดั่งใจ';
      break;
  }

  const wishBlessingFn = pool[seed % pool.length];
  const wishBlessing = wishBlessingFn(dummyWish);
  const punchline = punchlinePool[seed % punchlinePool.length];

  const headlines = [
    `พระแม่คงคาสถิต ณ สระน้ำ มทร.กรุงเทพ พร้อมประสาทพรแก่เธอ`,
    `โองการสายน้ำศักดิ์สิทธิ์ประจำวันเพ็ญ สู่ "${visitorName}"`,
    `แสงจันทร์วันเพ็ญส่องสว่าง พระแม่ขอมอบพลังใจดีๆ แด่เธอ`,
    `พรสิริมงคลแห่งสายน้ำเปิดรับโชคชะตาที่ดีของ "${visitorName}"`,
  ];
  const headline = headlines[seed % headlines.length];

  const cleansings = [
    'ขอสายน้ำชำระล้างความเหนื่อยล้าสะสม พัดพาความนอยด์ทิ้งไป แล้วเปิดรับพลังงานบวกแบบจัดเต็ม!',
    'ปล่อยวางความกังวลไว้กับสายน้ำแห่ง มทร.กรุงเทพ แล้วเปิดรับโอกาสใหม่ๆ ที่กำลังจะเข้ามา!',
    'ขอให้ความทุกข์ใจทั้งปวงลอยหายไป เหลือไว้แต่ความสุขกายสบายใจ ความโชคดี และรอยยิ้ม!',
  ];
  const cleansingWord = cleansings[seed % cleansings.length];

  return {
    id: `daily-${seed}`,
    recipientName: visitorName,
    faculty: 'สระน้ำ มทร.กรุงเทพ',
    wish: dummyWish,
    headline,
    cleansingWord,
    wishBlessing,
    flowerSymbolism: 'สายน้ำบริสุทธิ์เปรียบดั่งจิตใจที่พร้อมเริ่มต้นสิ่งใหม่ด้วยพลังบวก',
    facultyWisdom: 'ชาว มทร.กรุงเทพ มีของดีในตัวอยู่แล้ว มั่นใจในตัวเองเข้าไว้คนเก่ง!',
    closingVerse: 'ขอให้ทุกย่างก้าวเปี่ยมด้วยสติ ความสุข ความปลอดภัย และความสำเร็จ',
    waterVirtue: punchline,
  };
}

/**
 * ดึงคำคมข้อคิดเตือนใจแบบสุ่มสำหรับปุ่มสลับข้อคิด
 */
export function getRandomWaterVirtue(): string {
  const allPunchlines = [
    ...STUDY_PUNCHLINES,
    ...CAREER_PUNCHLINES,
    ...LOVE_PUNCHLINES,
    ...HEALTH_PUNCHLINES,
    ...LIFESTYLE_PUNCHLINES,
    ...WACKY_PUNCHLINES,
  ];
  return allPunchlines[Math.floor(Math.random() * allPunchlines.length)];
}

