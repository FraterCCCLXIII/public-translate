import React, { useEffect, useRef, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import MicButton from "./MicButton";
import { Sun, Moon, Settings, Eye, Info, Maximize, FileText } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Dialog } from "@radix-ui/react-dialog";
import { saveAs } from "file-saver";
import AboutModal from "./AboutModal";
import { useTranslation } from "@/hooks/useTranslation";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider, useI18n } from "@/hooks/useUITitleTranslation";
import TranscriptPanel from "./TranscriptPanel";

// Dummy translation XML replacement
const t = (key: string, defaultVal: string) => defaultVal; // Replace with real t() function

const LANGUAGES = [
  // Major World Languages
  { value: "en", label: "English", alphabet: "latin" },
  { value: "es", label: "Spanish", alphabet: "latin" },
  { value: "fr", label: "French", alphabet: "latin" },
  { value: "de", label: "German", alphabet: "latin" },
  { value: "it", label: "Italian", alphabet: "latin" },
  { value: "pt", label: "Portuguese", alphabet: "latin" },
  { value: "ru", label: "Russian", alphabet: "cyrillic" },
  { value: "zh", label: "Chinese", alphabet: "han" },
  { value: "ja", label: "Japanese", alphabet: "kana" },
  { value: "ko", label: "Korean", alphabet: "hangul" },
  { value: "ar", label: "Arabic", alphabet: "arabic" },
  { value: "hi", label: "Hindi", alphabet: "devanagari" },
  { value: "bn", label: "Bengali", alphabet: "bengali" },
  { value: "ur", label: "Urdu", alphabet: "arabic" },
  { value: "tr", label: "Turkish", alphabet: "latin" },
  { value: "th", label: "Thai", alphabet: "thai" },
  { value: "vi", label: "Vietnamese", alphabet: "latin" },
  { value: "id", label: "Indonesian", alphabet: "latin" },
  { value: "ms", label: "Malay", alphabet: "latin" },
  { value: "fa", label: "Persian", alphabet: "arabic" },
  { value: "he", label: "Hebrew", alphabet: "hebrew" },
  { value: "pl", label: "Polish", alphabet: "latin" },
  { value: "nl", label: "Dutch", alphabet: "latin" },
  { value: "sv", label: "Swedish", alphabet: "latin" },
  { value: "da", label: "Danish", alphabet: "latin" },
  { value: "no", label: "Norwegian", alphabet: "latin" },
  { value: "fi", label: "Finnish", alphabet: "latin" },
  { value: "cs", label: "Czech", alphabet: "latin" },
  { value: "sk", label: "Slovak", alphabet: "latin" },
  { value: "hu", label: "Hungarian", alphabet: "latin" },
  { value: "ro", label: "Romanian", alphabet: "latin" },
  { value: "bg", label: "Bulgarian", alphabet: "cyrillic" },
  { value: "hr", label: "Croatian", alphabet: "latin" },
  { value: "sr", label: "Serbian", alphabet: "cyrillic" },
  { value: "sl", label: "Slovenian", alphabet: "latin" },
  { value: "et", label: "Estonian", alphabet: "latin" },
  { value: "lv", label: "Latvian", alphabet: "latin" },
  { value: "lt", label: "Lithuanian", alphabet: "latin" },
  { value: "el", label: "Greek", alphabet: "greek" },
  { value: "mt", label: "Maltese", alphabet: "latin" },
  { value: "ga", label: "Irish", alphabet: "latin" },
  { value: "cy", label: "Welsh", alphabet: "latin" },
  { value: "is", label: "Icelandic", alphabet: "latin" },
  { value: "ca", label: "Catalan", alphabet: "latin" },
  { value: "eu", label: "Basque", alphabet: "latin" },
  { value: "gl", label: "Galician", alphabet: "latin" },
  { value: "af", label: "Afrikaans", alphabet: "latin" },
  { value: "sw", label: "Swahili", alphabet: "latin" },
  { value: "am", label: "Amharic", alphabet: "ethiopic" },
  { value: "yo", label: "Yoruba", alphabet: "latin" },
  { value: "ig", label: "Igbo", alphabet: "latin" },
  { value: "zu", label: "Zulu", alphabet: "latin" },
  { value: "xh", label: "Xhosa", alphabet: "latin" },
  { value: "ta", label: "Tamil", alphabet: "tamil" },
  { value: "te", label: "Telugu", alphabet: "telugu" },
  { value: "kn", label: "Kannada", alphabet: "kannada" },
  { value: "ml", label: "Malayalam", alphabet: "malayalam" },
  { value: "gu", label: "Gujarati", alphabet: "gujarati" },
  { value: "pa", label: "Punjabi", alphabet: "gurmukhi" },
  { value: "mr", label: "Marathi", alphabet: "devanagari" },
  { value: "or", label: "Odia", alphabet: "odia" },
  { value: "as", label: "Assamese", alphabet: "bengali" },
  { value: "ne", label: "Nepali", alphabet: "devanagari" },
  { value: "si", label: "Sinhala", alphabet: "sinhala" },
  { value: "my", label: "Burmese", alphabet: "myanmar" },
  { value: "km", label: "Khmer", alphabet: "khmer" },
  { value: "lo", label: "Lao", alphabet: "lao" },
  { value: "mn", label: "Mongolian", alphabet: "cyrillic" },
  { value: "ka", label: "Georgian", alphabet: "georgian" },
  { value: "hy", label: "Armenian", alphabet: "armenian" },
  { value: "az", label: "Azerbaijani", alphabet: "latin" },
  { value: "kk", label: "Kazakh", alphabet: "cyrillic" },
  { value: "ky", label: "Kyrgyz", alphabet: "cyrillic" },
  { value: "uz", label: "Uzbek", alphabet: "latin" },
  { value: "tg", label: "Tajik", alphabet: "cyrillic" },
  { value: "tk", label: "Turkmen", alphabet: "latin" },
  { value: "ps", label: "Pashto", alphabet: "arabic" },
  { value: "ku", label: "Kurdish", alphabet: "arabic" },
  { value: "sd", label: "Sindhi", alphabet: "arabic" },
  { value: "bo", label: "Tibetan", alphabet: "tibetan" },
  { value: "dz", label: "Dzongkha", alphabet: "tibetan" },
  { value: "mk", label: "Macedonian", alphabet: "cyrillic" },
  { value: "sq", label: "Albanian", alphabet: "latin" },
  { value: "be", label: "Belarusian", alphabet: "cyrillic" },
  { value: "uk", label: "Ukrainian", alphabet: "cyrillic" },
  { value: "bs", label: "Bosnian", alphabet: "latin" },
  { value: "me", label: "Montenegrin", alphabet: "latin" },
  { value: "fy", label: "Frisian", alphabet: "latin" },
  { value: "lb", label: "Luxembourgish", alphabet: "latin" },
  { value: "rm", label: "Romansh", alphabet: "latin" },
  { value: "fo", label: "Faroese", alphabet: "latin" },
  { value: "sm", label: "Samoan", alphabet: "latin" },
  { value: "to", label: "Tongan", alphabet: "latin" },
  { value: "fj", label: "Fijian", alphabet: "latin" },
  { value: "haw", label: "Hawaiian", alphabet: "latin" },
  { value: "mi", label: "Maori", alphabet: "latin" },
  { value: "qu", label: "Quechua", alphabet: "latin" },
  { value: "ay", label: "Aymara", alphabet: "latin" },
  { value: "gn", label: "Guarani", alphabet: "latin" },
  { value: "ht", label: "Haitian Creole", alphabet: "latin" },
  { value: "jmc", label: "Machame", alphabet: "latin" },
  { value: "sn", label: "Shona", alphabet: "latin" },
  { value: "st", label: "Southern Sotho", alphabet: "latin" },
  { value: "tn", label: "Tswana", alphabet: "latin" },
  { value: "ve", label: "Venda", alphabet: "latin" },
  { value: "ts", label: "Tsonga", alphabet: "latin" },
  { value: "ss", label: "Swati", alphabet: "latin" },
  { value: "nr", label: "Southern Ndebele", alphabet: "latin" },
  { value: "nd", label: "Northern Ndebele", alphabet: "latin" },
  { value: "rw", label: "Kinyarwanda", alphabet: "latin" },
  { value: "ak", label: "Akan", alphabet: "latin" },
  { value: "tw", label: "Twi", alphabet: "latin" },
  { value: "ee", label: "Ewe", alphabet: "latin" },
  { value: "fon", label: "Fon", alphabet: "latin" },
  { value: "ha", label: "Hausa", alphabet: "latin" },
  { value: "ff", label: "Fulah", alphabet: "latin" },
  { value: "wo", label: "Wolof", alphabet: "latin" },
  { value: "dyo", label: "Jola-Fonyi", alphabet: "latin" },
  { value: "bem", label: "Bemba", alphabet: "latin" },
  { value: "ny", label: "Chichewa", alphabet: "latin" },
  { value: "byn", label: "Blin", alphabet: "ethiopic" },
  { value: "ti", label: "Tigrinya", alphabet: "ethiopic" },
  { value: "so", label: "Somali", alphabet: "latin" },
  { value: "om", label: "Oromo", alphabet: "latin" },
  { value: "gsw", label: "Swiss German", alphabet: "latin" },
  { value: "fur", label: "Friulian", alphabet: "latin" },
  { value: "lld", label: "Ladin", alphabet: "latin" },
  { value: "vec", label: "Venetian", alphabet: "latin" },
  { value: "sc", label: "Sardinian", alphabet: "latin" },
  { value: "co", label: "Corsican", alphabet: "latin" },
  { value: "oc", label: "Occitan", alphabet: "latin" },
  { value: "an", label: "Aragonese", alphabet: "latin" },
  { value: "ast", label: "Asturian", alphabet: "latin" },
  { value: "ext", label: "Extremaduran", alphabet: "latin" },
  { value: "lad", label: "Ladino", alphabet: "latin" },
  { value: "wa", label: "Walloon", alphabet: "latin" },
  { value: "pcd", label: "Picard", alphabet: "latin" },
  { value: "nrf", label: "Guernésiais", alphabet: "latin" },
  { value: "jèr", label: "Jèrriais", alphabet: "latin" },
  { value: "sco", label: "Scots", alphabet: "latin" },
  { value: "gd", label: "Scottish Gaelic", alphabet: "latin" },
  { value: "kw", label: "Cornish", alphabet: "latin" },
  { value: "br", label: "Breton", alphabet: "latin" },
  { value: "gv", label: "Manx", alphabet: "latin" },
];

