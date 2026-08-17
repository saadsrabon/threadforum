let audioCtx: AudioContext | null = null;
let unlocked = false;

function getAudioContext() {
  if (!audioCtx && typeof window !== "undefined") {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function unlockNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx || unlocked) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  unlocked = true;
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const start = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, start);
    oscillator.frequency.setValueAtTime(1174.66, start + 0.08);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

    oscillator.start(start);
    oscillator.stop(start + 0.4);
  } catch {
    // Autoplay blocked or Web Audio unavailable
  }
}
