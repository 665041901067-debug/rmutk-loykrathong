'use client';

// SoundManager silenced per user request (เอาเสียงออก)
class SoundManager {
  public toggleMute(): boolean {
    return true;
  }

  public getMuted(): boolean {
    return true;
  }

  public playWaterDrop() {}
  public playTempleBell() {}
  public playSparkle() {}
}

export const sound = new SoundManager();
