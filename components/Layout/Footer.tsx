'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-rmutk-midnight border-t border-rmutk-borderMuted py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Info & Vision */}
        <div className="text-center md:text-left space-y-1">
          <p className="font-semibold text-slate-300">
            โครงการลอยกระทงออนไลน์ มทร.กรุงเทพ • สระน้ำแห่งคำอธิษฐาน
          </p>
          <p className="text-[11px] text-slate-500">
            สืบสานประเพณีไทย น้อมคารวะพระแม่คงคา และรณรงค์การอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน
          </p>
        </div>

        {/* University Credits */}
        <div className="text-center md:text-right space-y-1">
          <p className="text-slate-400">
            มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ (RMUTK)
          </p>
          <p className="text-[11px] text-slate-600">
            Rajamangala University of Technology Krungthep
          </p>
        </div>
      </div>
    </footer>
  );
};
