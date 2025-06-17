import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  recording: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({
  recording,
  disabled,
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log("[MicButton] Mic button clicked", { 
      recording, 
      disabled, 
      target: e.target,
      currentTarget: e.currentTarget,
      eventPhase: e.eventPhase
    });
    
    // Prevent any event bubbling
    e.stopPropagation();
    e.preventDefault();
    
    // Call the original onClick handler
    onClick();
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className={`
        rounded-full w-20 h-20 flex items-center justify-center
        border-4
        ${recording ? "border-red-500 animate-pulse bg-red-50" : "border-black bg-white"}
        shadow-lg
        transition-all
        focus:ring-2 focus:ring-primary
        hover:bg-gray-50
        mx-auto
        relative z-10
      `}
      onClick={handleClick}
      disabled={disabled}
      aria-label={recording ? "Stop Recording" : "Start Recording"}
      style={{ position: 'relative', zIndex: 10 }}
    >
      {recording ? (
        <MicOff size={40} className="text-red-600" />
      ) : (
        <Mic size={40} className="text-black" />
      )}
    </Button>
  );
};

export default MicButton;
