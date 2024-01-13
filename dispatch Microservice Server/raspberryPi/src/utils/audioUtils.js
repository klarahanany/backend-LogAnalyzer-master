function generateSineWave(frequency, duration = 1000) {
    const sampleRate = 44100;
    const amplitude = 0.5 * 32767;
    const numSamples = Math.floor((sampleRate * duration) / 1000);
    const buffer = Buffer.alloc(numSamples * 2);
  
    for (let i = 0; i < numSamples; i++) {
      const t = (i / sampleRate) * frequency * Math.PI * 2;
      const value = Math.round(amplitude * Math.sin(t));
      buffer.writeInt16LE(value, i * 2);
    }
  
    return buffer;
  }
  
  module.exports = { generateSineWave };
  