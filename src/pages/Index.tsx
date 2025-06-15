
import React, { useState, useEffect } from "react";
import TranscriptNav from "@/components/TranscriptNav";
import NUX from "@/components/NUX";

const Index = () => {
  // Get recording status, and control state for NUX
  const [recording, setRecording] = useState(false);

  // Determine if user has completed NUX
  const [showNUX, setShowNUX] = useState(() => {
    return localStorage.getItem("nux_complete") !== "1";
  });

  // When NUX finishes, mark complete and hide
  const handleNUXFinish = () => {
    localStorage.setItem("nux_complete", "1");
    setShowNUX(false);
    // No reload; let language/state changes apply live
  };

  // If recording started, close NUX if open
  useEffect(() => {
    if (recording && showNUX) {
      setShowNUX(false);
    }
  }, [recording, showNUX]);

  // Provide a typed callback for TranscriptNav to control recording state
  const handleMicClick = () => {
    setRecording((r) => !r);
  };

  return (
    <>
      {/* NUX overlays UI, but bottom controls are always visible */}
      {showNUX && (
        <NUX
          onFinish={handleNUXFinish}
          recording={recording}
        />
      )}
      {/* Main app w/controls is always interactive */}
      <div>
        <TranscriptNav
          recording={recording}
          onMicClick={handleMicClick}
          textSize={40}
          setTextSize={() => {}}
          leftLang="en"
          rightLang="ja"
          setLeftLang={() => {}}
          setRightLang={() => {}}
          leftVisible={true}
          rightVisible={true}
          setLeftVisible={() => {}}
          setRightVisible={() => {}}
          transcript=""
          translation=""
        />
      </div>
    </>
  );
};

export default Index;
