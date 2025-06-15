import React, { useEffect, useRef, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import MicButton from "./MicButton";
import { Sun, Moon, Settings, Eye, Info, Maximize } from "lucide-react";
import { page } from "lucide-react"; // FIXED: import the lowercase 'page'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Dialog } from "@radix-ui/react-dialog";
import { saveAs } from "file-saver";
import AboutModal from "./AboutModal";
import { useTranslation } from "@/hooks/useTranslation";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider, useI18n } from "@/hooks/useUITitleTranslation";

// Dummy translation XML replacement
const t = (key: string, defaultVal: string) => defaultVal; // Replace with real t() function

const LANGUAGES = [
  { value: "en", label: "English", alphabet: "latin" },
  { value: "ja", label: "Japanese", alphabet: "kana" },
  { value: "fr", label: "French", alphabet: "latin" },
  { value: "de", label: "German", alphabet: "latin" },
  { value: "es", label: "Spanish", alphabet: "latin" },
  { value: "zh", label: "Chinese", alphabet: "han" }
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
}

// Small render helper for Lucide iconNode icon
function PageIcon(props: React.SVGProps<SVGSVGElement>) {
  // Lucide exports the icon node as [string, props][]
  // We replicate the internal structure for rendering:
  return React.createElement(
    "svg",
    { width: 20, height: 20, fill: "none", stroke: "currentColor", ...props, viewBox: "0 0 24 24" },
    page[1].map(([tag, attrs], i) =>
      React.createElement(tag, { key: i, ...attrs })
    )
  );
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
  useEffect(() => {
    if (!recording) {
      setVisible(true);
      setNavVisible?.(true);
      return;
    }
    const handle = () => {
      setVisible(true);
      setNavVisible?.(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setNavVisible?.(false);
      }, 3000);
    };
    window.addEventListener("mousemove", handle);
    window.addEventListener("touchstart", handle);
    handle();
    return () => {
      window.removeEventListener("mousemove", handle);
      window.removeEventListener("touchstart", handle);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [recording, setNavVisible]);
  const navRef = useRef<HTMLDivElement>(null);
  const handleMouseEnter = () => {
    setVisible(true);
    setNavVisible?.(true);
  };

  // About Modal state
  const [aboutOpen, setAboutOpen] = useState(false);

  // Settings & language picker state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uiLanguage, setUiLanguage] = useState<string>(() => localStorage.getItem("ui_language") || "en");

  // Settings modal (popover)
  const [llmProvider, setLlmProvider] = useState<string>(() => localStorage.getItem("llm_provider") || "openai");
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

  //

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
                  <h4 className="font-semibold text-xs mb-1">{LANGUAGES.find(l => l.value===leftLang)?.label || leftLang}</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 max-h-full flex-1 overflow-y-auto text-xs">{transcript}</div>
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <h4 className="font-semibold text-xs mb-1">{LANGUAGES.find(l => l.value===rightLang)?.label || rightLang}</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 max-h-full flex-1 overflow-y-auto text-xs">{translation}</div>
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
          space-x-3
          bg-white/90 dark:bg-background/90 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-4 py-2 backdrop-blur-xl
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
          minWidth: 0,
          maxHeight: "calc(100vh - 2rem)",
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
            <div className="relative flex items-center w-28">
              <Select value={leftLang} onValueChange={setLeftLang}>
                <SelectTrigger className="w-28" aria-label={t("from_language")}>
                  <SelectValue aria-label="From language">
                    {LANGUAGES.find(l=>l.value===leftLang)?.label || leftLang}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("hide_left_panel")}
                className="ml-1"
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
            <div className="relative flex items-center w-28">
              <Select value={rightLang} onValueChange={setRightLang}>
                <SelectTrigger className="w-28" aria-label={t("to_language")}>
                  <SelectValue aria-label="To language">
                    {LANGUAGES.find(l=>l.value===rightLang)?.label || rightLang}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("hide_right_panel")}
                className="ml-1"
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
        
        {/* Transcript Button with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => setShowTranscript(true)}
              aria-label={t("view_full_transcript")}
            >
              <PageIcon /> {/* FIXED: Use the proper Page icon */}
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
              className="ml-2"
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
              {/* Move Save button to end */}
              <Button onClick={saveSettings} className="w-full" variant="default">{t("save")}</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Info icon with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1"
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

        {/* Maximize/fullscreen with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
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
