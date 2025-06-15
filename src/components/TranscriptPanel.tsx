
import React, { useEffect, useRef, useState } from "react";
import TranscriptPanelControls from "./TranscriptPanelControls";

const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
function isRTL(lang: string) {
  return RTL_LANGS.has(lang);
}

interface TranscriptPanelProps {
  title: string;
  text: string;
  align?: "left" | "right";
  textSize?: number;
  lang?: string;
  showAudioButton?: boolean;
  audioButtonProps?: {
    text: string;
    playing: boolean;
    setPlaying: (v: boolean) => void;
    lang: string;
    onPlaybackStart?: () => void;
    onPlaybackEnd?: () => void;
    disabled?: boolean;
  };
  alignState?: {
    currentAlign: "left" | "right";
    setCurrentAlign: (a: "left" | "right") => void;
    reverseOrder: boolean;
    setReverseOrder: (b: boolean) => void;
  };
}

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

  const currentAlign = alignState ? alignState.currentAlign : align;
  const setCurrentAlign = alignState
    ? alignState.setCurrentAlign
    : () => { };
  const reverseOrder = alignState ? alignState.reverseOrder : isRTL(lang);
  const setReverseOrder = alignState ? alignState.setReverseOrder : () => { };

  const handleAlignToggle = () => {
    setCurrentAlign(currentAlign === "left" ? "right" : "left");
    setReverseOrder(!reverseOrder);
  };

  // Burn-in effect: only fade-in new words by opacity (no fade-up)
  useEffect(() => {
    let curWords: string[] =
      /[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")
        ? text.split("")
        : text.trim().split(/\s+/).filter(Boolean);
    // If RTL, reverse for display only
    if (reverseOrder) curWords = curWords.slice().reverse();

    let prevWords: string[] =
      /[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")
        ? prevTextRef.current.split("")
        : prevTextRef.current.trim().split(/\s+/).filter(Boolean);
    if (reverseOrder) prevWords = prevWords.slice().reverse();

    let start = 0;
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

  // Audio state
  const [audioLoading, setAudioLoading] = useState(false);

  const handleAudioPlayback = () => {
    if (!audioButtonProps) return;
    setAudioLoading(true);
    audioButtonProps.setPlaying(true);
    audioButtonProps.onPlaybackStart?.();
    // Use browser TTS API
    if ("speechSynthesis" in window) {
      const utter = new window.SpeechSynthesisUtterance(audioButtonProps.text);
      utter.lang = audioButtonProps.lang;
      utter.onend = () => {
        setAudioLoading(false);
        audioButtonProps.setPlaying(false);
        audioButtonProps.onPlaybackEnd?.();
      };
      utter.onerror = () => {
        setAudioLoading(false);
        audioButtonProps.setPlaying(false);
        audioButtonProps.onPlaybackEnd?.();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } else {
      setAudioLoading(false);
      audioButtonProps.setPlaying(false);
      audioButtonProps.onPlaybackEnd?.();
    }
  };

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
        <TranscriptPanelControls
          align={currentAlign}
          onToggleAlign={handleAlignToggle}
          canAudioPlayback={!!(audioButtonProps && audioButtonProps.text)}
          onAudioPlayback={handleAudioPlayback}
          audioPlaying={!!audioButtonProps?.playing}
          audioLoading={audioLoading}
        />
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
    </section>
  );
};

export default TranscriptPanel;
