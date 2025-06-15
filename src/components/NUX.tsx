
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";

const APP_NAME = "Public:Translate";
const APP_EXPLANATION = "Public:Translate turns speech into side-by-side bilingual transcripts in real time. Set it up in seconds, and start transcribing or translating instantly.";

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
    explanation: APP_EXPLANATION,
    showAppName: true,
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

interface NUXProps {
  onFinish: () => void;
  recording?: boolean;
  onMicClick?: () => void;
}

const NUX: React.FC<NUXProps> = ({ onFinish, recording }) => {
  // Detect and set initial language
  const browserLang = navigator.language?.slice(0, 2) || "en";
  const initialLang = UI_LANGUAGES.find(l => l.value === browserLang) ? browserLang : "en";
  const [stepIdx, setStepIdx] = useState(0);
  const [lang, setLang] = useState(initialLang);
  const [fade, setFade] = useState(true);

  // If recording is activated, finish NUX immediately
  useEffect(() => {
    if (recording) {
      localStorage.setItem("ui_language", lang);
      localStorage.setItem("nux_complete", "1");
      onFinish();
    }
    // eslint-disable-next-line
  }, [recording]);

  useEffect(() => {
    setFade(true);
  }, [stepIdx]);

  // Next button logic
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

  // Set language on change
  useEffect(() => {
    localStorage.setItem("ui_language", lang);
  }, [lang]);

  const step = steps[stepIdx];

  return (
    <div className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-white dark:bg-black ${fadeClass} ${fade ? "opacity-100" : "opacity-0"}`}>
      <div className="w-full max-w-md flex flex-col items-center px-6 py-10 text-center">
        {step.showAppName && (
          <>
            <h1 className="font-black text-4xl mb-2 tracking-tight">{APP_NAME}</h1>
            <p className="text-base text-neutral-500 dark:text-neutral-300 mb-6 font-medium">{step.explanation}</p>
          </>
        )}
        <div className="mb-8">
          <div className="font-bold text-2xl mb-4">{step.title}</div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{step.content}</p>
          {step.component === "lang" && (
            <Select value={lang} onValueChange={value => setLang(value)}>
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
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${idx === stepIdx ? "bg-neutral-800 dark:bg-neutral-100 w-4" : "bg-neutral-300 dark:bg-neutral-800 opacity-60 w-2"}`}
              aria-label={idx === stepIdx ? "Current step" : "Step"}
            />
          ))}
        </div>

        <Button className="mt-4 w-36 mx-auto text-base py-2" onClick={handleNext}>
          {stepIdx === steps.length - 1 ? "Start Using" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default NUX;

