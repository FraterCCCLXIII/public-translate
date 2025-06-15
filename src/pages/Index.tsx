import React, { useState, useEffect } from "react";
import TranscriptNav from "@/components/TranscriptNav";
import NUX from "@/components/NUX";
import TranscriptPanel from "@/components/TranscriptPanel";

// Temporary dummy transcript with timestamps for demo
const transcriptData = [
  { text: "Hello", timestamp: "00:00:01" },
  { text: "world!", timestamp: "00:00:02" },
  { text: "How", timestamp: "00:00:03" },
  { text: "are", timestamp: "00:00:03" },
  { text: "you?", timestamp: "00:00:04" },
];
const translationData = [
  { text: "こんにちは", timestamp: "00:00:01" },
  { text: "世界！", timestamp: "00:00:02" },
  { text: "元気ですか？", timestamp: "00:00:04" },
];

// Language metadata
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "zh", label: "Chinese" }
];

const Index = () => {
  // Get recording status, and control state for NUX
  const [recording, setRecording] = useState(false);

  // Determine if user has completed NUX
  const [showNUX, setShowNUX] = useState(() => {
    return localStorage.getItem("nux_complete") !== "1";
  });

  // Per-panel text size state
  const [leftTextSize, setLeftTextSize] = useState(40);
  const [rightTextSize, setRightTextSize] = useState(40);

  // Example language/visibility state for left/right panels
  const [leftLang, setLeftLang] = useState("en");
  const [rightLang, setRightLang] = useState("ja");
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

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

  // Helpers to get language labels
  const leftLabel = LANGUAGES.find(l => l.value === leftLang)?.label || leftLang;
  const rightLabel = LANGUAGES.find(l => l.value === rightLang)?.label || rightLang;

  // Create text for transcript and translation
  const transcriptText = transcriptData.map(t => t.text).join(" ");
  const translationText = translationData.map(t => t.text).join(" ");

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
          textSize={40} // unused, legacy prop
          setTextSize={() => {}} // unused, legacy prop
          leftLang={leftLang}
          rightLang={rightLang}
          setLeftLang={setLeftLang}
          setRightLang={setRightLang}
          leftVisible={leftVisible}
          rightVisible={rightVisible}
          setLeftVisible={setLeftVisible}
          setRightVisible={setRightVisible}
          transcript={transcriptText}
          translation={translationText}
        />
        {/* Render transcript panels as main content */}
        <div className="flex flex-row gap-4 w-full max-w-6xl mx-auto mt-6">
          {leftVisible && (
            <div className="flex-1 min-w-0">
              <TranscriptPanel
                title={leftLabel}
                text={transcriptData}
                align="left"
                textSize={leftTextSize}
                setTextSize={setLeftTextSize}
                lang={leftLang}
                showTimestamps={false}
                showVisibilityToggle
                isRecording={recording}
                pillStyle={true}
                visible={leftVisible}
                setVisible={setLeftVisible}
              />
            </div>
          )}
          {rightVisible && (
            <div className="flex-1 min-w-0">
              <TranscriptPanel
                title={rightLabel}
                text={translationData}
                align="right"
                textSize={rightTextSize}
                setTextSize={setRightTextSize}
                lang={rightLang}
                showTimestamps={false}
                showVisibilityToggle
                isRecording={recording}
                pillStyle={true}
                visible={rightVisible}
                setVisible={setRightVisible}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
