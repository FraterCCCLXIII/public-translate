/**
 * Microphone recording and voice-to-text: fallback to demo if Web Speech API not present.
 */
import { useRef, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

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
  start(onResult: Callback, leftLang: string, rightLang: string, translate: (params: { text: string, from: string, to: string }) => Promise<string>) {
    console.log('[DemoRecognizer] start, langs:', { leftLang, rightLang });
    this.i = 0;
    this.stop();
    this._timer = setInterval(async () => {
      if (this.i < demoEnglish.length) {
        const transcript = demoEnglish.slice(0, this.i + 1).join(" ");
        const translation = await translate({ text: transcript, from: leftLang, to: rightLang });
        console.log('[DemoRecognizer] demo transcript updated', { transcript, translation });
        onResult({
          transcript,
          translation,
        });
        this.i++;
      } else {
        this.stop();
      }
    }, 1400);
  }
  stop() {
    console.log('[DemoRecognizer] stop called');
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
  private leftLang: string = "en";
  private rightLang: string = "ja";
  private translate: (params: { text: string, from: string, to: string }) => Promise<string> = async () => "";

  start(onResult: Callback, leftLang: string, rightLang: string, translate: (params: { text: string, from: string, to: string }) => Promise<string>) {
    this.transcript = "";
    this.active = true;
    this.onResult = onResult;
    this.leftLang = leftLang;
    this.rightLang = rightLang;
    this.translate = translate;
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      console.error('[RealVoiceRecognizer] Web Speech API not available');
      throw new Error("Web Speech API not available");
    }
    this.recognition = new SpeechRecognitionCtor();
    this.recognition.interimResults = true;
    this.recognition.lang = leftLang === "en" ? "en-US" : leftLang;
    this.recognition.continuous = true;
    this.recognition.onresult = async (event: any) => {
      console.log('[RealVoiceRecognizer] onresult event', event);
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      this.transcript = (this.transcript + " " + finalTranscript).trim();
      // Use actual translation
      const translation = this.transcript
        ? await this.translate({ text: this.transcript, from: this.leftLang, to: this.rightLang })
        : "";
      console.log('[RealVoiceRecognizer] transcript/translation', {transcript: this.transcript, translation});
      this.onResult({
        transcript: this.transcript,
        translation,
      });
    };
    this.recognition.onerror = (event: any) => {
      console.error('[RealVoiceRecognizer] onerror event', event);
    };
    this.recognition.onend = () => {
      this.active = false;
      console.log('[RealVoiceRecognizer] recognition ended');
    };
    console.log('[RealVoiceRecognizer] recognition.start() called, lang:', this.recognition.lang);
    this.recognition.start();
  }
  stop() {
    if (this.recognition && this.active) {
      this.recognition.stop();
      console.log('[RealVoiceRecognizer] recognition.stop() called');
    }
    this.active = false;
  }
}

export function useVoiceRecognition() {
  const recognizerRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<TranscriptResult>({
    transcript: "",
    translation: "",
  });
  // Language states
  const [leftLang, setLeftLang] = useState("en");
  const [rightLang, setRightLang] = useState("ja");
  // Translation logic
  const { translate } = useTranslation();

  // Re-translate if transcript, leftLang, or rightLang changes
  const retranslate = useCallback(
    async (newTranscript: string, lLang: string = leftLang, rLang: string = rightLang) => {
      console.log('[useVoiceRecognition] retranslate called', { newTranscript, lLang, rLang });
      const translation = await translate({ text: newTranscript, from: lLang, to: rLang });
      setResult({
        transcript: newTranscript,
        translation,
      });
    },
    [leftLang, rightLang, translate]
  );

  const start = () => {
    setRecording(true);
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      console.log('[useVoiceRecognition] Using RealVoiceRecognizer');
      if (!recognizerRef.current || !(recognizerRef.current instanceof RealVoiceRecognizer)) {
        recognizerRef.current = new RealVoiceRecognizer();
      }
    } else {
      console.log('[useVoiceRecognition] Using DemoRecognizer');
      if (!recognizerRef.current || !(recognizerRef.current instanceof DemoRecognizer)) {
        recognizerRef.current = new DemoRecognizer();
      }
    }
    try {
      recognizerRef.current.start(
        (data: TranscriptResult) => {
          console.log('[useVoiceRecognition] onResult:', data);
          setResult(data);
        },
        leftLang,
        rightLang,
        translate
      );
    } catch (e) {
      console.error('[useVoiceRecognition] Error starting recognizer', e);
      setRecording(false);
    }
  };

  const stop = () => {
    setRecording(false);
    if (recognizerRef.current) {
      console.log('[useVoiceRecognition] stop called');
      recognizerRef.current.stop();
    }
  };

  // Allow Index to set langs via setter
  return {
    recording,
    result,
    start,
    stop,
    leftLang,
    rightLang,
    setLeftLang,
    setRightLang,
    retranslate,
  };
}
