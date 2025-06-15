import React, { useEffect, useRef, useState } from "react";
import TranscriptPanelControls from "./TranscriptPanelControls";
import { Slider } from "./ui/slider";
import { Eye } from "lucide-react";

const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
function isRTL(lang: string) {
  return RTL_LANGS.has(lang);
}

const CHAR_REORDERABLE_LANGS = new Set(["ja", "zh", "ko"]);
function canReorderCharacters(lang: string) {
  return CHAR_REORDERABLE_LANGS.has(lang);
}

interface TranscriptWord {
  text: string;
  timestamp?: string;
}

interface TranscriptPanelProps {
  title: string;
  text: string | TranscriptWord[];
  align?: "left" | "right";
  textSize?: number;
  setTextSize?: (value: number) => void;
  lang?: string;
  showTimestamps?: boolean;
  showAudioButton?: boolean;
  audioButtonProps?: {
    text: string;
    playing: boolean;
    setPlaying: (v: boolean) => void;
    lang: string;
    onPlaybackStart?: () => void;
    onPlaybackEnd?: () => void;
    disabled?: boolean;
    selectedVoice?: string;
    setSelectedVoice?: (voiceId: string) => void;
  };
  alignState?: {
    currentAlign: "left" | "right";
    setCurrentAlign: (a: "left" | "right") => void;
    reverseOrder: boolean;
    setReverseOrder: (b: boolean) => void;
  };
  /** NEW: Only show top area on hover after recording. */
  isRecording?: boolean;
  /** NEW: Style main content in large pill. */
  pillStyle?: boolean;
  /** NEW: Option to show/hide Eye toggle and control parent visibility. */
  showVisibilityToggle?: boolean;
  visible?: boolean;
  setVisible?: (b: boolean) => void;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  title,
  text,
  align = "left",
  textSize = 80,
  setTextSize,
  lang = "en",
  showTimestamps = false,
  showAudioButton,
  audioButtonProps,
  alignState,
  isRecording,
  pillStyle,
  showVisibilityToggle,
  visible,
  setVisible,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedWords, setDisplayedWords] = useState<TranscriptWord[]>([]);
  const [animatingWordIndexes, setAnimatingWordIndexes] = useState<number[]>([]);
  const prevTextRef = useRef<string>("");

  const currentAlign = alignState ? alignState.currentAlign : align;
  const setCurrentAlign = alignState
    ? alignState.setCurrentAlign
    : () => {};
  const reverseOrder = alignState ? alignState.reverseOrder : isRTL(lang);
  const setReverseOrder = alignState ? alignState.setReverseOrder : () => {};

  const handleAlignToggle = () => {
    setCurrentAlign(currentAlign === "left" ? "right" : "left");
    setReverseOrder(!reverseOrder);
  };

  // Accept both string and array input, and only reorder for character-reorderable languages!
  useEffect(() => {
    // 1. Parse words
    let curWords: TranscriptWord[] = [];
    if (Array.isArray(text)) {
      curWords = [...text];
    } else if (/[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")) {
      curWords = text.split("").map(t => ({ text: t }));
    } else {
      curWords = text.trim().split(/\s+/).filter(Boolean).map(t => ({ text: t }));
    }

    // 2. Reverse characters for reorderable languages only!
    if (reverseOrder && canReorderCharacters(lang)) {
      curWords = curWords.slice().reverse();
    }

    // 3. Get previous word list
    let prevWords: string[] =
      /[\u4E00-\u9FFF\u3040-\u30FF]/.test(lang || "")
        ? prevTextRef.current.split("")
        : prevTextRef.current.trim().split(/\s+/).filter(Boolean);

    if (reverseOrder && canReorderCharacters(lang)) {
      prevWords = prevWords.slice().reverse();
    }

    let start = 0;
    while (
      start < curWords.length &&
      start < prevWords.length &&
      curWords[start].text === prevWords[start]
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
    prevTextRef.current = Array.isArray(text)
      ? text.map(w => w.text).join(" ")
      : text;
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

  // Defensive: ensure textSize is always a number (default fallback 80)
  const safeTextSize = typeof textSize === 'number' && !isNaN(textSize) ? textSize : 80;

  // Header hover state for showing controls only on hover after recording
  const [isHovered, setIsHovered] = useState(false);
  const showHeader = !isRecording || isHovered;

  // Pill wrapper classes
  const pillClass = pillStyle
    ? "rounded-full bg-gray-100 dark:bg-neutral-900 shadow-inner px-6 py-6 mx-2 flex items-center transition-all duration-200"
    : "";

  // Direction for <span> (RTL/LTR)
  const spanDir = isRTL(lang) ? "rtl" : "ltr";

  return (
    <section
      className={`
        flex flex-col h-full w-full relative
        ${currentAlign === "left" ? "items-start" : "items-end"}
        group
      `}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Column Header: language name, slider, icons, only visible on hover (if recording) */}
      <div
        className={`
          w-full flex flex-row items-center mb-2 px-4 pt-4
          ${showHeader ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          transition-opacity duration-200
        `}
      >
        {/* Language Name */}
        <h2 className="uppercase tracking-widest text-xs font-semibold text-gray-400 flex-1">
          {title}
        </h2>
        {/* Slider in the middle */}
        {setTextSize && (
          <div className="flex items-center gap-2 mx-2">
            <span className="text-xs text-gray-500">A</span>
            <Slider
              min={32}
              max={128}
              step={1}
              value={[safeTextSize]}
              onValueChange={arr => {
                const val = Array.isArray(arr) && arr.length > 0 ? arr[0] : 80;
                setTextSize(val);
              }}
              className="w-28"
              aria-label="Font Size"
            />
            <span className="text-base font-bold text-gray-700" style={{ fontSize: '1.25em' }}>A</span>
          </div>
        )}
        {/* Alignment & Audio Controls */}
        <TranscriptPanelControls
          align={currentAlign}
          onToggleAlign={handleAlignToggle}
          canAudioPlayback={!!(audioButtonProps && audioButtonProps.text)}
          onAudioPlayback={() => {}}
          audioPlaying={!!audioButtonProps?.playing}
          audioLoading={audioButtonProps?.disabled || false}
          audioText={audioButtonProps?.text}
          audioLang={audioButtonProps?.lang}
          selectedVoice={audioButtonProps?.selectedVoice}
          setSelectedVoice={audioButtonProps?.setSelectedVoice}
          setPlaying={audioButtonProps?.setPlaying}
          onPlaybackStart={audioButtonProps?.onPlaybackStart}
          onPlaybackEnd={audioButtonProps?.onPlaybackEnd}
        />
      </div>
      {/* Container for transcript/translation and optional eye toggle */}
      <div className={pillClass} style={{width:"100%", minHeight:"5em"}}>
        <div
          ref={scrollRef}
          className={`
            flex-1 w-full bg-transparent text-black dark:text-white
            overflow-y-auto
            scrollbar-thin
            transition-colors
            min-h-[3em]
            max-h-[100vh]
            flex items-center
          `}
          style={{
            minHeight: "3em",
            height: "auto",
            fontSize: safeTextSize,
          }}
        >
          <span
            dir={spanDir}
            className={`
              block w-full
              ${currentAlign === "left" ? "text-left" : "text-right"}
              font-black leading-tight
              opacity-100
              transition-opacity
              ${displayedWords.length === 0 ? "text-gray-300" : ""}
            `}
            style={{
              fontSize: safeTextSize + "px",
              wordBreak: "break-word",
              lineHeight: 1.14,
              minHeight: "2em",
              fontWeight: 700
            }}
          >
            {displayedWords.length === 0 ? (
              <span className="text-gray-300">...</span>
            ) : (
              displayedWords.map((wordObj, i) => (
                <span
                  key={i + ":" + wordObj.text}
                  className={`inline-block align-top relative
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
                    fontWeight: "inherit"
                  }}
                >
                  {wordObj.text}
                  {(!reverseOrder && lang === "en" && i !== displayedWords.length - 1) ? " " : ""}
                </span>
              ))
            )}
          </span>
        </div>
        {/* Only render eye toggle if explicitly enabled (e.g. in modal), never in main columns now */}
        {showVisibilityToggle && typeof visible !== "undefined" && typeof setVisible === "function" && (
          <button
            aria-label="Toggle visibility"
            className="ml-4 p-2 rounded-full hover:bg-accent transition-colors flex-shrink-0"
            onClick={() => setVisible(!visible)}
            tabIndex={0}
            type="button"
            style={{alignSelf:"center"}}
          >
            <Eye size={22} className={visible ? "opacity-100" : "opacity-30"} />
          </button>
        )}
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
