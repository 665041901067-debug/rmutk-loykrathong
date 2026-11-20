import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rmutk-midnight flex flex-col items-center justify-center p-6 text-center text-rmutk-ivory">
      <h2 className="text-3xl font-bold text-rmutk-goldLight mb-2">ไม่พบหน้านี้</h2>
      <p className="text-sm text-slate-400 mb-6 max-w-sm">
        หน้าที่คุณกำลังค้นหาอาจถูกย้าย หรือไม่ปรากฏอยู่ในสระน้ำ มทร.กรุงเทพ
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-rmutk-gold text-rmutk-midnight font-bold text-sm shadow hover:bg-rmutk-goldLight transition-colors"
      >
        กลับสู่สระน้ำแห่งคำอธิษฐาน
      </Link>
    </div>
  );
}
