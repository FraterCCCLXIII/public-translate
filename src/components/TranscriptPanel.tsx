
import React, { useEffect, useRef, useState } from "react";
import { AlignLeft, AlignRight } from "lucide-react";
import AudioPlaybackButton from "./AudioPlaybackButton";

// Utility function to check if language should use RTL order.
const RTL_LANGS = new Set([
  "ar", // Arabic
  "he", // Hebrew
  "fa", // Farsi/Persian
  "ur", // Urdu
]);
function isRTL(lang: string) {
  return RTL_LANGS.has(lang);
}

interface TranscriptPanelProps {
  title: string;
  text: string;
  align?: "left" | "right";
  textSize?: number; // is px
  lang?: string;
  showAudioButton?: boolean;
  audioButtonProps?: any;
  alignState?: { currentAlign: "left" | "right"; setCurrentAlign: (a: "left"|"right")=>void; reverseOrder: boolean; setReverseOrder: (b: boolean)=>void };
}

const ALIGNMENTS = {
  left: { icon: AlignLeft, cls: "justify-start text-left" },
  right: { icon: AlignRight, cls: "justify-end text-right" }
};

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  title,
  text,
  align = "left",
  textSize = 80,
  lang = "en",
  showAudioButton,
  audioButtonProps,
  alignState,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [animatingWordIndexes, setAnimatingWordIndexes] = useState<number[]>([]);
  const prevTextRef = useRef<string>("");
  const [currentAlign, setCurrentAlign] = alignState
    ? [alignState.currentAlign, alignState.setCurrentAlign]
    : useState<"left"|"right">(align);
  // Track reversed ordering for RTL-style
  const [reverseOrder, setReverseOrder] = alignState
    ? [alignState.reverseOrder, alignState.setReverseOrder]
    : useState(isRTL(lang));

  const handleAlignToggle = () => {
    setCurrentAlign(a => {
      const nextAlign = a === "left" ? "right" : "left";
      setReverseOrder(ro => !ro);
      return nextAlign;
    });
  };

  // Burn-in effect: only fade-in new words by opacity (no fade-up)
  useEffect(() => {
    let curWords: string[] =
      /[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")
        ? text.split("")
        : text.trim().split(/\s+/).filter(Boolean);

    // If the panel is in RTL mode, reverse the array for display only
    if (reverseOrder) curWords = curWords.slice().reverse();

    let prevWords: string[] =
      /[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")
        ? prevTextRef.current.split("")
        : prevTextRef.current.trim().split(/\s+/).filter(Boolean);
    if (reverseOrder) prevWords = prevWords.slice().reverse();

    let start = 0;
    // Find where the previous and current diverge (to only fade in new words on the right side for LTR, left side for RTL)
    while (
      start < curWords.length &&
      start < prevWords.length &&
      curWords[start] === prevWords[start]
    ) {
      start++;
    }
    setDisplayedWords(curWords);
    if (curWords.length > prevWords.length) {
      const newIndexes = [];
      for (let i = start; i < curWords.length; ++i) newIndexes.push(i);
      setAnimatingWordIndexes(newIndexes);
      setTimeout(() => setAnimatingWordIndexes([]), 1200);
    } else {
      setAnimatingWordIndexes([]);
    }
    prevTextRef.current = text;
  }, [text, lang, reverseOrder]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedWords]);

  // Icon
  const AlIcon = currentAlign === "left" ? AlignLeft : AlignRight;

  return (
    <section
      className={`
        flex flex-col h-full w-full px-8 pt-8 pb-6
        ${currentAlign === "left" ? "items-start" : "items-end"}
        relative
      `}
    >
      <div className="flex flex-row items-center w-full mb-1 justify-between">
        <h2 className="uppercase tracking-widest text-xs font-semibold text-gray-400 flex-1">{title}</h2>
        <button className="ml-2 p-1 rounded hover:bg-accent transition"
          aria-label="Toggle paragraph alignment"
          onClick={handleAlignToggle}
        >
          <AlIcon size={18} />
        </button>
      </div>
      <div
        ref={scrollRef}
        className={`
          flex-1 w-full bg-white dark:bg-background text-black dark:text-white
          rounded
          overflow-y-auto
          scrollbar-thin
          transition-colors
          min-h-[3em]
          max-h-[100vh]
        `}
        style={{
          minHeight: "3em",
          height: "calc(100vh - 120px)",
        }}
      >
        <span
          className={`
            block
            ${currentAlign === "left" ? "text-left" : "text-right"}
            font-black leading-tight p-2
            opacity-100
            transition-opacity
            ${displayedWords.length === 0 ? "text-gray-300" : ""}
          `}
          style={{
            fontSize: textSize + "px",
            wordBreak: "break-word",
            lineHeight: 1.14,
            minHeight: "2em"
          }}
        >
          {displayedWords.length === 0 ? (
            <span className="text-gray-300">...</span>
          ) : (
            displayedWords.map((word, i) => (
              <span
                key={i + ":" + word}
                className={`inline-block align-top
                  ${animatingWordIndexes.includes(i) ? "fade-in-word" : ""}
                `}
                style={{
                  opacity: animatingWordIndexes.includes(i) ? 0 : 1,
                  animation: animatingWordIndexes.includes(i)
                    ? "fade-in-opacity 1.2s forwards"
                    : undefined,
                  marginRight:
                    (!reverseOrder && lang === "en") ? "0.25em"
                      : (reverseOrder && lang === "en") ? "0.25em"
                      : undefined,
                }}
              >
                {word}
                {/* Add space between LTR words unless last or RTL */}
                {(!reverseOrder && lang === "en" && i !== displayedWords.length - 1) ? " " : ""}
              </span>
            ))
          )}
        </span>
        <style>{`
            @keyframes fade-in-opacity {
              0% { opacity: 0;}
              100% { opacity: 1;}
            }
        `}</style>
      </div>
      {showAudioButton && audioButtonProps &&
        <AudioPlaybackButton {...audioButtonProps} />
      }
    </section>
  );
};

export default TranscriptPanel;
