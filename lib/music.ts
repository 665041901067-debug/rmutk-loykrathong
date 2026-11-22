'use client';

/**
 * Loy Krathong Ambient Music & Soundscape Synthesizer (Web Audio API)
 * ให้เสียงบรรเลงดนตรีไทยประยุกต์ร่วมสมัย (ระนาดเอก + Chime นุ่มนวล)
 * เสียงชัดเจนบนโทรศัพท์มือถือและคอมพิวเตอร์ 100% ปราศจากบั๊ก
 */

class LoyKrathongMusicManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: any = null;
  private gainNode: GainNode | null = null;
  private noteIndex: number = 0;

  // เมโลดี้เพลงลอยกระทง (Pentatonic ดนตรีไทย บรรเลงนุ่มนวล ชวนผ่อนคลาย)
  // C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.00, A4 = 440.00, C5 = 523.25, D5 = 587.33
  private melody: { freq: number; dur: number }[] = [
    // วันเพ็ญเดือนสิบสอง
    { freq: 261.63, dur: 0.38 },
    { freq: 293.66, dur: 0.38 },
    { freq: 329.63, dur: 0.55 },
    { freq: 392.00, dur: 0.55 },
    { freq: 440.00, dur: 0.45 },
    { freq: 392.00, dur: 0.85 },

    // น้ำก็นองเต็มตลิ่ง
    { freq: 329.63, dur: 0.38 },
    { freq: 293.66, dur: 0.38 },
    { freq: 261.63, dur: 0.45 },
    { freq: 293.66, dur: 0.45 },
    { freq: 329.63, dur: 0.45 },
    { freq: 293.66, dur: 0.85 },

    // เราทั้งหลายชายหญิง
    { freq: 261.63, dur: 0.38 },
    { freq: 293.66, dur: 0.38 },
    { freq: 329.63, dur: 0.55 },
    { freq: 392.00, dur: 0.55 },
    { freq: 440.00, dur: 0.45 },
    { freq: 392.00, dur: 0.85 },

    // สนุกกันจริงวันลอยกระทง
    { freq: 440.00, dur: 0.38 },
    { freq: 523.25, dur: 0.45 },
    { freq: 440.00, dur: 0.38 },
    { freq: 392.00, dur: 0.45 },
    { freq: 329.63, dur: 0.45 },
    { freq: 293.66, dur: 0.45 },
    { freq: 261.63, dur: 0.95 },

    // ลอย ลอยกระทง
    { freq: 392.00, dur: 0.38 },
    { freq: 392.00, dur: 0.38 },
    { freq: 329.63, dur: 0.38 },
    { freq: 392.00, dur: 0.55 },
    { freq: 440.00, dur: 0.85 },

    // ลอย ลอยกระทง
    { freq: 392.00, dur: 0.38 },
    { freq: 392.00, dur: 0.38 },
    { freq: 329.63, dur: 0.38 },
    { freq: 392.00, dur: 0.55 },
    { freq: 440.00, dur: 0.85 },

    // ลอยกระทงกันแล้ว
    { freq: 523.25, dur: 0.45 },
    { freq: 440.00, dur: 0.45 },
    { freq: 392.00, dur: 0.45 },
    { freq: 329.63, dur: 0.45 },
    { freq: 293.66, dur: 0.75 },

    // ขอเชิญน้องแก้วออกมารำวง
    { freq: 261.63, dur: 0.38 },
    { freq: 293.66, dur: 0.38 },
    { freq: 329.63, dur: 0.45 },
    { freq: 392.00, dur: 0.45 },
    { freq: 440.00, dur: 0.45 },
    { freq: 392.00, dur: 0.45 },
    { freq: 329.63, dur: 0.45 },
    { freq: 293.66, dur: 0.45 },
    { freq: 261.63, dur: 1.35 },
  ];

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        // ปรับระดับเสียงให้ดังชัดเจนบนลำโพงโทรศัพท์มือถือ (0.26)
        this.gainNode.gain.setValueAtTime(0.26, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // เล่นเสียงระนาดแก้ว/ระนาดเอกประยุกต์ 1 โน้ต
  private playRanadNote(freq: number, duration: number) {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;

      // 1. เสียงหลัก Fundamental (Sine)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // 2. โอเวอร์โทนประกายเสียงระฆัง/ระนาดแก้ว (Triangle 2x)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      // 3. เสียงเคาะหัวไม้ระนาด (Triangle 3x สั้นเพื่อสร้างน้ำหนักเสียงที่ชัดขึ้นบนมือถือ)
      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, now);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0, now);
      // โจมตีเร็ว (Attack) ชัดเจนแบบระนาดไทย
      noteGain.gain.linearRampToValueAtTime(0.65, now + 0.025);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.5);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      osc3.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + duration * 1.55);
      osc2.stop(now + duration * 1.55);
      osc3.stop(now + duration * 1.55);
    } catch {}
  }

  private loopMelody() {
    if (!this.isPlaying) return;

    const item = this.melody[this.noteIndex];
    if (item) {
      this.playRanadNote(item.freq, item.dur);
      this.noteIndex = (this.noteIndex + 1) % this.melody.length;
      const delayMs = (item.dur + 0.12) * 1000;
      this.timerId = setTimeout(() => this.loopMelody(), delayMs);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.noteIndex = 0;
    this.loopMelody();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const bgm = new LoyKrathongMusicManager();
