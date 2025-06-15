
import React, { useEffect, useRef, useState } from "react";

interface TranscriptPanelProps {
  title: string;
  text: string;
  align?: "left" | "right";
  textSize?: number; // is px
  lang?: string;
}

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

  // Burn-in effect: only fade-in new words
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

  return (
    <section
      className={`
        flex flex-col h-full w-full px-8 pt-8 pb-6
        ${align === "left" ? "items-start" : "items-end"}
      `}
    >
      <h2 className="uppercase tracking-widest text-xs font-semibold mb-2 text-gray-400">{title}</h2>
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
            ${align === "left" ? "text-left" : "text-right"}
            font-black leading-tight p-2
            opacity-100
            transition-opacity
            ${displayedWords.length === 0 ? "text-gray-300" : ""}
          `}
          style={{
            // @ts-ignore
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
                  ${animatingWords.includes(i) ? "animate-fade-in-word" : ""}
                `}
                style={{
                  animation: animatingWords.includes(i)
                    ? "fade-in-word 1.2s forwards"
                    : undefined,
                }}
              >
                {word}
              </span>
            ))
          )}
        </span>
        <style>{`
            @keyframes fade-in-word {
              0% { opacity: 0; transform: translateY(10px);}
              100% { opacity: 1; transform: none;}
            }
        `}</style>
      </div>
    </section>
  );
};

export default TranscriptPanel;
