// Retro arcade sound effects using Web Audio API

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Engine sound - continuous oscillating tone
let engineOscillator: OscillatorNode | null = null;
let engineGain: GainNode | null = null;

export const startEngineSound = (speed: number = 0) => {
  const ctx = getAudioContext();
  
  if (!engineOscillator) {
    engineOscillator = ctx.createOscillator();
    engineGain = ctx.createGain();
    
    engineOscillator.type = 'sawtooth';
    engineOscillator.frequency.value = 80;
    engineGain.gain.value = 0.08;
    
    engineOscillator.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOscillator.start();
  }
};

export const updateEngineSound = (speed: number) => {
  if (engineOscillator && engineGain) {
    // Map speed (0-200) to frequency (60-300 Hz) for that retro engine rev
    const baseFreq = 60 + (speed / 200) * 240;
    engineOscillator.frequency.value = baseFreq;
    engineGain.gain.value = 0.05 + (speed / 200) * 0.08;
  }
};

export const stopEngineSound = () => {
  if (engineOscillator) {
    engineOscillator.stop();
    engineOscillator = null;
    engineGain = null;
  }
};

// Collision sound - harsh noise burst
export const playCollisionSound = () => {
  const ctx = getAudioContext();
  
  // Create noise using oscillators
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const distortion = ctx.createWaveShaper();
  
  // Distortion curve for harsh sound
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = Math.tanh(x * 10);
  }
  distortion.curve = curve;
  
  osc1.type = 'square';
  osc1.frequency.value = 150;
  osc2.type = 'sawtooth';
  osc2.frequency.value = 80;
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  
  osc1.connect(distortion);
  osc2.connect(distortion);
  distortion.connect(gain);
  gain.connect(ctx.destination);
  
  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.2);
  osc2.stop(ctx.currentTime + 0.2);
};

// Countdown beep - classic arcade beep
export const playCountdownBeep = (isFinal: boolean = false) => {
  const ctx = getAudioContext();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.value = isFinal ? 880 : 440; // Higher pitch for GO!
  
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isFinal ? 0.4 : 0.15));
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + (isFinal ? 0.4 : 0.15));
};

// Victory fanfare - ascending arpeggio
export const playVictorySound = () => {
  const ctx = getAudioContext();
  
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = freq;
    
    const startTime = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
};

// Lose sound - descending sad tone
export const playLoseSound = () => {
  const ctx = getAudioContext();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
  
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

// Cleanup function
export const cleanupAudio = () => {
  stopEngineSound();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};
