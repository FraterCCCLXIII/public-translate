
/**
 * Placeholder logic for recording audio and getting text+translation.
 * Replace methods here with integration to real APIs (e.g. Web Speech API, OpenAI, Google, etc).
 */

export interface TranscriptResult {
  transcript: string;
  translation: string;
}

type Callback = (result: TranscriptResult) => void;

// This simulates streaming recognition (for UI dev).
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

export class VoiceRecognizer {
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

// Hook for managing voice recognizer. In the real app, replace logic!
import { useRef, useState } from "react";
export function useVoiceRecognition() {
  const recognizerRef = useRef<VoiceRecognizer | null>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<TranscriptResult>({
    transcript: "",
    translation: "",
  });

  const start = () => {
    setRecording(true);
    if (!recognizerRef.current) recognizerRef.current = new VoiceRecognizer();
    recognizerRef.current.start((data) => setResult(data));
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
