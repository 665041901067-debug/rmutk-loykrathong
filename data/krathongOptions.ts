import { KrathongBase, FlowerType, CandleSet } from '@/types';

export interface BaseOption {
  id: KrathongBase;
  name: string;
  badge?: string;
  material: string;
  description: string;
  facultyTag?: string;
}

export interface FlowerOption {
  id: FlowerType;
  name: string;
  meaning: string;
  description: string;
}

export interface CandleOption {
  id: CandleSet;
  name: string;
  meaning: string;
  description: string;
}

export const BASES: Record<KrathongBase, BaseOption> = {
  // --- SIGNATURE FACULTY BASES (ไฮไลท์ประจำคณะ มทร.กรุงเทพ ตามอัตลักษณ์) ---
  'gear-base': {
    id: 'gear-base',
    name: 'ฐานเกียร์วิศวะ',
    badge: 'วิศวกรรมศาสตร์',
    facultyTag: 'คณะวิศวกรรมศาสตร์',
    material: 'โลหะทองเหลืองรมดำ ทรงฟันเฟือง 8 แฉก',
    description: 'เอกลักษณ์เด็กช่างเกียร์ใจ มทร.กรุงเทพ สื่อถึงความแกร่ง ความอดทน และความมุ่งมั่นสร้างสรรค์นวัตกรรม',
  },
  'dictionary-base': {
    id: 'dictionary-base',
    name: 'ฐานดิกชั่นนารี',
    badge: 'ศิลปศาสตร์',
    facultyTag: 'คณะศิลปศาสตร์',
    material: 'พจนานุกรมเล่มหนาปกหนังทอง ดิกชันนารี A-Z และ ก-ฮ',
    description: 'เอกลักษณ์สายภาษา การสื่อสาร และมนุษยศาสตร์ สื่อถึงคลังความรู้ ปัญญา และความเข้าใจไร้พรมแดน',
  },
  'science-atom-base': {
    id: 'science-atom-base',
    name: 'ฐานอะตอมวิทย์',
    badge: 'วิทย์ & เทคโน',
    facultyTag: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    material: 'สัญลักษณ์วงโคจรอะตอมเรืองแสง พร้อมหลอดทดลองวิทยาศาสตร์',
    description: 'เอกลักษณ์วิทยาศาสตร์และการทดลอง สื่อถึงความอยากรู้อยากเห็น ตรรกะเหตุผล และพลังงานแห่งการค้นพบ',
  },
  'teacher-chalkboard-base': {
    id: 'teacher-chalkboard-base',
    name: 'ฐานกระดานดำครู',
    badge: 'ครุศาสตร์อุตสาหกรรม',
    facultyTag: 'คณะครุศาสตร์อุตสาหกรรม',
    material: 'กระดานดำขอบไม้สัก แท่งชอล์กหลากสี และไม้บรรทัดสามเหลี่ยม',
    description: 'เอกลักษณ์แม่พิมพ์ของชาติและอาจารย์ช่าง สื่อถึงการอบรมสั่งสอน แสงเทียนส่องทาง และการสร้างคนสู่อนาคต',
  },
  'stock-graph-base': {
    id: 'stock-graph-base',
    name: 'ฐานกราฟหุ้นบริหาร',
    badge: 'บริหารธุรกิจ',
    facultyTag: 'คณะบริหารธุรกิจ',
    material: 'กราฟแท่งเทียนสีเขียวพุ่งขึ้น All Time High และเหรียญทองการเงิน',
    description: 'เอกลักษณ์สายการเงิน การตลาด และการจัดการ สื่อถึงพอร์ตเขียวสดใส ผลกำไรพุ่ง และความมั่งคั่งมงคล',
  },
  'gourmet-food-base': {
    id: 'gourmet-food-base',
    name: 'ฐานสำรับคหกรรม',
    badge: 'เทคโนโลยีคหกรรมศาสตร์',
    facultyTag: 'คณะเทคโนโลยีคหกรรมศาสตร์',
    material: 'จานสำรับเบญจรงค์ประณีต ขนมไทยมงคล และช้อนส้อมทองคำ',
    description: 'เอกลักษณ์เสน่ห์ปลายจวักและศาสตร์อาหารคหกรรม สื่อถึงความอุดมสมบูรณ์ ความประณีต และความสุขในทุกคำ',
  },
  'thai-fabric-base': {
    id: 'thai-fabric-base',
    name: 'ฐานชุดผ้าไทยสิ่งทอ',
    badge: 'สิ่งทอ & แฟชั่น',
    facultyTag: 'คณะอุตสาหกรรมสิ่งทอ',
    material: 'ผ้าไหมไทยยกดอกทองจับจีบพัดวิจิตร และสายวัดตัดเย็บแฟชั่น',
    description: 'เอกลักษณ์สายแฟชั่น สิ่งทอ และดีไซน์ สื่อถึงความสง่างาม อัตลักษณ์ผ้าไทย และความคิดสร้างสรรค์ล้ำสมัย',
  },
  'inter-globe-base': {
    id: 'inter-globe-base',
    name: 'ฐานลูกโลกสากล',
    badge: 'วิทยาลัยนานาชาติ',
    facultyTag: 'วิทยาลัยนานาชาติ',
    material: 'ลูกโลกจำลองสีฟ้าคราม เข็มทิศทองเหลือง และสัญลักษณ์เชื่อมโลก',
    description: 'เอกลักษณ์ชาวนานาชาติและนักเดินทาง สื่อถึงมุมมองระดับโลก โอกาสที่กว้างไกล และมิตรภาพไร้พรมแดน',
  },

  // --- NATURAL & ECO-FRIENDLY BASES (สายธรรมชาติ รักษ์โลก) ---
  'banana-leaf': {
    id: 'banana-leaf',
    name: 'ฐานใบตองดั้งเดิม',
    badge: 'ธรรมชาติ 100%',
    material: 'ใบตองธรรมชาติพับจีบประณีต',
    description: 'ความงดงามตามแบบแผนประเพณีไทย ย่อยสลายง่าย เป็นมิตรกับสระน้ำธรรมชาติ',
  },
  'bread': {
    id: 'bread',
    name: 'ฐานขนมปังอบ',
    badge: 'อาหารปลา',
    material: 'แป้งสาลีไม่แต่งสีสังเคราะห์',
    description: 'กระทงรักษ์โลกที่ย่อยสลายได้เร็วและเป็นอาหารให้กับสัตว์น้ำในสระมหาวิทยาลัย',
  },
  'coconut': {
    id: 'coconut',
    name: 'ฐานกะลามะพร้าว',
    badge: 'ภูมิปัญญาไทย',
    material: 'กะลามะพร้าวขัดเกลาผิวเรียบ',
    description: 'วัสดุธรรมชาติจากภูมิปัญญาพื้นบ้าน ลอยน้ำนิ่งสงบ มั่นคงและเรียบง่าย',
  },
  'lotus-base': {
    id: 'lotus-base',
    name: 'ฐานกลีบบัวร่วมสมัย',
    badge: 'สิริมงคล',
    material: 'กลีบดอกบัวหลวงพับซ้อนชั้น',
    description: 'กลีบบัวหลวงสีชมพูอ่อนพับซ้อนชั้นสง่างาม สื่อถึงความบริสุทธิ์และปัญญา',
  },

  // --- LEGACY FALLBACKS (Backward Compatibility) ---
  'gold-vault-base': {
    id: 'gold-vault-base',
    name: 'ฐานกราฟหุ้นบริหาร',
    badge: 'บริหารธุรกิจ',
    facultyTag: 'คณะบริหารธุรกิจ',
    material: 'กราฟแท่งเทียนสีเขียวพุ่งขึ้น และเหรียญทองการเงิน',
    description: 'เอกลักษณ์สายการเงิน การตลาด และการจัดการ สื่อถึงพอร์ตเขียวสดใส ผลกำไรพุ่ง',
  },
  'cyber-chip-base': {
    id: 'cyber-chip-base',
    name: 'ฐานอะตอมวิทย์',
    badge: 'วิทย์ & เทคโน',
    facultyTag: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    material: 'สัญลักษณ์วงโคจรอะตอมเรืองแสง พร้อมหลอดทดลองวิทยาศาสตร์',
    description: 'เอกลักษณ์วิทยาศาสตร์และการทดลอง สื่อถึงความอยากรู้อยากเห็น และพลังงานแห่งการค้นพบ',
  },
  'book-lotus-base': {
    id: 'book-lotus-base',
    name: 'ฐานดิกชั่นนารี',
    badge: 'ศิลปศาสตร์',
    facultyTag: 'คณะศิลปศาสตร์',
    material: 'พจนานุกรมเล่มหนาปกหนังทอง ดิกชันนารี A-Z',
    description: 'เอกลักษณ์สายภาษา การสื่อสาร และมนุษยศาสตร์',
  },
  'craft-garland-base': {
    id: 'craft-garland-base',
    name: 'ฐานสำรับคหกรรม',
    badge: 'เทคโนโลยีคหกรรมศาสตร์',
    facultyTag: 'คณะเทคโนโลยีคหกรรมศาสตร์',
    material: 'จานสำรับเบญจรงค์ประณีต ขนมไทยมงคล และช้อนส้อมทองคำ',
    description: 'เอกลักษณ์เสน่ห์ปลายจวักและศาสตร์อาหารคหกรรม',
  },
  'textile-silk-base': {
    id: 'textile-silk-base',
    name: 'ฐานชุดผ้าไทยสิ่งทอ',
    badge: 'สิ่งทอ & แฟชั่น',
    facultyTag: 'คณะอุตสาหกรรมสิ่งทอ',
    material: 'ผ้าไหมไทยยกดอกทองจับจีบพัดวิจิตร และสายวัดตัดเย็บแฟชั่น',
    description: 'เอกลักษณ์สายแฟชั่น สิ่งทอ และดีไซน์ สื่อถึงความสง่างาม อัตลักษณ์ผ้าไทย',
  },
};

