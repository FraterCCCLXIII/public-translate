
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import MicButton from "./MicButton";
import { Sun, Moon } from "lucide-react";

interface TranscriptNavProps {
  className?: string;
  recording: boolean;
  onMicClick: () => void;
  textSize: number;
  setTextSize: (n: number) => void;
}

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
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <nav
      className={`
        flex flex-row items-center gap-3 bg-white/90 dark:bg-background/90 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full px-4 py-2
        backdrop-blur-xl
        ${className}
      `}
    >
      {/* Language From */}
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

      {/* Language To */}
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

      {/* Text Size */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-xs text-gray-500">A</span>
        <Slider
          min={5}
          max={9}
          step={1}
          value={[textSize]}
          onValueChange={([value]) => setTextSize(value)}
          className="w-24"
          aria-label="Text Size"
        />
        <span className="text-base font-bold text-gray-700" style={{ fontSize: '1.25em' }}>A</span>
      </div>

      {/* Theme Switch */}
      <div className="flex items-center gap-1 ml-3">
        <Sun size={18} />
        <Switch
          checked={darkMode}
          onCheckedChange={() => setDarkMode((v) => !v)}
          aria-label="Toggle dark mode"
        />
        <Moon size={18} />
      </div>

      {/* Mic Button */}
      <MicButton
        recording={recording}
        onClick={onMicClick}
      />
    </nav>
  );
};

export default TranscriptNav;

