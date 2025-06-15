
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * Example xml file path: /src/assets/i18n.ui.xml
 * 
 * <?xml version="1.0" encoding="utf-8"?>
 * <translations>
 *   <language code="en">
 *     <key id="mic_button">Start or stop recording</key>
 *     <key id="from_language">From language</key>
 *     <key id="to_language">To language</key>
 *     ...
 *   </language>
 *   <language code="fr">
 *     <key id="mic_button">Démarrer ou arrêter l'enregistrement</key>
 *     ...
 *   </language>
 * </translations>
 */

// In a real system, you would fetch or import this. We'll mock for now.
const demoStrings = {
  en: {
    mic_button: "Start or stop recording",
    from_language: "From language",
    to_language: "To language",
    font_size: "Text font size",
    font_size_help: "Adjust the display text size",
    theme_toggle: "Theme toggle",
    transcript: "Transcript",
    transcript_help: "Open and download the full transcript history",
    settings: "Settings",
    about_app: "About this app",
    fullscreen: "Fullscreen",
    hide_left_panel: "Show or hide left panel",
    hide_right_panel: "Show or hide right panel",
    mic_button_label: "Start or stop recording",
    from_language_help: "Primary recording/input language",
    to_language_help: "Translation/output language",
    font_size_slider: "Text Size slider",
    toggle_dark_mode: "Toggle dark mode",
    view_full_transcript: "View full transcript",
    ui_language: "UI Language",
    ui_language_help: "Sets the user interface language",
    theme_toggle_help: "Switch between light and dark mode",
    about_help: "Learn about this app and credits",
    fullscreen_help: "Toggle fullscreen mode",
    save: "Save",
    llm_provider: "AI Model Provider",
    openai_api_key: "OpenAI API key",
    claude_api_key: "Claude API key",
    deepseek_api_key: "Deepseek API key",
    local_llm_url: "Local LLM URL",
    proxy_url: "Proxy URL / Key (if needed)",
    tts_provider: "TTS Provider",
    tts_api_key: "TTS API key",
    tts_voice: "Voice",
    // Add more keys as needed
  },
  fr: {
    mic_button: "Démarrer ou arrêter l'enregistrement",
    from_language: "Langue source",
    to_language: "Langue cible",
    font_size: "Taille du texte",
    font_size_help: "Réglez la taille du texte affiché",
    theme_toggle: "Thème",
    transcript: "Transcription",
    transcript_help: "Ouvrir et télécharger l'historique de transcription",
    settings: "Paramètres",
    about_app: "À propos",
    fullscreen: "Plein écran",
    hide_left_panel: "Afficher/masquer panneau gauche",
    hide_right_panel: "Afficher/masquer panneau droit",
    mic_button_label: "Démarrer ou arrêter l'enregistrement",
    from_language_help: "Langue principale d'entrée",
    to_language_help: "Langue de traduction/sortie",
    font_size_slider: "Curseur de taille de texte",
    toggle_dark_mode: "Mode sombre/clair",
    view_full_transcript: "Voir la transcription complète",
    ui_language: "Langue de l'interface",
    ui_language_help: "Définit la langue de l'interface",
    theme_toggle_help: "Basculer entre le mode clair et sombre",
    about_help: "À propos de cette application",
    fullscreen_help: "Activer ou désactiver le plein écran",
    save: "Enregistrer",
    llm_provider: "Fournisseur IA",
    openai_api_key: "Clé API OpenAI",
    claude_api_key: "Clé API Claude",
    deepseek_api_key: "Clé API Deepseek",
    local_llm_url: "URL LLM locale",
    proxy_url: "URL/clée Proxy (si nécessaire)",
    tts_provider: "Fournisseur TTS",
    tts_api_key: "Clé API TTS",
    tts_voice: "Voix",
    // Add more keys as needed
  },
};

type Locale = "en" | "fr"; // expand as needed

type StringsType = typeof demoStrings.en;

interface I18nContextType {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  t: (key: keyof StringsType, fallback?: string) => string;
  strings: StringsType;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key, fallback) => fallback || key,
  strings: demoStrings.en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem("ui_language");
    return (stored as Locale) || "en";
  });

  const t = (key: keyof StringsType, fallback?: string) =>
    demoStrings[locale]?.[key] || fallback || demoStrings.en[key] || key;

  useEffect(() => {
    localStorage.setItem("ui_language", locale);
  }, [locale]);

  const strings = demoStrings[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, strings }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
