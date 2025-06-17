const demoEnglish = [
  "Hello, my name is John.",
  "I am demonstrating how this voice-to-text app works.",
  "Now, let's see how quickly you can translate text to Japanese.",
  "Thank you for trying it out!",
];

type Callback = (result: { transcript: string; translation: string }) => void;

export class DemoRecognizer {
  private _timer: any = null;
  private i = 0;
  private active = false;

  start(
    onResult: Callback,
    leftLang: string,
    rightLang: string,
    translate: (params: { text: string; from: string; to: string }) => Promise<string>
  ) {
    console.log("[DemoRecognizer] Starting demo mode with languages:", { leftLang, rightLang });
    this.i = 0;
    this.active = true;
    this.stop();
    
    this._timer = setInterval(async () => {
      if (!this.active) {
        this.stop();
        return;
      }
      
      if (this.i < demoEnglish.length) {
        const transcript = demoEnglish.slice(0, this.i + 1).join(" ");
        console.log("[DemoRecognizer] Demo transcript:", transcript);
        
        try {
          const translation = await translate({
            text: transcript,
            from: leftLang,
            to: rightLang,
          });
          console.log("[DemoRecognizer] Demo translation:", translation);
          
          onResult({ transcript, translation });
          this.i++;
        } catch (error) {
          console.error("[DemoRecognizer] Translation error:", error);
          // Still show transcript even if translation fails
          onResult({ transcript, translation: `[Translation error: ${transcript}]` });
          this.i++;
        }
      } else {
        console.log("[DemoRecognizer] Demo completed");
        this.stop();
      }
    }, 2000); // Slower interval for better readability
  }

  stop() {
    console.log("[DemoRecognizer] Stopping demo");
    this.active = false;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}
