import React, { useState, useEffect } from "react";
import TranscriptNav from "@/components/TranscriptNav";
import NUX from "@/components/NUX";
import TranscriptPanel from "@/components/TranscriptPanel";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

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
  // Use the actual voice recognition hook
  const {
    recording,
    result,
    start,
    stop,
    leftLang,
    rightLang,
    setLeftLang,
    setRightLang,
  } = useVoiceRecognition();

  // Determine if user has completed NUX
  const [showNUX, setShowNUX] = useState(() => {
    return localStorage.getItem("nux_complete") !== "1";
  });

  // Per-panel text size state
  const [leftTextSize, setLeftTextSize] = useState(40);
  const [rightTextSize, setRightTextSize] = useState(40);

  // Panel visibility state
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  // Debug: Check Web Speech API availability
  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log("Web Speech API available:", !!SpeechRecognitionCtor);
    
    if (SpeechRecognitionCtor) {
      console.log("SpeechRecognition constructor found");
    } else {
      console.warn("Web Speech API not available - will use demo mode");
    }
  }, []);

  // When NUX finishes, mark complete and hide
  const handleNUXFinish = () => {
    localStorage.setItem("nux_complete", "1");
    setShowNUX(false);
  };

  // If recording started, close NUX if open
  useEffect(() => {
    if (recording && showNUX) {
      setShowNUX(false);
    }
  }, [recording, showNUX]);

  // Handle mic click - start/stop voice recognition
  const handleMicClick = () => {
    console.log("Mic clicked, current recording state:", recording);
    if (recording) {
      stop();
    } else {
      start();
    }
  };

  // Helpers to get language labels
  const leftLabel = LANGUAGES.find(l => l.value === leftLang)?.label || leftLang;
  const rightLabel = LANGUAGES.find(l => l.value === rightLang)?.label || rightLang;

  // Convert transcript and translation to the format expected by TranscriptPanel
  const transcriptData = result.transcript ? [{ text: result.transcript, timestamp: "" }] : [];
  const translationData = result.translation ? [{ text: result.translation, timestamp: "" }] : [];

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
          setTextSize={() => {}} // unused, legacy prop
          leftLang={leftLang}
          rightLang={rightLang}
          setLeftLang={setLeftLang}
          setRightLang={setRightLang}
          leftVisible={leftVisible}
          rightVisible={rightVisible}
          setLeftVisible={setLeftVisible}
          setRightVisible={setRightVisible}
          transcript={result.transcript}
          translation={result.translation}
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
                showVisibilityToggle={false}
                pillStyle={false}
                isRecording={recording}
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
                showVisibilityToggle={false}
                pillStyle={false}
                isRecording={recording}
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
