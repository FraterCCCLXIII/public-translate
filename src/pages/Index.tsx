import React, { useState, useEffect } from "react";
import TranscriptNav from "@/components/TranscriptNav";
import NUX from "@/components/NUX";

const Index = () => {
  // Determine if user has completed NUX
  const [showNUX, setShowNUX] = useState(() => {
    // "nux_complete" is set in localStorage when NUX finishes
    return localStorage.getItem("nux_complete") !== "1";
  });

  // Callback for when NUX finishes
  const handleNUXFinish = () => {
    localStorage.setItem("nux_complete", "1");
    setShowNUX(false);
    window.location.reload(); // reload to make settings apply (optional)
  };

  return (
    <>
      {showNUX && (
        <NUX
          onFinish={handleNUXFinish}
        />
      )}
      {/* Render your main app behind/after NUX */}
      {/* You may want to block interaction with the background while NUX is open */}
      {/* For demonstration, we'll just show TranscriptNav */}
      <div className={showNUX ? "pointer-events-none select-none opacity-40" : ""}>
        <TranscriptNav
          recording={false}
          onMicClick={()=>{}}
          textSize={40}
          setTextSize={()=>{}}
          leftLang="en"
          rightLang="ja"
          setLeftLang={()=>{}}
          setRightLang={()=>{}}
          leftVisible={true}
          rightVisible={true}
          setLeftVisible={()=>{}}
          setRightVisible={()=>{}}
          transcript=""
          translation=""
        />
      </div>
    </>
  );
};

export default Index;
