
import React, { useEffect, useRef } from "react";

interface TranscriptPanelProps {
  title: string;
  text: string;
  align?: "left" | "right";
  textSize?: number; // 5..9 maps to Tailwind text-3xl..text-9xl
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  title,
  text,
  align = "left",
  textSize = 7,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevText = useRef<string>("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevText.current = text;
  }, [text]);

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
          transition-colors
          scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700
        `}
        style={{
          minHeight: "3em",
          maxHeight: "50vh",
        }}
      >
        <span
          key={text} // triggers new animation for each change
          className={`
            block transition-opacity duration-700 opacity-0 animate-fadein
            ${align === "left" ? "text-left" : "text-right"}
            font-black leading-tight p-2
            text-${textSize}xl
          `}
          style={{
            animation: "fadein 1.1s forwards",
            display: "inline-block",
            wordBreak: "break-word",
            lineHeight: 1.14,
            minHeight: "2em"
          }}
        >
          {text || <span className="text-gray-300">...</span>}
        </span>
        <style>{`
            @keyframes fadein {
              from { opacity: 0 }
              to { opacity: 1 }
            }
        `}</style>
      </div>
    </section>
  );
};

export default TranscriptPanel;

