
import React, { useEffect, useState, useRef } from "react";
import { AudioLines, LoaderCircle, Settings as SettingsIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";

// List of available voices (sample). In a real app, import from config.
const ALL_VOICES = [
  { id: "9BWtsMINqrJLrRacOk9x", label: "Aria" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", label: "Roger" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah" },
  { id: "FGY2WhTYpPnrIDTdsKH5", label: "Laura" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam" },
  { id: "SAz9YHcvj6GT2YYXdXww", label: "River" },
  { id: "XB0fDUnXU5powFXDhCwa", label: "Charlotte" },
  { id: "N2lVS1w4EtoT3dr4eOWO", label: "Callum" },
  // ... add others as needed
];

interface AudioPlaybackButtonProps {
  text: string;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  disabled?: boolean;
  lang?: string;
  selectedVoice?: string;
  setSelectedVoice?: (voiceId: string) => void;
}

/**
 * Plays text using Web Speech Synthesis API (browser TTS).
 * Handles loading state, playback control, and allows interrupt/resume via external events.
 * Allows popover to pick a voice for this button (per-language).
 */
const AudioPlaybackButton: React.FC<AudioPlaybackButtonProps> = ({
  text,
  onPlaybackStart,
  onPlaybackEnd,
  playing,
  setPlaying,
  disabled,
  lang = "en",
  selectedVoice,
  setSelectedVoice
}) => {
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  // Timer to allow delayed closing on mouse leave
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start speech on click
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) {
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

  useEffect(() => {
    if (!playing) {
      synthRef.current.cancel();
      setLoading(false);
    }
  }, [playing]);

  useEffect(() => {
    return () => {
      synthRef.current.cancel();
    };
  }, []);

  // Handlers for hover popover trigger
  const handleIconMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setPopoverOpen(true);
  };

  const handleIconMouseLeave = () => {
    // Only close after a short delay to allow moving to popover content
    closeTimerRef.current = setTimeout(() => setPopoverOpen(false), 120);
  };

  const handlePopoverMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      {/* Only the main playback icon triggers popover on hover */}
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleAudioClick}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/70 dark:bg-background/80 rounded-full shadow-lg p-2 flex items-center justify-center z-20 border border-gray-200 dark:border-gray-700"
          disabled={disabled || !text}
          aria-label={playing ? "Stop audio playback" : "Play transcript with text-to-speech"}
          style={{ pointerEvents: disabled ? "none" : "auto" }}
          onMouseEnter={handleIconMouseEnter}
          onMouseLeave={handleIconMouseLeave}
        >
          {loading ? (
            <LoaderCircle className="animate-spin text-gray-500" size={24} />
          ) : (
            <AudioLines className={playing ? "text-blue-500" : "text-gray-800 dark:text-gray-200"} size={24} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="w-48 max-h-56 overflow-auto custom-scrollbar px-0 py-2"
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        <div className="font-semibold text-xs text-gray-700 mb-2 px-3">
          Choose Voice
        </div>
        <div className="flex flex-col gap-1 px-2">
          {ALL_VOICES.map((v) => (
            <Button
              key={v.id}
              onClick={() => setSelectedVoice && setSelectedVoice(v.id)}
              variant={selectedVoice === v.id ? "default" : "outline"}
              className={`w-full text-left px-2 py-1 rounded ${selectedVoice === v.id ? "bg-blue-500 text-white" : ""}`}
              tabIndex={0}
            >
              {v.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
      <style>
        {`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #94a3b8 #e5e7eb;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #e5e7eb;
            border-radius: 4px;
          }
        `}
      </style>
    </Popover>
  );
};

export default AudioPlaybackButton;