// Add list of UI languages for the dropdown
const UI_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" }
];

const pxPresets = [
  { value: 32, label: "32px" },
  { value: 40, label: "40px" },
  { value: 48, label: "48px" },
  { value: 56, label: "56px" },
  { value: 68, label: "68px" },
  { value: 80, label: "80px" },
  { value: 96, label: "96px" },
  { value: 112, label: "112px" },
  { value: 128, label: "128px" },
];

const LLM_MODELS = [
  { value: "openai", label: "OpenAI" },
  { value: "claude", label: "Claude" },
  { value: "deepseek", label: "Deepseek" },
  { value: "localllm", label: "Local LLM" },
  { value: "googletranslate", label: "Google Translate (free)" },
];

const TRANSLATION_PROVIDERS = [
  { value: "openai", label: "OpenAI (Best Quality)" },
  { value: "mymemory", label: "MyMemory (Free, Reliable)" },
  { value: "libretranslate", label: "LibreTranslate (Open Source)" },
  { value: "auto", label: "Auto (Try All)" },
];

const TTS_PROVIDERS = [
  { value: "", label: "None" },
  { value: "elevenlabs", label: "ElevenLabs" },
  { value: "playht", label: "PlayHT" },
  { value: "localllm", label: "Local LLM" },
  { value: "openvoice", label: "OpenVoice" },
  { value: "xtts", label: "XTTS" },
  { value: "bark", label: "Bark" },
];

