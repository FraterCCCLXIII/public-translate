
import React, { useEffect, useRef, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import MicButton from "./MicButton";
import { Sun, Moon, Settings, Eye } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Dialog } from "@radix-ui/react-dialog";
import { saveAs } from "file-saver";

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
}

const LANGUAGES = [
  { value: "en", label: "English", alphabet: "latin" },
  { value: "ja", label: "Japanese", alphabet: "kana" },
  { value: "fr", label: "French", alphabet: "latin" },
  { value: "de", label: "German", alphabet: "latin" },
  { value: "es", label: "Spanish", alphabet: "latin" },
  { value: "zh", label: "Chinese", alphabet: "han" }
];

const pxPresets = [
  { value: 40, label: "40px" },
  { value: 56, label: "56px" },   // ~3.5rem
  { value: 68, label: "68px" },
  { value: 80, label: "80px" },
  { value: 96, label: "96px" },   // base present in tailwind 6xl
  { value: 112, label: "112px" },
  { value: 128, label: "128px" }
];

const TranscriptNav: React.FC<TranscriptNavProps> = ({
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
}) => {
  // Theme toggle
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
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!recording) return setVisible(true);
    const handle = () => {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 3000);
    };
    window.addEventListener("mousemove", handle);
    window.addEventListener("touchstart", handle);
    handle();
    return () => {
      window.removeEventListener("mousemove", handle);
      window.removeEventListener("touchstart", handle);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [recording]);
  const navRef = useRef<HTMLDivElement>(null);
  const handleMouseEnter = () => setVisible(true);

  // Settings modal (popover)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem("openai_api_key") || "");
  const [ttsProvider, setTtsProvider] = useState<string>(() => localStorage.getItem("tts_provider") || "");
  const [ttsKey, setTtsKey] = useState<string>(() => localStorage.getItem("tts_api_key") || "");

  const saveSettings = () => {
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("tts_provider", ttsProvider);
    localStorage.setItem("tts_api_key", ttsKey);
    setSettingsOpen(false);
  };

  // Font size slider popover display
  const [showFontSize, setShowFontSize] = useState(false);

  // Transcript dialog
  const [showTranscript, setShowTranscript] = useState(false);

  const handleDownload = () => {
    const content = `--- ${LANGUAGES.find(l => l.value === leftLang)?.label || leftLang} ---\n${transcript}\n\n--- ${LANGUAGES.find(l => l.value === rightLang)?.label || rightLang} ---\n${translation}\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "transcript.txt");
  };

  return (
    <>
      {/* Transcript Modal */}
      {showTranscript && (
        <Dialog open onOpenChange={setShowTranscript}>
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center">
            <div className="bg-white dark:bg-background w-full max-w-lg p-6 rounded-lg shadow-lg z-[101]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Full Transcript</h3>
                <Button variant="outline" size="sm" onClick={() => setShowTranscript(false)}>Close</Button>
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-xs mb-1">{LANGUAGES.find(l => l.value===leftLang)?.label || leftLang}</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 max-h-48 overflow-y-auto text-xs">{transcript}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs mb-1">{LANGUAGES.find(l => l.value===rightLang)?.label || rightLang}</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 max-h-48 overflow-y-auto text-xs">{translation}</div>
                </div>
              </div>
              <Button onClick={handleDownload} className="w-full mt-2" variant="default">Download</Button>
            </div>
          </div>
        </Dialog>
      )}

      <nav
        ref={navRef}
        className={`
          fixed z-50 left-0 right-0 bottom-0 mx-auto
          w-full max-w-2xl
          flex flex-row justify-center items-center
          space-x-3
          bg-white/90 dark:bg-background/90 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-4 py-2 backdrop-blur-xl
          transition-opacity duration-500
          ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          ${className}
        `}
        style={{ transition: "opacity 0.5s", marginBottom: "1rem" }}
        onMouseEnter={handleMouseEnter}
      >
        <MicButton
          recording={recording}
          onClick={onMicClick}
        />

        {/* Left Language Select */}
        <div className="relative flex items-center w-28">
          <Select value={leftLang} onValueChange={setLeftLang}>
            <SelectTrigger className="w-28">
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
            aria-label="Show/hide left"
            className="ml-1"
            onClick={() => setLeftVisible(!leftVisible)}
            tabIndex={-1}
          >
            <Eye size={18} className={`${leftVisible ? "opacity-100" : "opacity-30"}`} />
          </Button>
        </div>
        <span className="text-xs text-gray-400">→</span>
        {/* Right Language Select */}
        <div className="relative flex items-center w-28">
          <Select value={rightLang} onValueChange={setRightLang}>
            <SelectTrigger className="w-28">
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
            aria-label="Show/hide right"
            className="ml-1"
            onClick={() => setRightVisible(!rightVisible)}
            tabIndex={-1}
          >
            <Eye size={18} className={`${rightVisible ? "opacity-100" : "opacity-30"}`} />
          </Button>
        </div>

        {/* Font Size (px) Slider */}
        <Popover open={showFontSize} onOpenChange={setShowFontSize}>
          <PopoverTrigger asChild>
            <div
              className="flex items-center gap-2 ml-2 cursor-pointer select-none"
              onMouseEnter={() => setShowFontSize(true)}
              onMouseLeave={() => setShowFontSize(false)}
            >
              <span className="text-xs text-gray-500">A</span>
              <Slider
                min={32}
                max={128}
                step={1}
                value={[textSize]}
                onValueChange={([value]) => setTextSize(value)}
                className="w-32"
                aria-label="Text Size"
              />
              <span className="text-base font-bold text-gray-700" style={{ fontSize: '1.25em' }}>A</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-24 flex justify-center">
            <span className="font-mono text-lg">{textSize}px</span>
          </PopoverContent>
        </Popover>

        {/* Theme Switch */}
        <div className="flex items-center gap-1 ml-2">
          <Sun size={18} />
          <Switch
            checked={darkMode}
            onCheckedChange={() => setDarkMode((v) => !v)}
            aria-label="Toggle dark mode"
          />
          <Moon size={18} />
        </div>

        {/* Transcript Modal Button */}
        <Button
          variant="outline"
          className="ml-2"
          onClick={() => setShowTranscript(true)}
        >
          Transcript
        </Button>

        {/* Settings icon */}
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="ml-2"
              aria-label="Settings"
            >
              <Settings size={22} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-bold text-xs text-gray-700">OpenAI API key (translation)</label>
                <input
                  className="w-full mt-1 border rounded px-2 py-1 bg-background"
                  value={openaiKey}
                  type="password"
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="font-bold text-xs text-gray-700">TTS Provider</label>
                <select
                  value={ttsProvider}
                  className="w-full mt-1 border rounded px-2 py-1 bg-background"
                  onChange={e => setTtsProvider(e.target.value)}
                >
                  <option value="">None</option>
                  <option value="elevenlabs">ElevenLabs</option>
                  <option value="playht">PlayHT</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-xs text-gray-700">TTS API key</label>
                <input
                  className="w-full mt-1 border rounded px-2 py-1 bg-background"
                  value={ttsKey}
                  type="password"
                  onChange={e => setTtsKey(e.target.value)}
                  placeholder="Your TTS API key"
                />
              </div>
              <Button onClick={saveSettings} className="w-full" variant="default">Save</Button>
            </div>
          </PopoverContent>
        </Popover>
      </nav>
    </>
  );
};

export default TranscriptNav;
