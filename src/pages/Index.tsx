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
  const [textSize, setTextSize] = useState(7);

  return (
    <main className="relative w-full min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center p-0 h-screen">
      <ResizablePanelGroup direction="horizontal" className="w-full h-screen max-w-7xl mx-auto px-0 gap-0 rounded-none border-none shadow-none mb-0">
        <ResizablePanel minSize={20}>
          <TranscriptPanel
            title="ENGLISH"
            text={result.transcript}
            align="left"
            textSize={textSize}
          />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="bg-gray-200 data-[panel-group-direction=horizontal]:w-2 hover:bg-gray-300"
        />
        <ResizablePanel minSize={20}>
          <TranscriptPanel
            title="JAPANESE"
            text={result.translation}
            align="right"
            textSize={textSize}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <TranscriptNav
        recording={recording}
        onMicClick={recording ? stop : start}
        textSize={textSize}
        setTextSize={setTextSize}
      />
    </main>
  );
};

export default Index;