const TTS_VOICES: { [key: string]: { value: string, label: string }[] } = {
  elevenlabs: [
    { value: "9BWtsMINqrJLrRacOk9x", label: "Aria" },
    { value: "CwhRBWXzGAHq8TQ4Fs17", label: "Roger" },
    { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah" },
    { value: "FGY2WhTYpPnrIDTdsKH5", label: "Laura" },
    { value: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam" },
    { value: "SAz9YHcvj6GT2YYXdXww", label: "River" },
    { value: "XB0fDUnXU5powFXDhCwa", label: "Charlotte" },
    { value: "N2lVS1w4EtoT3dr4eOWO", label: "Callum" },
    // ...add more
  ],
  playht: [{ value: "default", label: "Default" }],
  localllm: [{ value: "local", label: "Local Default" }],
  openvoice: [{ value: "openvoice", label: "OpenVoice" }],
  xtts: [{ value: "xtts", label: "XTTS Default" }],
  bark: [{ value: "bark", label: "Bark Default" }],
  "": [],
};

interface TranscriptNavProps {
  className?: string;
  recording: boolean;
  onMicClick: () => void;
  textSize: number;
  setTextSize: (n: number) => void;
  leftLang: string;
  rightLang: string;
  setLeftLang: (lang: string) => void;
  setRightLang: (lang: string) => void;
  leftVisible: boolean;
  rightVisible: boolean;
  setLeftVisible: (b: boolean) => void;
  setRightVisible: (b: boolean) => void;
  transcript: string;
  translation: string;
  navVisible?: boolean;
  setNavVisible?: (b: boolean) => void;
  isAudioPlaying?: boolean;
  showDebugWindow?: boolean;
  setShowDebugWindow?: (show: boolean) => void;
  autoSpeak?: boolean;
  setAutoSpeak?: (enabled: boolean) => void;
  silenceTimeout?: number;
  setSilenceTimeout?: (timeout: number) => void;
}

const TranscriptNavInner: React.FC<TranscriptNavProps> = ({
  className = "",
  recording,
  onMicClick,
  textSize,
  setTextSize,
  leftLang,
  rightLang,
  setLeftLang,
  setRightLang,
  leftVisible,
  rightVisible,
  setLeftVisible,
  setRightVisible,
  transcript,
  translation,
  navVisible = true,
  setNavVisible,
  isAudioPlaying = false,
  showDebugWindow = false,
  setShowDebugWindow,
  autoSpeak = true,
  setAutoSpeak,
  silenceTimeout = 3000,
  setSilenceTimeout,
}) => {
  const [darkMode, setDarkMode] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Auto-hide nav after inactivity 
  // Add: notify parent about visibility so they can control RecordingDot
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const wasRecordingRef = useRef(recording);
  const justFromAudioPlaybackRef = useRef(false);
  
  useEffect(() => {
    console.log("[TranscriptNav] Visibility effect triggered:", { recording, isAudioPlaying, visible, wasRecording: wasRecordingRef.current, justFromAudio: justFromAudioPlaybackRef.current });
    
    // Clear any existing timer
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    // Track if we just came from audio playback
    if (isAudioPlaying) {
      justFromAudioPlaybackRef.current = true;
    }

    // Only show controls when recording stops due to user action (not audio playback)
    // Check if we just stopped recording (was recording before, not recording now)
    if (wasRecordingRef.current && !recording && !isAudioPlaying) {
      console.log("[TranscriptNav] Recording stopped by user action - showing controls");
      setVisible(true);
      setNavVisible?.(true);
    }

    // If recording starts after audio playback, don't show controls automatically
    if (!wasRecordingRef.current && recording && justFromAudioPlaybackRef.current) {
      console.log("[TranscriptNav] Recording started after audio playback - keeping controls hidden");
      setVisible(false);
      setNavVisible?.(false);
      // Reset the flag after a short delay to allow normal behavior
      setTimeout(() => {
        justFromAudioPlaybackRef.current = false;
      }, 1000);
    }

    // Update the ref to track recording state changes
    wasRecordingRef.current = recording;
    
    // If not recording and audio is playing, don't change visibility
    // Let it stay in its current state (hidden if it was hidden)
    console.log("[TranscriptNav] Not recording and audio playing - maintaining current visibility state");
  }, [recording, isAudioPlaying, setNavVisible]);
  
  // Mouse movement handler that always shows controls (regardless of audio state)
  useEffect(() => {
    const handleMouseMove = () => {
      console.log("[TranscriptNav] Mouse movement - showing controls");
      setVisible(true);
      setNavVisible?.(true);
      
      // Set up auto-hide timer
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        console.log("[TranscriptNav] Auto-hiding controls after mouse movement timeout");
        setVisible(false);
        setNavVisible?.(false);
      }, 3000);
    };

    // Always listen for mouse movement to show controls
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleMouseMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [setNavVisible]);
  
  const navRef = useRef<HTMLDivElement>(null);

  // About Modal state
  const [aboutOpen, setAboutOpen] = useState(false);

  // Settings & language picker state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uiLanguage, setUiLanguage] = useState<string>(() => localStorage.getItem("ui_language") || "en");

  // Settings modal (popover)
  const [llmProvider, setLlmProvider] = useState<string>(() => localStorage.getItem("llm_provider") || "openai");
  const [translationProvider, setTranslationProvider] = useState<string>(() => localStorage.getItem("translation_provider") || "auto");
  const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem("openai_api_key") || "");
  const [claudeKey, setClaudeKey] = useState<string>(() => localStorage.getItem("claude_api_key") || "");
  const [deepseekKey, setDeepseekKey] = useState<string>(() => localStorage.getItem("deepseek_api_key") || "");
  const [localLlmUrl, setLocalLlmUrl] = useState<string>(() => localStorage.getItem("local_llm_url") || "");
  const [googleKey, setGoogleKey] = useState<string>(() => localStorage.getItem("google_api_key") || "");
  const [ttslib, setTtslib] = useState<string>(() => localStorage.getItem("tts_provider") || "");
  const [ttsKey, setTtsKey] = useState<string>(() => localStorage.getItem("tts_api_key") || "");
  const [ttsVoice, setTtsVoice] = useState<string>(() => localStorage.getItem("tts_voice") || "");

  // Only show voice options for TTS with voice choices
  useEffect(() => {
    if (!TTS_VOICES[ttslib]?.find(v => v.value === ttsVoice)) {
      setTtsVoice(TTS_VOICES[ttslib]?.[0]?.value || "");
    }
  }, [ttslib]);

  const saveSettings = () => {
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("llm_provider", llmProvider);
    localStorage.setItem("translation_provider", translationProvider);
    localStorage.setItem("auto_speak", autoSpeak.toString());
    localStorage.setItem("silence_timeout", silenceTimeout.toString());
    localStorage.setItem("claude_api_key", claudeKey);
    localStorage.setItem("deepseek_api_key", deepseekKey);
    localStorage.setItem("local_llm_url", localLlmUrl);
    localStorage.setItem("google_api_key", googleKey);
    localStorage.setItem("tts_provider", ttslib);
    localStorage.setItem("tts_api_key", ttsKey);
    localStorage.setItem("tts_voice", ttsVoice);
    setSettingsOpen(false);
  };

  // Font size slider popover
  const [showFontSize, setShowFontSize] = useState(false);

  // Transcript dialog
  const [showTranscript, setShowTranscript] = useState(false);

  const handleDownload = () => {
    const content = `--- ${LANGUAGES.find(l => l.value === leftLang)?.label || leftLang} ---\n${transcript}\n\n--- ${LANGUAGES.find(l => l.value === rightLang)?.label || rightLang} ---\n${translation}\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "transcript.txt");
  };

  // NEW: Fullscreen handler (Maximize icon)
  const handleMaximize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  useEffect(() => {
    // Save selected UI language to localStorage
    localStorage.setItem("ui_language", uiLanguage);
    // TODO: wire in setI18nLanguage(uiLanguage) or similar as needed
  }, [uiLanguage]);

  // Add i18n translation hook:
  const { t, locale, setLocale } = useI18n();

  const leftLabel = LANGUAGES.find(l => l.value === leftLang)?.label || leftLang;
  const rightLabel = LANGUAGES.find(l => l.value === rightLang)?.label || rightLang;

  const handleMouseEnter = () => {
    // Always show controls on mouse enter (including during audio playback)
    console.log("[TranscriptNav] Mouse enter - showing controls");
    setVisible(true);
    setNavVisible?.(true);
  };

  // Language Selector Component with Search
  const LanguageSelector: React.FC<{
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  }> = ({ value, onValueChange, placeholder = "Select language", className = "" }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    const filteredLanguages = LANGUAGES.filter(lang =>
      lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className={`relative ${className}`}>
        <Select value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={setIsOpen}>
          <SelectTrigger className="w-28" aria-label={placeholder}>
            <SelectValue aria-label={placeholder}>
              {LANGUAGES.find(l => l.value === value)?.label || value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-96">
            {/* Search Input - Sticky at top */}
            <div className="sticky top-0 bg-background border-b p-2">
              <input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchTerm("");
                    setIsOpen(false);
                  }
                }}
                onPointerDown={e => e.stopPropagation()}
              />
            </div>
            
            {/* Language List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredLanguages.length === 0 ? (
                <div className="px-2 py-2 text-sm text-gray-500 text-center">
                  No languages found
                </div>
              ) : (
                filteredLanguages.map(lang => (
                  <SelectItem 
                    key={lang.value} 
                    value={lang.value}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{lang.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{lang.value}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <>
      {/* About Modal */}
      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
      {/* Transcript Modal - full screen */}
      {showTranscript && (
        <Dialog open onOpenChange={setShowTranscript}>
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-0 animate-fade-in">
            <div className="bg-white dark:bg-background w-full h-full max-w-full max-h-full p-6 flex flex-col rounded-none shadow-lg z-[10000]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xl">Full Transcript</h3>
                <Button variant="outline" size="sm" onClick={() => setShowTranscript(false)}>Close</Button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 h-full overflow-auto">
                <div className="flex-1 flex flex-col min-w-0">
                  <h4 className="font-semibold text-xs mb-1">{leftLabel}</h4>
                  {/* TranscriptPanel for modal view with timestamps */}
                  {/* @ts-ignore - Panel expects text prop type from parent */}
                  <TranscriptPanel
                    title={leftLabel}
                    text={transcript}
                    align="left"
                    textSize={40}
                    lang={leftLang}
                    showTimestamps={true}
                  />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <h4 className="font-semibold text-xs mb-1">{rightLabel}</h4>
                  {/* @ts-ignore - Panel expects text prop type from parent */}
                  <TranscriptPanel
                    title={rightLabel}
                    text={translation}
                    align="right"
                    textSize={40}
                    lang={rightLang}
                    showTimestamps={true}
                  />
                </div>
              </div>
              <Button onClick={handleDownload} className="w-full mt-2" variant="default">Download</Button>
            </div>
          </div>
        </Dialog>
      )}
      <TooltipProvider>
      <nav
        ref={navRef}
        className={`
          fixed z-50 left-1/2 bottom-0 
          transform -translate-x-1/2
          mx-auto 
          inline-flex flex-row justify-center items-center
          gap-x-2
          bg-white/90 dark:bg-background/90 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-4 py-3 backdrop-blur-xl
          transition-opacity duration-500
          mb-4
          ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          ${className}
        `}
        aria-label="Transcription Controls"
        style={{
          transition: "opacity 0.5s",
          marginBottom: "1rem",
          maxWidth: "100vw",
          width: "auto",
          minWidth: "0px",
          maxHeight: "calc(-2rem + 100vh)"
        }}
        onMouseEnter={handleMouseEnter}
      >
        {/* Mic button with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MicButton
                recording={recording}
                onClick={onMicClick}
                aria-label={t("mic_button")}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-white shadow-pill">
            {t("mic_button_label")}
          </TooltipContent>
        </Tooltip>

        {/* Left Language Select with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-x-2">
              <LanguageSelector value={leftLang} onValueChange={setLeftLang} />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("hide_left_panel")}
                className="h-10 w-10 !rounded-full aspect-square"
                onClick={() => setLeftVisible(!leftVisible)}
                tabIndex={-1}
              >
                <Eye size={18} className={`${leftVisible ? "opacity-100" : "opacity-30"}`} />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-white shadow-pill">
            {t("from_language_help")}
          </TooltipContent>
        </Tooltip>

        <span className="text-xs text-gray-400">→</span>

        {/* Right Language Select with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-x-2">
              <LanguageSelector value={rightLang} onValueChange={setRightLang} />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("hide_right_panel")}
                className="h-10 w-10 !rounded-full aspect-square"
                onClick={() => setRightVisible(!rightVisible)}
                tabIndex={-1}
              >
                <Eye size={18} className={`${rightVisible ? "opacity-100" : "opacity-30"}`} />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-white shadow-pill">
            {t("to_language_help")}
          </TooltipContent>
        </Tooltip>
        
        {/* Transcript Button as Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 !rounded-full aspect-square"
              onClick={() => setShowTranscript(true)}
              aria-label={t("view_full_transcript")}
            >
              <FileText size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-white shadow-pill">
            {t("transcript_help")}
          </TooltipContent>
        </Tooltip>

        {/* Settings icon with popover and language dropdown */}
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 !rounded-full aspect-square"
              aria-label={t("settings")}
            >
              <Settings size={22} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 max-w-[96vw]">
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-bold text-xs text-gray-700">{t("llm_provider")}</label>
                <select
                  value={llmProvider}
                  className="w-full mt-1 border rounded px-2 py-1 bg-background"
                  onChange={e => setLlmProvider(e.target.value)}
                >
                  {LLM_MODELS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {llmProvider === "googletranslate" && (
                  <div className="text-xs text-blue-600 mt-1">
                    Uses Google Translate via a backend proxy (requires a Python proxy API with <a href="https://pypi.org/project/googletrans/" target="_blank" rel="noopener noreferrer" className="underline">googletrans</a> on server).
                  </div>
                )}
              </div>
              {/* Show fields depending on provider */}
              {llmProvider === "openai" && (
                <div>
                  <label className="font-bold text-xs text-gray-700">{t("openai_api_key")}</label>
                  <input
                    className="w-full mt-1 border rounded px-2 py-1 bg-background"
                    value={openaiKey}
                    type="password"
                    onChange={e => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
              )}
              {llmProvider === "claude" && (
                <div>
                  <label className="font-bold text-xs text-gray-700">{t("claude_api_key")}</label>
                  <input
                    className="w-full mt-1 border rounded px-2 py-1 bg-background"
                    value={claudeKey}
                    type="password"
                    onChange={e => setClaudeKey(e.target.value)}
                    placeholder="p-..."
                  />
                </div>
              )}
              {llmProvider === "deepseek" && (
                <div>
                  <label className="font-bold text-xs text-gray-700">{t("deepseek_api_key")}</label>
                  <input
                    className="w-full mt-1 border rounded px-2 py-1 bg-background"
                    value={deepseekKey}
                    type="password"
                    onChange={e => setDeepseekKey(e.target.value)}
                    placeholder="..."
                  />
                </div>
              )}
              {llmProvider === "localllm" && (
                <div>
                  <label className="font-bold text-xs text-gray-700">{t("local_llm_url")}</label>
                  <input
                    className="w-full mt-1 border rounded px-2 py-1 bg-background"
                    value={localLlmUrl}
                    type="text"
                    onChange={e => setLocalLlmUrl(e.target.value)}
                    placeholder="http://localhost:port"
                  />
                </div>
              )}
              {/* Additional Google API key field if necessary */}
              {(llmProvider === "googletranslate") && (
                <div>
                  <label className="font-bold text-xs text-gray-700">{t("proxy_url")}</label>
                  <input
                    className="w-full mt-1 border rounded px-2 py-1 bg-background"
                    value={googleKey}
                    type="text"
                    onChange={e => setGoogleKey(e.target.value)}
                    placeholder="Proxy endpoint or leave blank if not needed"
                  />
                </div>
              )}
              {/* Translation Provider dropdown */}
              <div>
                <label className="font-bold text-xs text-gray-700">Translation Provider</label>
                <select
                  value={translationProvider}
                  className="w-full mt-1 border rounded px-2 py-1 bg-background"
                  onChange={e => setTranslationProvider(e.target.value)}
                >
                  {TRANSLATION_PROVIDERS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {translationProvider === "auto" && "Will try OpenAI first, then MyMemory, then LibreTranslate"}
                  {translationProvider === "mymemory" && "Free translation service, no API key required"}
                  {translationProvider === "libretranslate" && "Open source translation service"}
                  {translationProvider === "openai" && "Requires OpenAI API key for best quality"}
                </div>
              </div>
              {/* Auto-Speak Settings */}
              <div>
                <label className="font-bold text-xs text-gray-700">Auto-Speak Settings</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="autoSpeak"
                    checked={autoSpeak}
                    onChange={e => setAutoSpeak?.(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autoSpeak" className="text-xs">Auto-speak translation after silence</label>
                </div>
                {autoSpeak && (
                  <div className="mt-2">
                    <label className="text-xs text-gray-600">Silence timeout (seconds):</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={silenceTimeout / 1000}
                      onChange={e => setSilenceTimeout?.(parseFloat(e.target.value) * 1000)}
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {silenceTimeout / 1000} seconds of silence before auto-speak
                    </div>
                  </div>
                )}
              </div>
              {/* TTS Provider and voice dropdown */}
              <div>
                <label className="font-bold text-xs text-gray-700">{t("tts_provider")}</label>
                <select
                  value={ttslib}
                  className="w-full mt-1 border rounded px-2 py-1 bg-background"
                  onChange={e => setTtslib(e.target.value)}
                >
                  {/* Add open source/other alternatives */}
                  <option value="">None</option>
                  <option value="elevenlabs">ElevenLabs</option>
                  <option value="playht">PlayHT</option>
                  <option value="localllm">Local LLM</option>
                  <option value="openvoice">OpenVoice</option>
                  <option value="xtts">XTTS</option>
                  <option value="bark">Bark</option>
                  <option value="open-source-tts-1">Open Source TTS 1</option>
                  <option value="open-source-tts-2">Open Source TTS 2</option>
                </select>
              </div>
              {(ttslib && ttslib !== "") && (
                <>
                  <div>
                    <label className="font-bold text-xs text-gray-700">{t("tts_api_key")}</label>
                    <input
                      className="w-full mt-1 border rounded px-2 py-1 bg-background"
                      value={ttsKey}
                      type="password"
                      onChange={e => setTtsKey(e.target.value)}
                      placeholder="Your TTS API key"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-xs text-gray-700">{t("tts_voice")}</label>
                    <select
                      value={ttsVoice}
                      className="w-full mt-1 border rounded px-2 py-1 bg-background"
                      onChange={e => setTtsVoice(e.target.value)}
                    >
                      {TTS_VOICES[ttslib]?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {/* Example: Dynamic fallback */}
                      {!TTS_VOICES[ttslib]?.length && <option value="">Default</option>}
                    </select>
                  </div>
                </>
              )}
              {/* UI Language dropdown */}
              <div>
                <label className="font-bold text-xs text-gray-700">{t("ui_language")}</label>
                <select
                  value={locale}
                  className="w-full mt-1 border rounded px-2 py-1 bg-background"
                  onChange={e => setLocale(e.target.value as any)}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
                <span className="text-xs text-gray-400">{t("ui_language_help")}</span>
              </div>
              
              {/* Debug Window Toggle */}
              {process.env.NODE_ENV === "development" && (
                <div>
                  <label className="font-bold text-xs text-gray-700">Debug Window</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="showDebugWindow"
                      checked={showDebugWindow}
                      onChange={e => {
                        setShowDebugWindow?.(e.target.checked);
                        localStorage.setItem("debug_window_visible", e.target.checked.toString());
                      }}
                      className="rounded"
                    />
                    <label htmlFor="showDebugWindow" className="text-xs">Show debug window</label>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Shows debug information and test controls
                  </div>
                </div>
              )}
              
              {/* Move Save button to end */}
              <Button onClick={saveSettings} className="w-full" variant="default">{t("save")}</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* About icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 !rounded-full aspect-square"
              aria-label={t("about_app")}
              onClick={() => setAboutOpen(true)}
            >
              <Info size={22} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-white shadow-pill">
            {t("about_help")}
          </TooltipContent>
        </Tooltip>

        {/* Fullscreen icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 !rounded-full aspect-square"
              aria-label={t("fullscreen")}
              onClick={handleMaximize}
            >
              <Maximize size={22} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-800 text-white shadow-pill">
            {t("fullscreen_help")}
          </TooltipContent>
        </Tooltip>
      </nav>
      </TooltipProvider>
    </>
  );
};

// Wrap the whole nav in the I18nProvider so UI language is reactive:
const TranscriptNav: React.FC<TranscriptNavProps> = (props) => (
  <I18nProvider>
    <TranscriptNavInner {...props} />
  </I18nProvider>
);

export default TranscriptNav;
