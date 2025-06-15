/**
 * Microphone recording and voice-to-text: fallback to demo if Web Speech API not present.
 */
export interface TranscriptResult {
  transcript: string;
  translation: string;
}
type Callback = (result: TranscriptResult) => void;

const demoEnglish = [
  "Hello, my name is John.",
  "I am demonstrating how this voice-to-text app works.",
  "Now, let's see how quickly you can translate text to Japanese.",
  "Thank you for trying it out!",
];
const demoJapanese = [
  "こんにちは、私の名前はジョンです。",
  "この音声から文字起こしアプリの動作を説明しています。",
  "では、どれだけ速く日本語に翻訳できるか見てみましょう。",
  "使ってくれてありがとう！",
];

class DemoRecognizer {
  private _timer: any = null;
  private i = 0;
  start(onResult: Callback) {
    this.i = 0;
    this.stop();
    this._timer = setInterval(() => {
      if (this.i < demoEnglish.length) {
        onResult({
          transcript: demoEnglish.slice(0, this.i + 1).join(" "),
          translation: demoJapanese.slice(0, this.i + 1).join(" "),
        });
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

// Real Voice Recognition via browser
class RealVoiceRecognizer {
  private recognition: any;
  private active = false;
  private interim = "";
  private transcript = "";
  private onResult: Callback = () => {};

  start(onResult: Callback) {
    this.transcript = "";
    this.active = true;
    this.onResult = onResult;
    // proper type detection of web speech API
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) throw new Error("Web Speech API not available");
    this.recognition = new SpeechRecognitionCtor();
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.continuous = true;
    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      this.transcript = (this.transcript + " " + finalTranscript).trim();
      // For demo, fake translation
      this.onResult({
        transcript: this.transcript,
        translation: "（日本語訳のデモ: " + this.transcript + "）",
      });
    };
    this.recognition.onerror = () => {};
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

import { useRef, useState } from "react";
export function useVoiceRecognition() {
  const recognizerRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<TranscriptResult>({
    transcript: "",
    translation: "",
  });

  const start = () => {
    setRecording(true);
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      if (!recognizerRef.current || !(recognizerRef.current instanceof RealVoiceRecognizer)) {
        recognizerRef.current = new RealVoiceRecognizer();
      }
    } else {
      if (!recognizerRef.current || !(recognizerRef.current instanceof DemoRecognizer)) {
        recognizerRef.current = new DemoRecognizer();
      }
    }
    recognizerRef.current.start((data: TranscriptResult) => setResult(data));
  };

  const stop = () => {
    setRecording(false);
    recognizerRef.current?.stop();
  };

  return {
    recording,
    result,
    start,
    stop,
  };
}
