
import React from "react";
import TranscriptPanel from "@/components/TranscriptPanel";
import MicButton from "@/components/MicButton";
import { useVoiceRecognition } from "@/lib/voice";

const Index: React.FC = () => {
  const { recording, result, start, stop } = useVoiceRecognition();

  return (
    <main className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-0">
      <div className="flex flex-row w-full h-[65vh] max-h-[700px] max-w-7xl mx-auto px-6 gap-8">
        {/* English Transcript */}
        <div className="flex-1 flex">
          <TranscriptPanel title="ENGLISH" text={result.transcript} align="left" />
        </div>
        {/* Japanese Translation */}
        <div className="flex-1 flex border-l-4 border-gray-200">
          <TranscriptPanel title="JAPANESE" text={result.translation} align="right" />
        </div>
      </div>
      <section className="mt-10 flex flex-col items-center w-full">
        <MicButton
          recording={recording}
          onClick={recording ? stop : start}
        />
        <span
          className={`
            mt-4 text-base tracking-wider
            font-medium
            ${recording ? "text-red-500" : "text-gray-600"}
            transition-colors
          `}
        >
          {recording ? "Listening..." : "Press to start recording"}
        </span>
      </section>
      <footer className="fixed bottom-6 w-full flex justify-center">
        <span className="text-xs text-gray-400">
          Built with React, Typescript, shadcn/ui, and Tailwind. |
          Ready for API integration.
        </span>
      </footer>
    </main>
  );
};

export default Index;
