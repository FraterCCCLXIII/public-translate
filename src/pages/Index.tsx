
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

const Index: React.FC = () => {
  const { recording, result, start, stop } = useVoiceRecognition();
  const [textSize, setTextSize] = useState(7); // Slider 5-9 maps to Tailwind text-3xl .. text-9xl

  return (
    <main className="relative w-full min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center p-0">
      <ResizablePanelGroup direction="horizontal" className="w-full h-[65vh] max-h-[700px] max-w-7xl mx-auto px-6 gap-0 rounded-md border shadow mb-0">
        <ResizablePanel minSize={20}>
          <TranscriptPanel
            title="ENGLISH"
            text={result.transcript}
            align="left"
            textSize={textSize}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-gray-200 data-[panel-group-direction=horizontal]:w-2" />
        <ResizablePanel minSize={20}>
          <TranscriptPanel
            title="JAPANESE"
            text={result.translation}
            align="right"
            textSize={textSize}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Sticky nav */}
      <TranscriptNav
        className="fixed bottom-4 left-4 z-50"
        recording={recording}
        onMicClick={recording ? stop : start}
        textSize={textSize}
        setTextSize={setTextSize}
      />
    </main>
  );
};

export default Index;

