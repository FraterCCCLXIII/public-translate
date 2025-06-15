
import React from "react";

interface TranscriptPanelProps {
  title: string;
  text: string;
  align?: "left" | "right";
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  title,
  text,
  align = "left",
}) => (
  <section
    className={`
      flex flex-col h-full w-full px-10 py-8
      ${align === "left" ? "items-start" : "items-end"}
    `}
  >
    <h2 className="uppercase tracking-widest text-xs font-semibold mb-2 text-gray-400">{title}</h2>
    <div
      className={`
        text-5xl md:text-7xl font-black leading-tight
        text-black bg-white w-full
        break-words
        text-${align}
        rounded
        p-2
      `}
      style={{
        minHeight: "3em",
        transition: "background 0.15s",
      }}
    >
      {text || <span className="text-gray-300">...</span>}
    </div>
  </section>
);

export default TranscriptPanel;
