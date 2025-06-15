
import React, { useEffect, useState, useRef } from "react";
import { AudioLines, LoaderCircle } from "lucide-react";

interface AudioPlaybackButtonProps {
  text: string;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  disabled?: boolean;
  lang?: string;
}

/**
 * Plays text using Web Speech Synthesis API (browser TTS).
 * Handles loading state, playback control, and allows interrupt/resume via external events.
 */
const AudioPlaybackButton: React.FC<AudioPlaybackButtonProps> = ({
  text,
  onPlaybackStart,
  onPlaybackEnd,
  playing,
  setPlaying,
  disabled,
  lang = "en"
}) => {
  const [loading, setLoading] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // Start speech on click
  const handleAudioClick = () => {
    if (playing) {
      // Stop playback
      synthRef.current.cancel();
      setPlaying(false);
      setLoading(false);
      onPlaybackEnd?.();
      return;
    }
    if (!text) return;
    if (!window.speechSynthesis) return;
    setLoading(true);
    setPlaying(true);
    onPlaybackStart?.();

    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.onend = () => {
      setLoading(false);
      setPlaying(false);
      onPlaybackEnd?.();
    };
    utter.onerror = () => {
      setLoading(false);
      setPlaying(false);
      onPlaybackEnd?.();
    };
    synthRef.current.speak(utter);
  };

  // On playing state/mic change externally, stop playback
  useEffect(() => {
    if (!playing) {
      synthRef.current.cancel();
      setLoading(false);
    }
  }, [playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthRef.current.cancel();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleAudioClick}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/70 dark:bg-background/80 rounded-full shadow-lg p-2 flex items-center justify-center z-20 border border-gray-200 dark:border-gray-700"
      disabled={disabled || !text}
      aria-label={playing ? "Stop audio playback" : "Play transcript with text-to-speech"}
      style={{ pointerEvents: disabled ? "none" : "auto" }}
    >
      {loading ? (
        <LoaderCircle className="animate-spin text-gray-500" size={24} />
      ) : (
        <AudioLines className={playing ? "text-blue-500" : "text-gray-800 dark:text-gray-200"} size={24} />
      )}
    </button>
  );
};

export default AudioPlaybackButton;
