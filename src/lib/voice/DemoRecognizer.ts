
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
  start(
    onResult: Callback,
    leftLang: string,
    rightLang: string,
    translate: (params: { text: string; from: string; to: string }) => Promise<string>
  ) {
    this.i = 0;
    this.stop();
    this._timer = setInterval(async () => {
      if (this.i < demoEnglish.length) {
        const transcript = demoEnglish.slice(0, this.i + 1).join(" ");
        const translation = await translate({
          text: transcript,
          from: leftLang,
          to: rightLang,
        });
        onResult({ transcript, translation });
        this.i++;
      } else {
        this.stop();
      }
    }, 1400);
  }
  stop() {
    if (this._timer) {
      clearInterval(this._timer);
    }
    this._timer = null;
  }
}
