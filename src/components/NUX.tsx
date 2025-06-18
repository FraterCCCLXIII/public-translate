import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { useI18n } from "@/hooks/useUITitleTranslation";
import { Github } from "lucide-react";

const APP_NAME = "Public:Translate";

const UI_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" }
];

interface NUXProps {
  onFinish: () => void;
  recording?: boolean;
  onMicClick?: () => void;
}

const NUXInner: React.FC<NUXProps> = ({ onFinish, recording }) => {
  // Detect and set initial language
  const browserLang = navigator.language?.slice(0, 2) || "en";
  const initialLang = UI_LANGUAGES.find(l => l.value === browserLang) ? browserLang : "en";
  const [lang, setLang] = useState(initialLang);
  const { t, setLocale } = useI18n();

  // Update I18nProvider locale when NUX language changes
  useEffect(() => {
    setLocale(lang as any);
  }, [lang, setLocale]);

  // If recording is activated, finish NUX immediately
  useEffect(() => {
    if (recording) {
      localStorage.setItem("ui_language", lang);
      localStorage.setItem("nux_complete", "1");
      onFinish();
    }
    // eslint-disable-next-line
  }, [recording]);

  // Set language on change
  useEffect(() => {
    localStorage.setItem("ui_language", lang);
  }, [lang]);

  const handleStart = () => {
    localStorage.setItem("ui_language", lang);
    localStorage.setItem("nux_complete", "1");
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center px-8 py-12 text-center">
        {/* App Logo with reduced weight */}
        <h1 className="font-bold text-3xl mb-4 tracking-tight text-neutral-800 dark:text-neutral-200">
          {APP_NAME}
        </h1>
        
        {/* App Explanation */}
        <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8 font-medium max-w-lg">
          {t("app_explanation")}
        </p>

        {/* Main Content Card */}
        <div className="w-full max-w-md bg-neutral-50 dark:bg-neutral-900 rounded-lg p-6 mb-8">
          {/* UI Language Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("ui_language_label")}
            </label>
            <Select value={lang} onValueChange={value => setLang(value)}>
              <SelectTrigger className="w-full">
                <SelectValue aria-label="UI Language">
                  {UI_LANGUAGES.find(l => l.value === lang)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[3000]">
                {UI_LANGUAGES.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {t("ui_language_help")}
            </p>
          </div>
        </div>

        {/* Start Button */}
        <Button 
          className="w-48 text-base py-3 font-medium" 
          onClick={handleStart}
        >
          {t("start_button")}
        </Button>

        {/* Footer with MIT License and GitHub */}
        <div className="mt-12 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <a 
            href="https://github.com/FraterCCCLXIII/public-translate/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
          <span>•</span>
          <a 
            href="https://opensource.org/licenses/MIT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            MIT License
          </a>
          <span className="text-xs text-gray-400 ml-2">ALPHA VERSION 1</span>
        </div>
      </div>
    </div>
  );
};

// Use global I18nProvider instead
const NUX: React.FC<NUXProps> = NUXInner;

export default NUX;

