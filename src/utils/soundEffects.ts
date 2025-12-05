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

// Background music state
let menuMusicInterval: number | null = null;
let raceMusicInterval: number | null = null;
let musicGain: GainNode | null = null;

// Menu music - chill synth pad with arpeggio
export const startMenuMusic = () => {
  stopAllMusic();
  const ctx = getAudioContext();
  
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.1;
  musicGain.connect(ctx.destination);
  
  // Chord progression: Am - F - C - G (classic 90s)
  const chords = [
    [220, 261.63, 329.63], // Am
    [174.61, 220, 261.63], // F
    [261.63, 329.63, 392], // C
    [196, 246.94, 293.66], // G
  ];
  
  let chordIndex = 0;
  let noteIndex = 0;
  
  const playArpeggio = () => {
    const chord = chords[chordIndex];
    const freq = chord[noteIndex];
    
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    noteGain.gain.setValueAtTime(0.15, ctx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(noteGain);
    noteGain.connect(musicGain!);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    
    noteIndex = (noteIndex + 1) % 3;
    if (noteIndex === 0) {
      chordIndex = (chordIndex + 1) % chords.length;
    }
  };
  
  // Play bass note
  const playBass = () => {
    const bassNotes = [110, 87.31, 130.81, 98]; // A2, F2, C3, G2
    const freq = bassNotes[chordIndex];
    
    const osc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    bassGain.gain.setValueAtTime(0.12, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    
    osc.connect(bassGain);
    bassGain.connect(musicGain!);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  };
  
  playArpeggio();
  playBass();
  
  menuMusicInterval = window.setInterval(() => {
    playArpeggio();
    if (noteIndex === 0) playBass();
  }, 200);
};

// Race music - intense driving beat
export const startRaceMusic = () => {
  stopAllMusic();
  const ctx = getAudioContext();
  
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.08;
  musicGain.connect(ctx.destination);
  
  let beat = 0;
  
  const playBeat = () => {
    // Kick drum on 1 and 3
    if (beat % 4 === 0 || beat % 4 === 2) {
      const kick = ctx.createOscillator();
      const kickGain = ctx.createGain();
      
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, ctx.currentTime);
      kick.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
      
      kickGain.gain.setValueAtTime(0.4, ctx.currentTime);
      kickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      kick.connect(kickGain);
      kickGain.connect(musicGain!);
      
      kick.start();
      kick.stop(ctx.currentTime + 0.15);
    }
    
    // Hi-hat on every beat
    const hihat = ctx.createOscillator();
    const hihatGain = ctx.createGain();
    
    hihat.type = 'square';
    hihat.frequency.value = 8000;
    
    hihatGain.gain.setValueAtTime(beat % 2 === 0 ? 0.08 : 0.04, ctx.currentTime);
    hihatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    hihat.connect(hihatGain);
    hihatGain.connect(musicGain!);
    
    hihat.start();
    hihat.stop(ctx.currentTime + 0.05);
    
    // Synth lead riff every 8 beats
    if (beat % 8 === 0) {
      const riffNotes = [440, 523.25, 659.25, 523.25]; // A4, C5, E5, C5
      riffNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const riffGain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        const startTime = ctx.currentTime + i * 0.1;
        riffGain.gain.setValueAtTime(0, startTime);
        riffGain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
        riffGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        
        osc.connect(riffGain);
        riffGain.connect(musicGain!);
        
        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    }
    
    // Bass line
    if (beat % 2 === 0) {
      const bassNotes = [110, 110, 146.83, 130.81]; // A2, A2, D3, C3
      const bassFreq = bassNotes[Math.floor(beat / 4) % 4];
      
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      
      bass.type = 'square';
      bass.frequency.value = bassFreq;
      
      bassGain.gain.setValueAtTime(0.15, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      bass.connect(bassGain);
      bassGain.connect(musicGain!);
      
      bass.start();
      bass.stop(ctx.currentTime + 0.2);
    }
    
    beat = (beat + 1) % 32;
  };
  
  playBeat();
  raceMusicInterval = window.setInterval(playBeat, 125); // 120 BPM
};

export const stopAllMusic = () => {
  if (menuMusicInterval) {
    clearInterval(menuMusicInterval);
    menuMusicInterval = null;
  }
  if (raceMusicInterval) {
    clearInterval(raceMusicInterval);
    raceMusicInterval = null;
  }
};

export const setMusicVolume = (volume: number) => {
  if (musicGain) {
    musicGain.gain.value = Math.max(0, Math.min(1, volume));
  }
};

// Cleanup function
export const cleanupAudio = () => {
  stopEngineSound();
  stopAllMusic();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};
