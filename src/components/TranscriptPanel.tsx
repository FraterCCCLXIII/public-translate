
import React, { useEffect, useRef, useState } from "react";
import { AlignLeft, AlignRight } from "lucide-react";

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
  const [animatingWords, setAnimatingWords] = useState<number[]>([]);
  const prevTextRef = useRef<string>("");
  const [currentAlign, setCurrentAlign] = useState<"left"|"right">(align);

  // Burn-in effect: only fade-in new words by opacity
  useEffect(() => {
    const curWords = text.split(/\s+/).filter(Boolean);
    const prevWords = prevTextRef.current.split(/\s+/).filter(Boolean);

    let start = 0;
    while (start < curWords.length && curWords[start] === prevWords[start]) {
      start++;
    }
    setDisplayedWords(curWords);
    if (curWords.length > prevWords.length) {
      // Animate in the new words (added at end)
      const newIndexes = [];
      for (let i = start; i < curWords.length; ++i) newIndexes.push(i);
      setAnimatingWords(newIndexes);
      setTimeout(() => setAnimatingWords([]), 1200); // match fade-in duration
    } else {
      setAnimatingWords([]);
    }
    prevTextRef.current = text;
  }, [text]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedWords]);

  // Toggle alignment (clickable icon)
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
        <button className="ml-2 p-1 rounded hover:bg-accent transition" aria-label="Toggle paragraph alignment"
          onClick={() => setCurrentAlign(a => a === "left" ? "right" : "left")}
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
                className={`inline-block mr-1 align-top
                  ${animatingWords.includes(i) ? "fade-in-word" : ""}
                `}
                style={{
                  opacity: animatingWords.includes(i) ? 0 : 1,
                  animation: animatingWords.includes(i)
                    ? "fade-in-opacity 1.2s forwards"
                    : undefined,
                  marginRight: lang === "en" ? "0.25em" : undefined,
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
