
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
          >
            {/* Line grip handled in ResizableHandle (UI file) */}
          </ResizableHandle>
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
      />
    </main>
  );
};

export default Index;
