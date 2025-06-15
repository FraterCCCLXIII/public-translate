
import React, { useState } from "react";
import TranscriptPanel from "@/components/TranscriptPanel";
import MicButton from "@/components/MicButton";
import TranscriptNav from "@/components/TranscriptNav";
import { useVoiceRecognition } from "@/lib/voice";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

// Small red dot for recording indicator
const RecordingDot = ({ recording, visible }: {recording: boolean, visible: boolean}) =>
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
  const { recording, result, start, stop } = useVoiceRecognition();
  const [textSize, setTextSize] = useState(80);
  const [leftLang, setLeftLang] = useState(LANG_DEFAULTS.left);
  const [rightLang, setRightLang] = useState(LANG_DEFAULTS.right);
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  // Hide handle state on hover
  const [handleHovered, setHandleHovered] = useState(false);
  // Bottom nav visible
  const [navVisible, setNavVisible] = useState(true);

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
              align="left"
              textSize={textSize}
              lang={leftLang}
            />
          </ResizablePanel>
        )}
        {leftVisible && rightVisible && (
          <ResizableHandle
            withHandle={false}
            className={`transition-colors bg-transparent data-[panel-group-direction=horizontal]:w-2`}
            onMouseEnter={() => setHandleHovered(true)}
            onMouseLeave={() => setHandleHovered(false)}
          />
        )}
        {rightVisible && (
          <ResizablePanel minSize={20} id="right" order={2}>
            <TranscriptPanel
              title={rightLang.toUpperCase()}
              text={result.translation}
              align="right"
              textSize={textSize}
              lang={rightLang}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      <TranscriptNav
        recording={recording}
        onMicClick={recording ? stop : start}
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
