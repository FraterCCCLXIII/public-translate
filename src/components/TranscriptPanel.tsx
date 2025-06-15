
import React, { useEffect, useRef, useState } from "react";
import { AlignLeft, AlignRight } from "lucide-react";

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
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [animatingWordIndexes, setAnimatingWordIndexes] = useState<number[]>([]);
  const prevTextRef = useRef<string>("");
  const [currentAlign, setCurrentAlign] = useState<"left"|"right">(align);
  // Track reversed ordering for RTL-style
  const [reverseOrder, setReverseOrder] = useState(isRTL(lang));

  // Change order logic on alignment click
  const handleAlignToggle = () => {
    setCurrentAlign(a => (a === "left" ? "right" : "left"));
    setReverseOrder(ro => !ro);
  };

  // Burn-in effect: only fade-in new words by opacity (not fade-up)
  useEffect(() => {
    // Split to words (for CJK/kana/han, fallback to normal split)
    let curWords: string[] =
      /[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")
        ? text.split("")
        : text.split(/\s+/).filter(Boolean);

    // If the panel is in RTL mode, reverse the array for display only
    if (reverseOrder) curWords = curWords.slice().reverse();

    let prevWords: string[] =
      /[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")
        ? prevTextRef.current.split("")
        : prevTextRef.current.split(/\s+/).filter(Boolean);
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
      // Animate only the new words (from start onward)
      const newIndexes = [];
      for (let i = start; i < curWords.length; ++i) newIndexes.push(i);
      setAnimatingWordIndexes(newIndexes);
      setTimeout(() => setAnimatingWordIndexes([]), 1200);
    } else {
      setAnimatingWordIndexes([]);
    }
    prevTextRef.current = text;
    // eslint-disable-next-line
    // depends on text, lang, reverseOrder
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
      `}
    >
      <div className="flex flex-row items-center w-full mb-1">
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
                      : (reverseOrder && lang === "en") ? "0.25em"  // Keep even when reversed, for LTR
                      : undefined,
                  marginLeft:
                    (reverseOrder && lang === "en") ? undefined
                      : undefined,
                  // You may tune margin for CJK separately if needed
                }}
              >
                {word}
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
    </section>
  );
};

export default TranscriptPanel;
