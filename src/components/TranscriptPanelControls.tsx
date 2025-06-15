
import React from "react";
import { AlignLeft, AlignRight, AudioLines } from "lucide-react";

interface TranscriptPanelControlsProps {
  align: "left" | "right";
  onToggleAlign: () => void;
  canAudioPlayback: boolean;
  onAudioPlayback: () => void;
  audioPlaying: boolean;
  audioLoading: boolean;
}

const TranscriptPanelControls: React.FC<TranscriptPanelControlsProps> = ({
  align,
  onToggleAlign,
  canAudioPlayback,
  onAudioPlayback,
  audioPlaying,
  audioLoading,
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
      <button
        type="button"
        className={`ml-1 p-1 rounded-full transition focus:outline-none ${audioPlaying ? "bg-blue-100" : "hover:bg-accent"}`}
        onClick={onAudioPlayback}
        aria-label="Play transcript with text-to-speech"
        disabled={!canAudioPlayback}
        style={{ pointerEvents: !canAudioPlayback ? "none" : "auto" }}
      >
        {audioLoading ? (
          <svg className="animate-spin text-blue-500" width={20} height={20} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
        ) : (
          <AudioLines className={audioPlaying ? "text-blue-500" : "text-gray-700"} size={20} />
        )}
      </button>
    </div>
  );
};

export default TranscriptPanelControls;
