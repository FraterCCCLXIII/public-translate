
import React, { useEffect, useRef, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import MicButton from "./MicButton";
import { Sun, Moon, Settings } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TranscriptNavProps {
  className?: string;
  recording: boolean;
  onMicClick: () => void;
  textSize: number;
  setTextSize: (n: number) => void;
}

const FONT_SIZES = [
  { value: 4, label: "2xl" },
  { value: 5, label: "3xl" },
  { value: 6, label: "4xl" },
  { value: 7, label: "5xl" },
  { value: 8, label: "6xl" },
  { value: 9, label: "7xl" },
  { value: 10, label: "8xl" },
  { value: 11, label: "9xl" },
];

const TranscriptNav: React.FC<TranscriptNavProps> = ({
  className = "",
  recording,
  onMicClick,
  textSize,
  setTextSize,
}) => {
  // Theme toggle using shadcn pattern
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
    if (!recording) return setVisible(true); // show if not recording
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
  // Always show when user hovers the nav
  const navRef = useRef<HTMLDivElement>(null);
  const handleMouseEnter = () => setVisible(true);

  // Settings modal (popover)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem("openai_api_key") || "");
  const [ttsProvider, setTtsProvider] = useState<string>(() => localStorage.getItem("tts_provider") || "");
  const [ttsKey, setTtsKey] = useState<string>(() => localStorage.getItem("tts_api_key") || "");

  // Save keys to localStorage
  const saveSettings = () => {
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("tts_provider", ttsProvider);
    localStorage.setItem("tts_api_key", ttsKey);
    setSettingsOpen(false);
  };

  // Font size slider popover display
  const [showFontSize, setShowFontSize] = useState(false);

  return (
    <>
      <nav
        ref={navRef}
        className={`
          fixed z-50
          left-0 right-0 bottom-0 mx-auto
          w-full max-w-2xl
          flex flex-row justify-center items-center
          space-x-3
          bg-white/90 dark:bg-background/90 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-4 py-2 backdrop-blur-xl
          transition-opacity duration-500
          ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          ${className}
        `}
        style={{ transition: "opacity 0.5s" }}
        onMouseEnter={handleMouseEnter}
      >
        {/* Mic button to left */}
        <MicButton
          recording={recording}
          onClick={onMicClick}
        />

        {/* Language Selects */}
        <Select defaultValue="en">
          <SelectTrigger className="w-28">
            <SelectValue aria-label="From language">English</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400">→</span>
        <Select defaultValue="ja">
          <SelectTrigger className="w-28">
            <SelectValue aria-label="To language">Japanese</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ja">Japanese</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size Slider with popover */}
        <Popover open={showFontSize} onOpenChange={setShowFontSize}>
          <PopoverTrigger asChild>
            <div
              className="flex items-center gap-2 ml-2 cursor-pointer select-none"
              onMouseEnter={() => setShowFontSize(true)}
              onMouseLeave={() => setShowFontSize(false)}
            >
              <span className="text-xs text-gray-500">A</span>
              <Slider
                min={4}
                max={11}
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
            <span className="font-mono text-lg">{FONT_SIZES.find(x=>x.value===textSize)?.label || textSize+"xl"}</span>
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
