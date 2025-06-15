
import React, { useState, useRef } from "react";
import TranscriptPanel from "@/components/TranscriptPanel";
import MicButton from "@/components/MicButton";
import TranscriptNav from "@/components/TranscriptNav";
import { useVoiceRecognition } from "@/lib/voice";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useAutoPlayOnSilence } from "@/hooks/useAutoPlayOnSilence";

const RecordingDot = ({
  recording,
  visible,
}: {
  recording: boolean;
  visible: boolean;
}) =>
  recording && !visible ? (
    <div className="fixed left-4 bottom-4 z-50">
      <span className="block w-3 h-3 rounded-full bg-red-600 shadow-lg animate-pulse" aria-label="Recording indicator" />
    </div>
  ) : null;

const LANG_DEFAULTS = {
  left: "en",
  right: "ja",
};

const Index: React.FC = () => {
  const {
    recording,
    result,
    start,
    stop,
    leftLang,
    rightLang,
    setLeftLang,
    setRightLang,
    retranslate
  } = useVoiceRecognition();

  const [textSize, setTextSize] = useState(80);
  // Removed duplicate leftLang, setLeftLang, rightLang, setRightLang declarations
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  // Burn-in: align state for both panels
  const [leftAlign, setLeftAlign] = useState<"left"|"right">("left");
  const [rightAlign, setRightAlign] = useState<"left"|"right">("right");
  const [leftReverseOrder, setLeftReverseOrder] = useState(false);
  const [rightReverseOrder, setRightReverseOrder] = useState(false);

  // For TTS playback state
  const [leftAudioPlaying, setLeftAudioPlaying] = useState(false);
  const [rightAudioPlaying, setRightAudioPlaying] = useState(false);

  // Hide handle state on hover
  const [handleHovered, setHandleHovered] = useState(false);
  // Bottom nav visible
  const [navVisible, setNavVisible] = useState(true);

  // When either audio is playing, stop mic.
  React.useEffect(() => {
    if (leftAudioPlaying || rightAudioPlaying) {
      if (recording) stop();
    }
  }, [leftAudioPlaying, rightAudioPlaying]);

  // If mic icon is pressed, ensure audio stops.
  const handleMicClick = () => {
    if (leftAudioPlaying) setLeftAudioPlaying(false);
    if (rightAudioPlaying) setRightAudioPlaying(false);

    if (recording) {
      stop();
    } else {
      start();
    }
  };

  // Re-translate on language change or mic input change
  React.useEffect(() => {
    if (result.transcript) {
      retranslate(result.transcript, leftLang, rightLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftLang, rightLang]);

  // Download audio files for transcript and translation on stop
  React.useEffect(() => {
    if (!recording && (result.transcript || result.translation)) {
      // Show shadcn/toaster to let user download audio files
      import("@/hooks/use-toast").then(({ toast }) => {
        toast({
          title: "Recording stopped",
          description:
            "Download the audio for your transcript and/or translation below.",
          action: (
            <div className="flex gap-2 mt-2">
              <button
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                onClick={() => {
                  // Basic TTS download using browser's SpeechSynthesis API for transcript (left)
                  const synth = window.speechSynthesis;
                  if (window.AudioContext && synth) {
                    // Not all browsers support exporting TTS, so fallback to text file
                    const blob = new Blob([result.transcript], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "mic_transcript.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                Download Transcript
              </button>
              <button
                className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                onClick={() => {
                  const blob = new Blob([result.translation], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "translation.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download Translation
              </button>
            </div>
          ),
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  // --- Silence detection to trigger TTS on right translation ---
  useAutoPlayOnSilence({
    isRecording: recording,
    transcript: result.transcript,
    translation: result.translation,
    canAutoPlay: rightVisible && !!result.translation, // only if panel is visible & has text
    isAudioPlaying: rightAudioPlaying,
    setAudioPlaying: setRightAudioPlaying,
    lang: rightLang,
    timeoutMs: 5000,
  });

  return (
    <main className="relative w-full min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center p-0 h-screen">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-screen max-w-7xl mx-auto px-0 gap-0 rounded-none border-none shadow-none mb-0"
      >
        {leftVisible && (
          <ResizablePanel minSize={20} id="left" order={1}>
            <TranscriptPanel
              title={leftLang.toUpperCase()}
              text={result.transcript}
              align={leftAlign}
              textSize={textSize}
              lang={leftLang}
              showAudioButton={true}
              audioButtonProps={{
                text: result.transcript,
                playing: leftAudioPlaying,
                setPlaying: setLeftAudioPlaying,
                lang: leftLang,
                onPlaybackStart: () => setLeftAudioPlaying(true),
                onPlaybackEnd: () => setLeftAudioPlaying(false),
                disabled: !result.transcript,
              }}
              alignState={{
                currentAlign: leftAlign,
                setCurrentAlign: setLeftAlign,
                reverseOrder: leftReverseOrder,
                setReverseOrder: setLeftReverseOrder,
              }}
            />
          </ResizablePanel>
        )}
        {leftVisible && rightVisible && (
          <ResizableHandle
            withHandle={false}
            className={`transition-colors bg-transparent data-[panel-group-direction=horizontal]:w-2`}
            onMouseEnter={() => setHandleHovered(true)}
            onMouseLeave={() => setHandleHovered(false)}
            hovered={handleHovered}
          />
        )}
        {rightVisible && (
          <ResizablePanel minSize={20} id="right" order={2}>
            <TranscriptPanel
              title={rightLang.toUpperCase()}
              text={result.translation}
              align={rightAlign}
              textSize={textSize}
              lang={rightLang}
              showAudioButton={true}
              audioButtonProps={{
                text: result.translation,
                playing: rightAudioPlaying,
                setPlaying: setRightAudioPlaying,
                lang: rightLang,
                onPlaybackStart: () => setRightAudioPlaying(true),
                onPlaybackEnd: () => setRightAudioPlaying(false),
                disabled: !result.translation,
              }}
              alignState={{
                currentAlign: rightAlign,
                setCurrentAlign: setRightAlign,
                reverseOrder: rightReverseOrder,
                setReverseOrder: setRightReverseOrder,
              }}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
      <TranscriptNav
        recording={recording}
        onMicClick={handleMicClick}
        textSize={textSize}
        setTextSize={setTextSize}
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
        navVisible={navVisible}
        setNavVisible={setNavVisible}
      />
      <RecordingDot recording={recording} visible={navVisible} />
    </main>
  );
};

export default Index;

