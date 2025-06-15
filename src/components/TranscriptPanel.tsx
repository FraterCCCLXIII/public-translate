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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
          scrollbar-thin
          transition-colors
        `}
        style={{
          minHeight: "3em",
          maxHeight: "100vh",
        }}
      >
        <span
          key={text}
          className={`
            block animate-fade-in
            ${align === "left" ? "text-left" : "text-right"}
            font-black leading-tight p-2
            text-${textSize}xl
            opacity-100
            transition-opacity
          `}
          style={{
            animation: "fade-in 1.2s forwards",
            wordBreak: "break-word",
            lineHeight: 1.14,
            minHeight: "2em"
          }}
        >
          {text || <span className="text-gray-300">...</span>}
        </span>
        <style>{`
            @keyframes fade-in {
              0% { opacity: 0; transform: translateY(10px);}
              100% { opacity: 1; transform: none;}
            }
        `}</style>
      </div>
    </section>
  );
};

export default TranscriptPanel;
