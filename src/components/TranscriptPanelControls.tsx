import React from "react";
import { AlignLeft, AlignRight } from "lucide-react";
import AudioPlaybackButton from "./AudioPlaybackButton";

// Language detection functions
const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
function isRTL(lang: string) {
  return RTL_LANGS.has(lang);
}

const CHAR_REORDERABLE_LANGS = new Set(["ja", "zh", "ko"]);
function canReorderCharacters(lang: string) {
  return CHAR_REORDERABLE_LANGS.has(lang);
}

interface TranscriptPanelControlsProps {
  align: "left" | "right";
  onToggleAlign: () => void;
  canAudioPlayback: boolean;
  onAudioPlayback: () => void;
  audioPlaying: boolean;
  audioLoading: boolean;
  lang?: string;

  // New props for AudioPlaybackButton
  audioText?: string;
  audioLang?: string;
  selectedVoice?: string;
  setSelectedVoice?: (voiceId: string) => void;
  setPlaying?: (v: boolean) => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
}

const TranscriptPanelControls: React.FC<TranscriptPanelControlsProps> = ({
  align,
  onToggleAlign,
  canAudioPlayback,
  audioPlaying,
  audioLoading,
  audioText = "",
  audioLang = "en",
  selectedVoice,
  setSelectedVoice,
  setPlaying = () => {},
  onPlaybackStart,
  onPlaybackEnd,
  lang = "en",
}) => {
  // Determine which icon to show based on current alignment
  const AlIcon = align === "left" ? AlignLeft : AlignRight;

  // Let AudioPlaybackButton always be enabled for popover;
  // just disable the PLAYBACK logic if can't play audio,
  // but keep the popover interactive.
  return (
    <div className="flex items-center gap-2">
      <button
        className="p-1 rounded hover:bg-accent focus:outline-none transition"
        aria-label="Toggle paragraph alignment"
        onClick={onToggleAlign}
        type="button"
      >
        <AlIcon size={18} />
      </button>
      <AudioPlaybackButton
        text={audioText}
        lang={audioLang}
        playing={audioPlaying}
        setPlaying={setPlaying}
        onPlaybackStart={onPlaybackStart}
        onPlaybackEnd={onPlaybackEnd}
        // Always enable pointer events; set `disabled` for PLAYBACK only
        disabled={!canAudioPlayback}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
      />
    </div>
  );
};

export default TranscriptPanelControls;
