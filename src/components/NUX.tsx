
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";

const UI_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" }
];

const steps = [
  {
    title: "Welcome!",
    content: "Let's set up your experience.",
  },
  {
    title: "Choose UI Language",
    content: "Language auto-detected, but you can pick another.",
    component: "lang",
  },
  {
    title: "Ready to Go!",
    content: "All defaults are set. You can switch these later in Settings.",
    component: "summary",
  },
];

const fadeClass = "transition-opacity duration-500 ease-in-out";

const NUX: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  // Try to auto-detect browser language
  const browserLang = navigator.language?.slice(0,2) || "en";
  const initialLang = UI_LANGUAGES.find(l => l.value === browserLang) ? browserLang : "en";
  const [stepIdx, setStepIdx] = useState(0);
  const [lang, setLang] = useState(initialLang);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(true);
  }, [stepIdx]);

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      if (stepIdx === steps.length - 1) {
        localStorage.setItem("ui_language", lang);
        onFinish();
      } else {
        setStepIdx(stepIdx + 1);
      }
      setFade(true);
    }, 400);
  };

  const step = steps[stepIdx];
  return (
    <div className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-white dark:bg-black ${fadeClass} ${fade ? "opacity-100" : "opacity-0"}`}>
      <div className="rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-md w-full p-8 flex flex-col items-center text-center">
        <h1 className="font-bold text-3xl mb-8 animate-fade-in">{step.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 animate-fade-in">{step.content}</p>
        {step.component === "lang" && (
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-48 mx-auto">
              <SelectValue aria-label="UI Language">
                {UI_LANGUAGES.find(l => l.value === lang)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {UI_LANGUAGES.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button className="mt-8 w-32 mx-auto" onClick={handleNext}>
          {stepIdx === steps.length - 1 ? "Start Using" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default NUX;
