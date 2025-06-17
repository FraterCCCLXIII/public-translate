import React, { useState, useEffect, useRef } from "react";
import TranscriptNav from "@/components/TranscriptNav";
import NUX from "@/components/NUX";
import TranscriptPanel from "@/components/TranscriptPanel";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useTranslation } from "@/hooks/useTranslation";
import { useAutoPlayOnSilence } from "@/hooks/useAutoPlayOnSilence";

// Language metadata
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
];

const Index = () => {
  // Use the actual voice recognition hook
  const {
    recording,
    result,
    start,
    stop,
    clearTranscript,
    leftLang,
    rightLang,
    setLeftLang,
    setRightLang,
  } = useVoiceRecognition();

  // Translation hook for testing
  const { translate } = useTranslation();

  // Determine if user has completed NUX
  const [showNUX, setShowNUX] = useState(() => {
    return localStorage.getItem("nux_completed") !== "true";
  });

  // Debug window state - default to hidden
  const [showDebugWindow, setShowDebugWindow] = useState(() => {
    return localStorage.getItem("debug_window_visible") === "true";
  });

  // Per-panel text size state
  const [leftTextSize, setLeftTextSize] = useState(40);
  const [rightTextSize, setRightTextSize] = useState(40);

  // Panel alignment state
  const [leftAlign, setLeftAlign] = useState<"left" | "right">("left");
  const [rightAlign, setRightAlign] = useState<"left" | "right">("left");
  const [leftReverseOrder, setLeftReverseOrder] = useState(false);
  const [rightReverseOrder, setRightReverseOrder] = useState(false);

  // Debug logging for alignment state
  useEffect(() => {
    console.log("[Index] Left alignment changed:", { leftAlign, leftLang, canReorderCharacters: leftLang === "ja" });
  }, [leftAlign, leftLang]);

  useEffect(() => {
    console.log("[Index] Right alignment changed:", { rightAlign, rightLang, canReorderCharacters: rightLang === "ja" });
  }, [rightAlign, rightLang]);

  // Panel visibility state
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  // Audio playback state for both panels
  const [leftAudioPlaying, setLeftAudioPlaying] = useState(false);
  const [rightAudioPlaying, setRightAudioPlaying] = useState(false);

  // Voice selection state for both panels
  const [leftSelectedVoice, setLeftSelectedVoice] = useState<string>(() => localStorage.getItem("leftSelectedVoice") || "");
  const [rightSelectedVoice, setRightSelectedVoice] = useState<string>(() => localStorage.getItem("rightSelectedVoice") || "");

  // Auto-speak settings
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => localStorage.getItem("auto_speak") !== "false");
  const [silenceTimeout, setSilenceTimeout] = useState<number>(() => parseInt(localStorage.getItem("silence_timeout") || "3000"));

  // Handle mic muting during audio playback - use counter to track multiple audio sessions
  const [activeAudioSessions, setActiveAudioSessions] = useState(0);
  const [wasRecordingBeforeAnyAudio, setWasRecordingBeforeAnyAudio] = useState(false);
  const [micButtonJustClicked, setMicButtonJustClicked] = useState(false);

  // Use ref to track recording state more reliably
  const recordingRef = useRef(recording);
  recordingRef.current = recording;

  // Debug logging for audio state
  useEffect(() => {
    console.log("[Index] Audio state changed:", { activeAudioSessions, wasRecordingBeforeAnyAudio, recording });
  }, [activeAudioSessions, wasRecordingBeforeAnyAudio, recording]);

  // Ensure audio playing states are reset when all sessions end
  useEffect(() => {
    if (activeAudioSessions === 0) {
      console.log("[Index] All audio sessions ended, resetting audio playing states");
      setLeftAudioPlaying(false);
      setRightAudioPlaying(false);
      setWasRecordingBeforeAnyAudio(false);
    }
  }, [activeAudioSessions]);

  // Save voice selections to localStorage
  useEffect(() => {
    localStorage.setItem("leftSelectedVoice", leftSelectedVoice);
  }, [leftSelectedVoice]);

  useEffect(() => {
    localStorage.setItem("rightSelectedVoice", rightSelectedVoice);
  }, [rightSelectedVoice]);

  const handleAudioStart = () => {
    console.log("[Index] Audio playback started - mic should be muted", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio, micButtonJustClicked });
    
    // Prevent audio if mic button was just clicked
    if (micButtonJustClicked) {
      console.log("[Index] Preventing auto-play - mic button was just clicked");
      return;
    }
    
    // If this is the first audio session, remember if we were recording
    if (activeAudioSessions === 0) {
      setWasRecordingBeforeAnyAudio(recording);
    }
    
    // Increment active audio sessions
    setActiveAudioSessions(prev => {
      const newCount = prev + 1;
      console.log("[Index] Active audio sessions incremented to:", newCount);
      return newCount;
    });
    
    // Stop recording when audio starts to prevent feedback
    if (recording) {
      console.log("[Index] Stopping recording due to audio playback");
      stop();
    }
  };

  const handleAudioEnd = () => {
    console.log("[Index] Audio playback ended - mic can be unmuted", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
    
    // Decrement active audio sessions
    setActiveAudioSessions(prev => {
      const newCount = Math.max(0, prev - 1); // Prevent negative counts
      console.log("[Index] Active audio sessions reduced to:", newCount);
      
      // If no more active audio sessions, always restart recording
      if (newCount === 0 && !recordingRef.current) {
        console.log("[Index] Auto-restarting recording after translation playback ended");
        // Add a small delay to ensure state is properly updated
        setTimeout(() => {
          console.log("[Index] Executing delayed start() call");
          start();
        }, 100);
      } else if (newCount === 0) {
        console.log("[Index] Not restarting recording - already recording", { recording: recordingRef.current });
      }
      
      return newCount;
    });
  };

  // Use auto-play hook for right panel (translation)
  useAutoPlayOnSilence({
    isRecording: recording,
    transcript: result.transcript,
    translation: result.translation,
    canAutoPlay: autoSpeak && rightVisible && !leftAudioPlaying && !rightAudioPlaying && !micButtonJustClicked,
    isAudioPlaying: rightAudioPlaying,
    setAudioPlaying: setRightAudioPlaying,
    lang: rightLang,
    timeoutMs: silenceTimeout,
    onAudioStart: handleAudioStart,
    onAudioEnd: handleAudioEnd,
    onTranscriptClear: clearTranscript,
  });

  // Spacebar handling for stopping audio playback
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && (leftAudioPlaying || rightAudioPlaying)) {
        event.preventDefault();
        
        // Stop all audio playback
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
        setLeftAudioPlaying(false);
        setRightAudioPlaying(false);
        
        // Reset all audio sessions and resume recording if needed
        setActiveAudioSessions(0);
        if (!recordingRef.current) {
          console.log("[Index] Auto-restarting recording after spacebar stop");
          start();
        }
        setWasRecordingBeforeAnyAudio(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leftAudioPlaying, rightAudioPlaying, recording, start, wasRecordingBeforeAnyAudio]);

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

  // Debug: Log voice recognition results
  useEffect(() => {
    if (result.transcript || result.translation) {
      console.log("Voice recognition result updated:", result);
    }
  }, [result]);

  // Debug: Monitor recording state changes
  useEffect(() => {
    console.log("[Index] Recording state changed:", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
  }, [recording, activeAudioSessions, wasRecordingBeforeAnyAudio]);

  // Test translation function
  const testTranslation = async () => {
    try {
      console.log("Testing translation...");
      const testResult = await translate({
        text: "Hello world",
        from: "en",
        to: "ja"
      });
      console.log("Translation test result:", testResult);
      alert(`Translation test: "Hello world" -> "${testResult}"`);
    } catch (error) {
      console.error("Translation test failed:", error);
      alert("Translation test failed: " + error);
    }
  };

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
    console.log("[Index] Mic clicked, current state:", { 
      recording, 
      leftAudioPlaying, 
      rightAudioPlaying, 
      activeAudioSessions, 
      wasRecordingBeforeAnyAudio,
      micButtonJustClicked
    });
    
    // Set flag to prevent audio interference
    setMicButtonJustClicked(true);
    setTimeout(() => setMicButtonJustClicked(false), 2000); // Clear after 2 seconds
    
    // Always clear any audio states first to prevent interference
    if (leftAudioPlaying || rightAudioPlaying || activeAudioSessions > 0) {
      console.log("[Index] Clearing audio states before mic action");
      setLeftAudioPlaying(false);
      setRightAudioPlaying(false);
      setActiveAudioSessions(0);
      setWasRecordingBeforeAnyAudio(false);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    
    // Force cancel any ongoing speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear any existing auto-play timers by temporarily disabling auto-play
    // This will trigger the useAutoPlayOnSilence hook to clear its timers
    const currentAutoSpeak = autoSpeak;
    if (currentAutoSpeak) {
      console.log("[Index] Temporarily disabling auto-play to clear timers");
      // The auto-play hook will re-evaluate when canAutoPlay changes
    }
    
    // Clear auto-play timers directly
    if (typeof window !== 'undefined' && (window as any).clearAutoPlayTimers) {
      console.log("[Index] Clearing auto-play timers");
      (window as any).clearAutoPlayTimers();
    }
    
    if (recording) {
      console.log("[Index] Stopping recording via mic click");
      stop();
    } else {
      console.log("[Index] Starting recording via mic click");
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
          isAudioPlaying={activeAudioSessions > 0}
          showDebugWindow={showDebugWindow}
          setShowDebugWindow={setShowDebugWindow}
        />
        
        {/* Debug controls - only show in development */}
        {showDebugWindow && (
          <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
            <h3 className="text-sm font-bold mb-2">Debug Controls</h3>
            <button
              onClick={testTranslation}
              className="block w-full mb-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Translation
            </button>
            <div className="text-xs text-gray-600">
              <div>Recording: {recording ? "Yes" : "No"}</div>
              <div>Left Lang: {leftLang}</div>
              <div>Right Lang: {rightLang}</div>
              <div>Left Voice: {leftSelectedVoice || "Default"}</div>
              <div>Right Voice: {rightSelectedVoice || "Default"}</div>
              <div>Auto-Speak: {autoSpeak ? "On" : "Off"}</div>
              <div>Silence Timeout: {silenceTimeout / 1000}s</div>
              <div>Left Audio: {leftAudioPlaying ? "Playing" : "Stopped"}</div>
              <div>Right Audio: {rightAudioPlaying ? "Playing" : "Stopped"}</div>
              <div>Active Audio Sessions: {activeAudioSessions}</div>
              <div>Was Recording Before Audio: {wasRecordingBeforeAnyAudio ? "Yes" : "No"}</div>
              <div>Mic Button Protection: {micButtonJustClicked ? "Active" : "Inactive"}</div>
            </div>
          </div>
        )}
        
        {/* Render transcript panels as main content */}
        <div className="flex flex-row gap-4 w-full max-w-6xl mx-auto mt-6 px-4">
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
                alignState={{
                  currentAlign: leftAlign,
                  setCurrentAlign: setLeftAlign,
                  reverseOrder: leftReverseOrder,
                  setReverseOrder: setLeftReverseOrder,
                }}
                audioButtonProps={{
                  text: result.transcript,
                  playing: leftAudioPlaying || activeAudioSessions > 0,
                  setPlaying: setLeftAudioPlaying,
                  lang: leftLang,
                  onPlaybackStart: () => {
                    console.log("[Index] Left panel audio started", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio, micButtonJustClicked });
                    
                    // Prevent audio if mic button was just clicked
                    if (micButtonJustClicked) {
                      console.log("[Index] Preventing audio playback - mic button was just clicked");
                      return;
                    }
                    
                    // If this is the first audio session, remember if we were recording
                    if (activeAudioSessions === 0) {
                      setWasRecordingBeforeAnyAudio(recording);
                    }
                    
                    // Increment active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = prev + 1;
                      console.log("[Index] Active audio sessions incremented to:", newCount);
                      return newCount;
                    });
                    
                    // Stop recording when audio starts to prevent feedback
                    if (recording) {
                      console.log("[Index] Stopping recording due to left panel audio");
                      stop();
                    }
                  },
                  onPlaybackEnd: () => {
                    console.log("[Index] Left panel audio ended", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
                    
                    // Decrement active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = Math.max(0, prev - 1); // Prevent negative counts
                      console.log("[Index] Active audio sessions reduced to:", newCount);
                      
                      // If no more active audio sessions, always restart recording
                      if (newCount === 0 && !recordingRef.current) {
                        console.log("[Index] Auto-restarting recording after left panel audio ended");
                        // Add a small delay to ensure state is properly updated
                        setTimeout(() => {
                          console.log("[Index] Executing delayed start() call for left panel");
                          start();
                        }, 100);
                      } else if (newCount === 0) {
                        console.log("[Index] Not restarting recording after left panel audio - already recording", { recording: recordingRef.current });
                      }
                      
                      return newCount;
                    });
                  },
                  disabled: micButtonJustClicked || false, // Disable when mic button was just clicked
                  selectedVoice: leftSelectedVoice,
                  setSelectedVoice: setLeftSelectedVoice,
                }}
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
                alignState={{
                  currentAlign: rightAlign,
                  setCurrentAlign: setRightAlign,
                  reverseOrder: rightReverseOrder,
                  setReverseOrder: setRightReverseOrder,
                }}
                audioButtonProps={{
                  text: result.translation,
                  playing: rightAudioPlaying || activeAudioSessions > 0,
                  setPlaying: setRightAudioPlaying,
                  lang: rightLang,
                  onPlaybackStart: () => {
                    console.log("[Index] Right panel audio started", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio, micButtonJustClicked });
                    
                    // Prevent audio if mic button was just clicked
                    if (micButtonJustClicked) {
                      console.log("[Index] Preventing audio playback - mic button was just clicked");
                      return;
                    }
                    
                    // If this is the first audio session, remember if we were recording
                    if (activeAudioSessions === 0) {
                      setWasRecordingBeforeAnyAudio(recording);
                    }
                    
                    // Increment active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = prev + 1;
                      console.log("[Index] Active audio sessions incremented to:", newCount);
                      return newCount;
                    });
                    
                    // Stop recording when audio starts to prevent feedback
                    if (recording) {
                      console.log("[Index] Stopping recording due to right panel audio");
                      stop();
                    }
                  },
                  onPlaybackEnd: () => {
                    console.log("[Index] Right panel audio ended", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
                    
                    // Decrement active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = Math.max(0, prev - 1); // Prevent negative counts
                      console.log("[Index] Active audio sessions reduced to:", newCount);
                      
                      // If no more active audio sessions, always restart recording
                      if (newCount === 0 && !recordingRef.current) {
                        console.log("[Index] Auto-restarting recording after right panel audio ended");
                        // Add a small delay to ensure state is properly updated
                        setTimeout(() => {
                          console.log("[Index] Executing delayed start() call for right panel");
                          start();
                        }, 100);
                      } else if (newCount === 0) {
                        console.log("[Index] Not restarting recording after right panel audio - already recording", { recording: recordingRef.current });
                      }
                      
                      return newCount;
                    });
                  },
                  disabled: micButtonJustClicked || false, // Disable when mic button was just clicked
                  selectedVoice: rightSelectedVoice,
                  setSelectedVoice: setRightSelectedVoice,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
