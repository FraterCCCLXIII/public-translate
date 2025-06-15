
import { useEffect, useRef } from "react";

/**
 * Calls onAutoPlay after `timeoutMs` of silence (no mic activity/recording).
 * Only fires if `isRecording` is true, and resets if recording restarts.
 * @param isRecording - Is the microphone currently recording?
 * @param transcript - The main transcript (not used, but may trigger effect if relevant)
 * @param translation - The translation to read aloud if silent for timeoutMs
 * @param canAutoPlay - Whether TTS should be triggered (e.g., only on right panel)
 * @param isAudioPlaying - Is TTS currently playing? Prevents overlap.
 * @param setAudioPlaying - Function to update TTS playing state
 * @param lang - language for TTS
 * @param timeoutMs - silence threshold in ms (default 5000)
 */
export function useAutoPlayOnSilence({
  isRecording,
  transcript,
  translation,
  canAutoPlay,
  isAudioPlaying,
  setAudioPlaying,
  lang = "ja",
  timeoutMs = 5000,
}: {
  isRecording: boolean;
  transcript: string;
  translation: string;
  canAutoPlay: boolean;
  isAudioPlaying: boolean;
  setAudioPlaying: (b: boolean) => void;
  lang?: string;
  timeoutMs?: number;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscriptRef = useRef<string>("");

  useEffect(() => {
    if (!isRecording || !canAutoPlay || isAudioPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }
    // Reset timer if transcript changes (user speaks)
    if (transcript !== lastTranscriptRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Only play if still not recording or transcript hasn't changed
        if (!isAudioPlaying && canAutoPlay && translation) {
          // Fire TTS using browser API
          if ("speechSynthesis" in window) {
            const utter = new window.SpeechSynthesisUtterance(translation);
            utter.lang = lang;
            setAudioPlaying(true);
            utter.onend = () => {
              setAudioPlaying(false);
            };
            utter.onerror = () => {
              setAudioPlaying(false);
            };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          }
        }
      }, timeoutMs);
      lastTranscriptRef.current = transcript;
    }
    // Cleanup on unmount/change
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRecording, transcript, canAutoPlay, isAudioPlaying, translation, lang, setAudioPlaying, timeoutMs]);
}
