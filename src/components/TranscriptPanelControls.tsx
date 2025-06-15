
import React from "react";
import { AlignLeft, AlignRight } from "lucide-react";
import AudioPlaybackButton from "./AudioPlaybackButton";

interface TranscriptPanelControlsProps {
  align: "left" | "right";
  onToggleAlign: () => void;
  canAudioPlayback: boolean;
  onAudioPlayback: () => void;
  audioPlaying: boolean;
  audioLoading: boolean;

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
}) => {
  const AlIcon = align === "left" ? AlignLeft : AlignRight;

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
        disabled={!canAudioPlayback}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
      />
    </div>
  );
};

export default TranscriptPanelControls;