export const FLOWERS: Record<FlowerType, FlowerOption> = {
  lotus: {
    id: 'lotus',
    name: 'ดอกบัวหลวง',
    meaning: 'ความสำเร็จและจิตใจสงบ',
    description: 'สัญลักษณ์แห่งปัญญา ความบริสุทธิ์ใจ และความก้าวหน้าทางการศึกษา',
  },
  marigold: {
    id: 'marigold',
    name: 'ดอกดาวเรือง',
    meaning: 'ความเจริญรุ่งเรืองและก้าวหน้า',
    description: 'สีทองอร่ามสื่อถึงความรุ่งโรจน์ โอกาสใหม่ๆ และความมั่งคั่งในชีวิต',
  },
  rose: {
    id: 'rose',
    name: 'ดอกกุหลาบ',
    meaning: 'ความรักและมิตรภาพอันงดงาม',
    description: 'สื่อถึงความปรารถนาดี มิตรภาพที่จริงใจ และความรักอันอบอุ่น',
  },
  'globe-amaranth': {
    id: 'globe-amaranth',
    name: 'ดอกบานไม่รู้โรย',
    meaning: 'ความมั่นคงและความสัมพันธ์ที่ยั่งยืน',
    description: 'สื่อถึงความสัมพันธ์ที่ไม่เสื่อมคลาย ความหนักแน่น และความอดทนต่ออุปสรรค',
  },
};

export const CANDLES: Record<CandleSet, CandleOption> = {
  traditional: {
    id: 'traditional',
    name: 'เทียนทองและธูปสามดอก',
    meaning: 'บูชาพระแม่คงคาตามคติโบราณ',
    description: 'เทียนไขสีเหลืองทองพร้อมธูปหอม 3 ดอก น้อมจิตคารวะและขอขมาสายน้ำ',
  },
  'pastel-minimal': {
    id: 'pastel-minimal',
    name: 'เทียนมินิมอลร่วมสมัย',
    meaning: 'ความสงบนิ่งและแสงสว่างแห่งปัญญา',
    description: 'เทียนโทนสีนวลอบอุ่น ส่องสว่างเรียบง่าย สบายตาและเปี่ยมด้วยสมาธิ',
  },
  'twin-love': {
    id: 'twin-love',
    name: 'เทียนคู่ผูกพัน',
    meaning: 'ความกลมเกลียวและการเคียงข้าง',
    description: 'เทียนคู่ขนานสองเล่ม สื่อถึงการเดินทางร่วมกันและการเกื้อหนุนซึ่งกันและกัน',
  },
};
