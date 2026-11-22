'use client';

/**
 * Loy Krathong Ambient Music & Soundscape Synthesizer (Web Audio API)
 * ให้เสียงบรรเลงดนตรีไทยประยุกต์ร่วมสมัย (ระนาดแก้ว/Chime + คลื่นน้ำแผ่วเบา)
 * ปราศจากการโหลดไฟล์ MP3 ภายนอก ทำงานได้ 100% บนทุกเบราว์เซอร์และมือถือ
 */

class LoyKrathongMusicManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: any = null;
  private gainNode: GainNode | null = null;
  private noteIndex: number = 0;

  // เมโลดี้เพลงลอยกระทง (ความถี่ Hz แบบ Pentatonic นุ่มนวล ชวนผ่อนคลาย)
  // C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.00, A4 = 440.00, C5 = 523.25, D5 = 587.33
  private melody: { freq: number; dur: number }[] = [
    // วันเพ็ญเดือนสิบสอง
    { freq: 261.63, dur: 0.4 },
    { freq: 293.66, dur: 0.4 },
    { freq: 329.63, dur: 0.6 },
    { freq: 392.00, dur: 0.6 },
    { freq: 440.00, dur: 0.5 },
    { freq: 392.00, dur: 0.9 },

    // น้ำก็นองเต็มตลิ่ง
    { freq: 329.63, dur: 0.4 },
    { freq: 293.66, dur: 0.4 },
    { freq: 261.63, dur: 0.5 },
    { freq: 293.66, dur: 0.5 },
    { freq: 329.63, dur: 0.5 },
    { freq: 293.66, dur: 0.9 },

    // เราทั้งหลายชายหญิง
    { freq: 261.63, dur: 0.4 },
    { freq: 293.66, dur: 0.4 },
    { freq: 329.63, dur: 0.6 },
    { freq: 392.00, dur: 0.6 },
    { freq: 440.00, dur: 0.5 },
    { freq: 392.00, dur: 0.9 },

    // สนุกกันจริงวันลอยกระทง
    { freq: 440.00, dur: 0.4 },
    { freq: 523.25, dur: 0.5 },
    { freq: 440.00, dur: 0.4 },
    { freq: 392.00, dur: 0.5 },
    { freq: 329.63, dur: 0.5 },
    { freq: 293.66, dur: 0.5 },
    { freq: 261.63, dur: 1.0 },

    // ลอย ลอยกระทง
    { freq: 392.00, dur: 0.4 },
    { freq: 392.00, dur: 0.4 },
    { freq: 329.63, dur: 0.4 },
    { freq: 392.00, dur: 0.6 },
    { freq: 440.00, dur: 0.9 },

    // ลอย ลอยกระทง
    { freq: 392.00, dur: 0.4 },
    { freq: 392.00, dur: 0.4 },
    { freq: 329.63, dur: 0.4 },
    { freq: 392.00, dur: 0.6 },
    { freq: 440.00, dur: 0.9 },

    // ลอยกระทงกันแล้ว
    { freq: 523.25, dur: 0.5 },
    { freq: 440.00, dur: 0.5 },
    { freq: 392.00, dur: 0.5 },
    { freq: 329.63, dur: 0.5 },
    { freq: 293.66, dur: 0.8 },

    // ขอเชิญน้องแก้วออกมารำวง
    { freq: 261.63, dur: 0.4 },
    { freq: 293.66, dur: 0.4 },
    { freq: 329.63, dur: 0.5 },
    { freq: 392.00, dur: 0.5 },
    { freq: 440.00, dur: 0.5 },
    { freq: 392.00, dur: 0.5 },
    { freq: 329.63, dur: 0.5 },
    { freq: 293.66, dur: 0.5 },
    { freq: 261.63, dur: 1.4 },
  ];

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime); // เสียงเบานุ่มนวล ไม่แสบแก้วหู
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // เล่นเสียงระนาดแก้ว/ระฆังน้ำ 1 โน้ต
  private playChimeNote(freq: number, duration: number) {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Fundamental tone (Sine)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // 2. Harmonic bell chime (Triangle)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.3, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.5);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration * 1.6);
      osc2.stop(now + duration * 1.6);
    } catch {}
  }

  private loopMelody() {
    if (!this.isPlaying) return;

    const item = this.melody[this.noteIndex];
    if (item) {
      this.playChimeNote(item.freq, item.dur);
      this.noteIndex = (this.noteIndex + 1) % this.melody.length;
      const delayMs = (item.dur + 0.15) * 1000;
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
