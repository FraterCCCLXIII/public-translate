type Callback = (result: { transcript: string; translation: string }) => void;

export class RealVoiceRecognizer {
  private recognition: any;
  private active = false;
  private transcript = "";
  private interimTranscript = "";
  private onResult: Callback = () => {};
  private leftLang: string = "en";
  private rightLang: string = "ja";
  private translate: (params: { text: string; from: string; to: string }) => Promise<string> = async () => "";
  private restartTimeout: NodeJS.Timeout | null = null;
  private translationTimeout: NodeJS.Timeout | null = null;
  private readonly RESTART_DELAY = 100; // ms to wait before restarting
  private readonly TRANSLATION_DELAY = 500; // ms to wait before translating
  private readonly MAX_RESTART_ATTEMPTS = 3;
  private restartAttempts = 0;
  private lastTranslationTime = 0;

  private clearTimeouts() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.translationTimeout) {
      clearTimeout(this.translationTimeout);
      this.translationTimeout = null;
    }
  }

  private scheduleRestart() {
    this.clearTimeouts();
    if (this.active && this.restartAttempts < this.MAX_RESTART_ATTEMPTS) {
      console.log(`[RealVoiceRecognizer] Scheduling restart attempt ${this.restartAttempts + 1}/${this.MAX_RESTART_ATTEMPTS}`);
      this.restartTimeout = setTimeout(() => {
        this.restartAttempts++;
        this.restartRecognition();
      }, this.RESTART_DELAY);
    } else if (this.restartAttempts >= this.MAX_RESTART_ATTEMPTS) {
      console.log("[RealVoiceRecognizer] Max restart attempts reached, stopping recognition");
      this.stop();
    }
  }

  private scheduleTranslation(finalTranscript: string) {
    this.clearTimeouts();
    const now = Date.now();
    if (now - this.lastTranslationTime < this.TRANSLATION_DELAY) {
      // If we've translated recently, schedule a new translation
      this.translationTimeout = setTimeout(() => {
        this.performTranslation(finalTranscript);
      }, this.TRANSLATION_DELAY);
    } else {
      // Otherwise translate immediately
      this.performTranslation(finalTranscript);
    }
  }

  private async performTranslation(finalTranscript: string) {
    if (!finalTranscript.trim()) return;
    
    try {
      console.log("[RealVoiceRecognizer] Translating:", finalTranscript);
      const translation = await this.translate({
        text: finalTranscript,
        from: this.leftLang,
        to: this.rightLang,
      });
      this.lastTranslationTime = Date.now();
      this.onResult({
        transcript: this.transcript,
        translation,
      });
    } catch (error) {
      console.error("[RealVoiceRecognizer] Translation error:", error);
    }
  }

  private restartRecognition() {
    if (!this.active) return;
    
    try {
      console.log("[RealVoiceRecognizer] Restarting recognition");
      this.recognition.stop();
      // Small delay to ensure clean stop
      setTimeout(() => {
        if (this.active) {
          this.recognition.start();
          this.restartAttempts = 0; // Reset attempts on successful restart
        }
      }, 100);
    } catch (e) {
      console.error("[RealVoiceRecognizer] Error restarting recognition:", e);
      this.scheduleRestart();
    }
  }

  private normalizeTranscript(text: string): string {
    // Remove multiple spaces and normalize whitespace
    return text.replace(/\s+/g, ' ').trim();
  }

  start(
    onResult: Callback,
    leftLang: string,
    rightLang: string,
    translate: (params: { text: string; from: string; to: string }) => Promise<string>
  ) {
    this.transcript = "";
    this.interimTranscript = "";
    this.active = true;
    this.restartAttempts = 0;
    this.lastTranslationTime = 0;
    this.onResult = onResult;
    this.leftLang = leftLang;
    this.rightLang = rightLang;
    this.translate = translate;
    
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      throw new Error("Web Speech API not available");
    }
    
    this.recognition = new SpeechRecognitionCtor();
    this.recognition.interimResults = true;
    this.recognition.lang = leftLang === "en" ? "en-US" : leftLang;
    this.recognition.continuous = true;
    this.recognition.maxAlternatives = 1;
    
    this.recognition.onresult = async (event: any) => {
      console.log("[RealVoiceRecognizer] onresult event:", event);
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Reset restart attempts on any result
      this.restartAttempts = 0;

      // Update the transcript with final results
      if (finalTranscript) {
        this.transcript = this.normalizeTranscript(this.transcript + " " + finalTranscript);
        console.log("[RealVoiceRecognizer] Final transcript updated:", this.transcript);
        // Schedule translation for final results
        this.scheduleTranslation(this.transcript);
      }

      // Combine final and interim results for display
      const displayTranscript = this.normalizeTranscript(this.transcript + " " + interimTranscript);
      console.log("[RealVoiceRecognizer] Display transcript:", displayTranscript);

      // Update UI with interim results immediately
      if (interimTranscript) {
        this.onResult({
          transcript: displayTranscript,
          translation: "", // Don't update translation for interim results
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("[RealVoiceRecognizer] Error:", event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'network') {
        this.scheduleRestart();
      }
    };

    this.recognition.onend = () => {
      console.log("[RealVoiceRecognizer] Recognition ended");
      if (this.active) {
        this.scheduleRestart();
      }
    };

    this.recognition.onaudiostart = () => {
      console.log("[RealVoiceRecognizer] Audio started");
      this.restartAttempts = 0;
    };

    this.recognition.onspeechstart = () => {
      console.log("[RealVoiceRecognizer] Speech started");
      this.restartAttempts = 0;
    };

    console.log("[RealVoiceRecognizer] Starting recognition with lang:", this.recognition.lang);
    this.recognition.start();
  }

  stop() {
    console.log("[RealVoiceRecognizer] Stopping recognition");
    this.clearTimeouts();
    if (this.recognition && this.active) {
      this.recognition.stop();
    }
    this.active = false;
    this.transcript = "";
    this.interimTranscript = "";
    this.restartAttempts = 0;
    this.lastTranslationTime = 0;
  }
}
