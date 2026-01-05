/**
 * Text-to-Speech Service with Word-by-Word Highlighting
 * Uses Web Speech API for browser TTS
 * 
 * INTEGRATION NOTE: For production with better quality, consider:
 * - Google Cloud Text-to-Speech
 * - Amazon Polly
 * - Azure Cognitive Services Speech
 * - ElevenLabs for natural-sounding voices
 */

export class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.voices = [];
    this.onWordBoundary = null;
    this.onEnd = null;
    this.onStart = null;
    
    // Load voices
    this.loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
  }

  /**
   * Get available voices, prefer en-IN (Indian English)
   */
  getVoice(preferredLang = 'en-IN') {
    // Try Indian English first
    let langVoices = this.voices.filter(v => v.lang === 'en-IN' || v.lang === 'en_IN');
    
    // Fallback to en-GB (closer to Indian English than en-US)
    if (langVoices.length === 0) {
      langVoices = this.voices.filter(v => v.lang.startsWith('en-GB'));
    }
    
    // Final fallback to any English voice
    if (langVoices.length === 0) {
      langVoices = this.voices.filter(v => v.lang.startsWith('en'));
    }
    
    return langVoices[0] || this.voices[0];
  }

  /**
   * Speak text with word-by-word callback
   */
  speak(text, options = {}) {
    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.getVoice(options.lang);
    utterance.rate = options.rate || 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Event handlers
    utterance.onstart = () => {
      this.isPlaying = true;
      if (this.onStart) this.onStart();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.currentUtterance = null;
      if (this.onEnd) this.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event);
      this.isPlaying = false;
      this.currentUtterance = null;
    };

    // Word boundary events (for highlighting)
    // Note: Not all browsers support boundary events perfectly
    utterance.onboundary = (event) => {
      if (event.name === 'word' && this.onWordBoundary) {
        const charIndex = event.charIndex;
        const word = this.extractWordAtPosition(text, charIndex);
        this.onWordBoundary({
          word,
          charIndex,
          elapsedTime: event.elapsedTime,
        });
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Speak with simulated word-by-word timing
   * More reliable than browser boundary events
   */
  async speakWithWordTracking(text, options = {}) {
    const words = text.split(/\s+/);
    const rate = options.rate || 0.9;
    const avgWordDuration = 60000 / (150 * rate); // ~150 WPM base rate

    // Start TTS
    this.speak(text, options);

    // Simulate word boundaries
    let charIndex = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const duration = (word.length / 5) * avgWordDuration; // Approximate duration

      await this.delay(duration);
      
      if (this.onWordBoundary && this.isPlaying) {
        this.onWordBoundary({
          word,
          wordIndex: i,
          charIndex,
          totalWords: words.length,
        });
      }

      charIndex += word.length + 1; // +1 for space
    }
  }

  /**
   * Extract word at character position
   */
  extractWordAtPosition(text, charIndex) {
    let start = charIndex;
    let end = charIndex;

    // Find word start
    while (start > 0 && text[start - 1] !== ' ') {
      start--;
    }

    // Find word end
    while (end < text.length && text[end] !== ' ') {
      end++;
    }

    return text.substring(start, end);
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Utility delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * PRODUCTION INTEGRATION EXAMPLE with Google Cloud TTS:
 * 
 * import textToSpeech from '@google-cloud/text-to-speech';
 * 
 * async synthesizeSpeechWithTimings(text) {
 *   const client = new textToSpeech.TextToSpeechClient();
 *   
 *   const request = {
 *     input: { text },
 *     voice: {
 *       languageCode: 'en-US',
 *       name: 'en-US-Neural2-C',
 *     },
 *     audioConfig: {
 *       audioEncoding: 'MP3',
 *       speakingRate: 0.9,
 *     },
 *     enableTimePointing: ['SSML_MARK'], // Get word timings
 *   };
 *   
 *   const [response] = await client.synthesizeSpeech(request);
 *   return {
 *     audioContent: response.audioContent,
 *     timepoints: response.timepoints,
 *   };
 * }
 */

export default TTSService;
