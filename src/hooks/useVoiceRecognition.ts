
import { useRef, useState, useCallback } from "react";
import { DemoRecognizer } from "@/lib/voice/DemoRecognizer";
import { RealVoiceRecognizer } from "@/lib/voice/RealVoiceRecognizer";
import { useTranslation } from "@/hooks/useTranslation";

export interface TranscriptResult {
  transcript: string;
  translation: string;
}

export function useVoiceRecognition() {
  const recognizerRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<TranscriptResult>({
    transcript: "",
    translation: "",
  });
  const [leftLang, setLeftLang] = useState("en");
  const [rightLang, setRightLang] = useState("ja");
  const { translate } = useTranslation();

  const retranslate = useCallback(
    async (
      newTranscript: string,
      lLang: string = leftLang,
      rLang: string = rightLang
    ) => {
      const translation = await translate({
        text: newTranscript,
        from: lLang,
        to: rLang,
      });
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
      if (!recognizerRef.current || !(recognizerRef.current instanceof RealVoiceRecognizer)) {
        recognizerRef.current = new RealVoiceRecognizer();
      }
    } else {
      if (!recognizerRef.current || !(recognizerRef.current instanceof DemoRecognizer)) {
        recognizerRef.current = new DemoRecognizer();
      }
    }
    try {
      recognizerRef.current.start(
        (data: TranscriptResult) => {
          setResult(data);
        },
        leftLang,
        rightLang,
        translate
      );
    } catch (e) {
      setRecording(false);
    }
  };

  const stop = () => {
    setRecording(false);
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
  };

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
