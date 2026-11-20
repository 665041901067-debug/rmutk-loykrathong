import { Krathong } from '@/types';

/**
 * จัดตำแหน่งกระทงในสระน้ำให้กระจายตัวอย่างเป็นธรรมชาติและไม่ทับซ้อนกันเด็ดขาด (Anti-Overlap Physics)
 * ป้องกันปัญหากระทงต่อแถวเป็นแนวตรงหรือซ้อนทับกันเมื่อมีผู้ใช้งานลอยกระทงจำนวนมาก
 */
export function relaxKrathongPositions(
  krathongs: Krathong[],
  isMobile: boolean = true
): Krathong[] {
  if (!krathongs || krathongs.length === 0) return [];

  // ระยะห่างขั้นต่ำตามทรงรีของมุมมองผิวน้ำ (Isometric Perspective)
  // เพิ่มระยะแนวนอนและแนวตั้งให้กว้างขึ้น เพื่อป้องกันการเกยกัน 100%
  const minDx = isMobile ? 18.0 : 12.0; // แนวนอนขั้นต่ำ (% ของความกว้างสระ)
  const minDy = isMobile ? 8.5 : 5.8;   // แนวตั้งขั้นต่ำ (% ของความสูงสระ)
  const iterations = 30;               // เพิ่มรอบการผ่อนคลายตำแหน่งให้เสถียรที่สุด

  // Clone รายการกระทงเพื่อไม่ให้กระทบ state เดิม
  const items = krathongs.map((k) => ({ ...k }));

  // หากมีกระทงจำนวนมาก ให้กระจายตำแหน่งเริ่มต้นแบบ Golden Ratio ป้องกันการกระจุกตัวตรงกลาง
  for (let i = 0; i < items.length; i++) {
    if (!items[i].pos_x || !items[i].pos_y) {
      const phi = (i * 0.618033988749895) % 1;
      items[i].pos_x = 10 + phi * 80;
      items[i].pos_y = 48 + ((i * 13) % 22);
    }
  }

  // Relaxation Loop (Force-Directed Repulsion)
  for (let it = 0; it < iterations; it++) {
    const damping = Math.max(0.2, 1 - it / iterations); // ค่อยๆ ผ่อนแรงลงให้นิ่ง

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const dx = items[j].pos_x - items[i].pos_x;
        const dy = items[j].pos_y - items[i].pos_y;

        // คำนวณระยะห่างสัมพัทธ์ในแกนวงรี
        const distSq = (dx / minDx) ** 2 + (dy / minDy) ** 2;

        if (distSq < 1.0) {
          const dist = Math.max(0.001, Math.sqrt(distSq));
          const overlap = 1.0 - dist;

          // เวกเตอร์แรงผลัก กระจายแรงตามแนวนอนให้มากกว่าเพื่อใช้พื้นที่ผิวน้ำฝั่งซ้าย-ขวาอย่างคุ้มค่า
          let nx = (dx / minDx) / dist;
          let ny = (dy / minDy) / dist;

          // หาก X ทับกันเกือบตรง ให้เอียงแรงผลักออกทางซ้าย-ขวา แทนที่จะผลักขึ้นลงเป็นแถวตรง
          if (Math.abs(dx) < 2) {
            nx = (i % 2 === 0 ? 1 : -1) * 0.8;
          }

          const shiftX = nx * minDx * overlap * 0.5 * damping;
          const shiftY = ny * minDy * overlap * 0.4 * damping;

          items[i].pos_x -= shiftX;
          items[i].pos_y -= shiftY;
          items[j].pos_x += shiftX;
          items[j].pos_y += shiftY;

          // ตรึงขอบเขตผิวน้ำที่ปลอดภัย (ไม่ชนขอบจอ และไม่โดนปุ่มหรือหัวสระบัง)
          items[i].pos_x = Math.max(9, Math.min(91, items[i].pos_x));
          items[i].pos_y = Math.max(48, Math.min(69, items[i].pos_y));
          items[j].pos_x = Math.max(9, Math.min(91, items[j].pos_x));
          items[j].pos_y = Math.max(48, Math.min(69, items[j].pos_y));
        }
      }
    }
  }

  // จัดลำดับความลึก (Depth Sorting): กระทงที่อยู่ไกลเรนเดอร์ก่อน กระทงที่อยู่ใกล้เรนเดอร์ทับด้านบน
  items.sort((a, b) => a.pos_y - b.pos_y);

  // คำนวณ Perspective Scaling ให้มีมิติใกล้ใหญ่ ไกลเล็ก
  return items.map((item) => {
    const depthFactor = Math.max(0, Math.min(1, (item.pos_y - 48) / 21));
    const calculatedScale = Math.round((0.74 + depthFactor * 0.28) * 100) / 100;
    return {
      ...item,
      scale: item.scale ? Math.min(item.scale, calculatedScale * 1.05) : calculatedScale,
    };
  });
}
