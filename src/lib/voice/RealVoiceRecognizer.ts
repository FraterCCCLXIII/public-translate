
type Callback = (result: { transcript: string; translation: string }) => void;

export class RealVoiceRecognizer {
  private recognition: any;
  private active = false;
  private transcript = "";
  private onResult: Callback = () => {};
  private leftLang: string = "en";
  private rightLang: string = "ja";
  private translate: (params: { text: string; from: string; to: string }) => Promise<string> = async () => "";

  start(
    onResult: Callback,
    leftLang: string,
    rightLang: string,
    translate: (params: { text: string; from: string; to: string }) => Promise<string>
  ) {
    this.transcript = "";
    this.active = true;
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
    this.recognition.onresult = async (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      this.transcript = (this.transcript + " " + finalTranscript).trim();
      const translation = this.transcript
        ? await this.translate({ text: this.transcript, from: this.leftLang, to: this.rightLang })
        : "";
      this.onResult({
        transcript: this.transcript,
        translation,
      });
    };
    this.recognition.onerror = (event: any) => {};
    this.recognition.onend = () => {
      this.active = false;
    };
    this.recognition.start();
  }
  stop() {
    if (this.recognition && this.active) {
      this.recognition.stop();
    }
    this.active = false;
  }
}
