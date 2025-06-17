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
      console.log("[useVoiceRecognition] retranslate called", { newTranscript, lLang, rLang });
      const translation = await translate({
        text: newTranscript,
        from: lLang,
        to: rLang,
      });
      setResult({
        transcript: newTranscript,
        translation,
      });
      console.log("[useVoiceRecognition] retranslate result set", { transcript: newTranscript, translation });
    },
    [leftLang, rightLang, translate]
  );

  const start = async (forceStart = false) => {
    console.log("[useVoiceRecognition] start called. Attempting to start recognition...", {
      leftLang,
      rightLang,
      recording
    });

    // Check for microphone permissions first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("[useVoiceRecognition] Requesting microphone permission...");
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("[useVoiceRecognition] Microphone permission granted");
      }
    } catch (error) {
      console.error("[useVoiceRecognition] Microphone permission denied:", error);
      alert("Microphone access is required for voice recognition. Please allow microphone access and try again.");
      return;
    }

    setRecording(true);
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      if (!recognizerRef.current || !(recognizerRef.current instanceof RealVoiceRecognizer)) {
        recognizerRef.current = new RealVoiceRecognizer();
        console.log("[useVoiceRecognition] Using RealVoiceRecognizer.");
      }
    } else {
      if (!recognizerRef.current || !(recognizerRef.current instanceof DemoRecognizer)) {
        recognizerRef.current = new DemoRecognizer();
        console.log("[useVoiceRecognition] Using DemoRecognizer (fallback).");
      }
    }
    try {
      recognizerRef.current.start(
        (data: TranscriptResult) => {
          console.log("[useVoiceRecognition] Recognizer returned result", data);
          setResult(data);
        },
        leftLang,
        rightLang,
        translate
      );
    } catch (e) {
      setRecording(false);
      console.error("[useVoiceRecognition] Error starting recognition", e);
      alert("Failed to start voice recognition. Please check your microphone and try again.");
    }
  };

  const stop = () => {
    console.log("[useVoiceRecognition] stop called. Stopping recognition...");
    setRecording(false);
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
  };

  const clearTranscript = () => {
    console.log("[useVoiceRecognition] clearTranscript called");
    setResult({
      transcript: "",
      translation: "",
    });
  };

  // Debug - log state updates for recording & result
  // Could be verbose in rapid update scenarios, but useful for tracing
  // Only runs in development
  if (process.env.NODE_ENV === "development") {
    if (typeof window !== "undefined") {
      const w = window as any;
      if (w.__lastVoiceDebugRecording !== recording) {
        console.log("[useVoiceRecognition] recording state changed:", recording);
        w.__lastVoiceDebugRecording = recording;
      }

      if (
        !w.__lastVoiceDebugResult ||
        w.__lastVoiceDebugResult.transcript !== result.transcript ||
        w.__lastVoiceDebugResult.translation !== result.translation
      ) {
        console.log("[useVoiceRecognition] result state changed:", result);
        w.__lastVoiceDebugResult = result;
      }
    }
  }

  return {
    recording,
    result,
    start,
    stop,
    clearTranscript,
    leftLang,
    rightLang,
    setLeftLang,
    setRightLang,
    retranslate,
  };
}

