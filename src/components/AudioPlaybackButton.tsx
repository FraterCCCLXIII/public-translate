import React, { useEffect, useState, useRef } from "react";
import { AudioLines, LoaderCircle, Settings as SettingsIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";

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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef(window.speechSynthesis);
  // Timer to allow delayed closing on mouse leave
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis && window.speechSynthesis.getVoices) {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);
        setAvailableVoices(voices);
        
        // Set default voice if none selected
        if (!selectedVoice && voices.length > 0) {
          const defaultVoice = voices.find(v => v.lang.startsWith(lang)) || voices[0];
          setSelectedVoice && setSelectedVoice(defaultVoice.voiceURI);
        }
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also listen for voiceschanged event
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [lang, selectedVoice, setSelectedVoice]);

  // Start speech on click
  const handleAudioClick = (e: React.MouseEvent) => {
    console.log("[AudioPlaybackButton] Audio button clicked", {
      playing,
      text: text?.substring(0, 50) + "...",
      target: e.target,
      currentTarget: e.currentTarget,
      eventPhase: e.eventPhase
    });
    
    e.stopPropagation();
    if (playing) {
      console.log("[AudioPlaybackButton] Stopping audio playback");
      synthRef.current.cancel();
      setPlaying(false);
      setLoading(false);
      onPlaybackEnd?.();
      return;
    }
    if (!text) {
      console.log("[AudioPlaybackButton] No text to play");
      return;
    }
    if (!window.speechSynthesis) {
      console.log("[AudioPlaybackButton] Speech synthesis not available");
      return;
    }
    
    console.log("[AudioPlaybackButton] Starting audio playback");
    setLoading(true);
    setPlaying(true);
    onPlaybackStart?.();

    // Cancel any existing speech synthesis to prevent overlap
    synthRef.current.cancel();

    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = lang;
    
    // Set the selected voice if available
    if (selectedVoice) {
      const selectedVoiceObj = availableVoices.find(voice => voice.voiceURI === selectedVoice);
      if (selectedVoiceObj) {
        console.log("Using voice:", selectedVoiceObj.name, selectedVoiceObj.voiceURI);
        utter.voice = selectedVoiceObj;
      } else {
        console.log("Selected voice not found:", selectedVoice);
      }
    }
    
    utter.onend = () => {
      console.log("[AudioPlaybackButton] Audio playback ended");
      setLoading(false);
      setPlaying(false);
      onPlaybackEnd?.();
    };
    utter.onerror = () => {
      console.log("[AudioPlaybackButton] Audio playback error");
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
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
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleAudioClick}
          className="p-1 rounded hover:bg-accent focus:outline-none transition"
          disabled={disabled}
          aria-label={playing ? "Stop audio playback" : "Play transcript with text-to-speech"}
          style={{ 
            pointerEvents: disabled ? "none" : "auto",
            position: 'relative',
            zIndex: 1
          }}
          onMouseEnter={handleIconMouseEnter}
          onMouseLeave={handleIconMouseLeave}
        >
          {loading ? (
            <LoaderCircle className="animate-spin text-gray-500" size={18} />
          ) : (
            <AudioLines className={playing ? "text-blue-500" : "text-gray-800 dark:text-gray-200"} size={18} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        className="w-48 max-h-56 overflow-auto custom-scrollbar px-0 py-2"
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
      >
        <div className="font-semibold text-xs text-gray-700 mb-2 px-3">
          Choose Voice
        </div>
        <div className="flex flex-col gap-1 px-2">
          {availableVoices.length === 0 ? (
            <div className="text-xs text-gray-500 px-2 py-1">Loading voices...</div>
          ) : (
            availableVoices.map((voice) => (
              <Button
                key={voice.voiceURI}
                onClick={() => setSelectedVoice && setSelectedVoice(voice.voiceURI)}
                variant={selectedVoice === voice.voiceURI ? "default" : "outline"}
                className={`w-full text-left px-2 py-1 rounded ${
                  selectedVoice === voice.voiceURI 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                tabIndex={0}
              >
                <div className="text-xs">
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-xs opacity-70">{voice.lang}</div>
                </div>
              </Button>
            ))
          )}
        </div>
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
      </PopoverContent>
    </Popover>
  );
};

export default AudioPlaybackButton;

