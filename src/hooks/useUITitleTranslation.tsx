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
    from_language: "From Language",
    to_language: "To Language",
    font_size: "Text Font Size",
    font_size_help: "Adjust displayed text size",
    theme_toggle: "Theme Toggle",
    transcript: "Transcript",
    transcript_help: "Open and download complete transcript history",
    settings: "Settings",
    about_app: "About this app",
    fullscreen: "Fullscreen",
    hide_left_panel: "Show/Hide Left Panel",
    hide_right_panel: "Show/Hide Right Panel",
    mic_button_label: "Start or stop recording",
    from_language_help: "Primary recording/input language",
    to_language_help: "Translation/output language",
    font_size_slider: "Text Size Slider",
    toggle_dark_mode: "Toggle dark mode",
    view_full_transcript: "View full transcript",
    ui_language: "UI Language",
    ui_language_help: "Language auto-detected, but you can pick another.",
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
    // NUX translations
    app_explanation: "Public:Translate turns speech into side-by-side bilingual transcripts in real time. Set it up in seconds, and start transcribing or translating instantly.",
    ui_language_label: "UI Language",
    start_button: "Start Using",
    next_button: "Next",
    auto_speak: "Auto Speak",
    silence_timeout: "Silence Timeout",
    debug_window: "Debug Window"
  },
  ja: {
    mic_button: "録音を開始または停止",
    from_language: "元の言語",
    to_language: "翻訳先言語",
    font_size: "テキストフォントサイズ",
    font_size_help: "表示テキストサイズを調整",
    theme_toggle: "テーマ切り替え",
    transcript: "文字起こし",
    transcript_help: "完全な文字起こし履歴を開いてダウンロード",
    settings: "設定",
    about_app: "このアプリについて",
    fullscreen: "全画面表示",
    hide_left_panel: "左パネルの表示/非表示",
    hide_right_panel: "右パネルの表示/非表示",
    mic_button_label: "録音を開始または停止",
    from_language_help: "主要な録音/入力言語",
    to_language_help: "翻訳/出力言語",
    font_size_slider: "テキストサイズスライダー",
    toggle_dark_mode: "ダークモード切り替え",
    view_full_transcript: "完全な文字起こしを表示",
    ui_language: "UI言語",
    ui_language_help: "言語は自動検出されますが、別の言語を選択することもできます。",
    theme_toggle_help: "ライトモードとダークモードを切り替え",
    about_help: "このアプリとクレジットについて学ぶ",
    fullscreen_help: "全画面表示モードを切り替え",
    save: "保存",
    llm_provider: "AIモデルプロバイダー",
    openai_api_key: "OpenAI APIキー",
    claude_api_key: "Claude APIキー",
    deepseek_api_key: "Deepseek APIキー",
    local_llm_url: "ローカルLLM URL",
    proxy_url: "プロキシURL / キー（必要に応じて）",
    tts_provider: "TTSプロバイダー",
    tts_api_key: "TTS APIキー",
    tts_voice: "音声",
    // NUX translations
    app_explanation: "Public:Translateは音声をリアルタイムでバイリンガル字幕に変換します。数秒でセットアップし、すぐに文字起こしや翻訳を開始できます。",
    ui_language_label: "UI言語",
    start_button: "使用開始",
    next_button: "次へ",
    auto_speak: "自動音声",
    silence_timeout: "サイレンスタイムアウト",
    debug_window: "デバッグウィンドウ"
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
    ui_language_help: "Langue détectée automatiquement, mais vous pouvez en choisir une autre.",
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
    // NUX translations
    app_explanation: "Public:Translate transforme la parole en transcriptions bilingues côte à côte en temps réel. Configurez-le en quelques secondes et commencez à transcrire ou traduire instantanément.",
    ui_language_label: "Langue de l'interface",
    start_button: "Commencer",
    next_button: "Suivant",
    auto_speak: "Parole automatique",
    silence_timeout: "Délai d'attente silencieuse",
    debug_window: "Fenêtre de débogage"
  },
  de: {
    mic_button: "Aufnahme starten oder stoppen",
    from_language: "Quellsprache",
    to_language: "Zielsprache",
    font_size: "Textschriftgröße",
    font_size_help: "Anzeigetextgröße anpassen",
    theme_toggle: "Themenwechsel",
    transcript: "Transkript",
    transcript_help: "Vollständige Transkriptionshistorie öffnen und herunterladen",
    settings: "Einstellungen",
    about_app: "Über diese App",
    fullscreen: "Vollbild",
    hide_left_panel: "Linkes Panel anzeigen/verstecken",
    hide_right_panel: "Rechtes Panel anzeigen/verstecken",
    mic_button_label: "Aufnahme starten oder stoppen",
    from_language_help: "Primäre Aufnahme-/Eingabesprache",
    to_language_help: "Übersetzungs-/Ausgabesprache",
    font_size_slider: "Textgröße-Schieberegler",
    toggle_dark_mode: "Dunkelmodus umschalten",
    view_full_transcript: "Vollständiges Transkript anzeigen",
    ui_language: "UI-Sprache",
    ui_language_help: "Sprache automatisch erkannt, aber Sie können eine andere wählen.",
    theme_toggle_help: "Zwischen hellem und dunklem Modus wechseln",
    about_help: "Erfahren Sie mehr über diese App und Credits",
    fullscreen_help: "Vollbildmodus umschalten",
    save: "Speichern",
    llm_provider: "KI-Modellanbieter",
    openai_api_key: "OpenAI API-Schlüssel",
    claude_api_key: "Claude API-Schlüssel",
    deepseek_api_key: "Deepseek API-Schlüssel",
    local_llm_url: "Lokale LLM-URL",
    proxy_url: "Proxy-URL / Schlüssel (falls erforderlich)",
    tts_provider: "TTS-Anbieter",
    tts_api_key: "TTS API-Schlüssel",
    tts_voice: "Stimme",
    // NUX translations
    app_explanation: "Public:Translate verwandelt Sprache in Echtzeit in zweisprachige Transkripte nebeneinander. Richten Sie es in Sekunden ein und beginnen Sie sofort mit der Transkription oder Übersetzung.",
    ui_language_label: "UI-Sprache",
    start_button: "Loslegen",
    next_button: "Weiter",
    auto_speak: "Automatisches Sprechen",
    silence_timeout: "Stille Timeout",
    debug_window: "Debug Fenster"
  },
  es: {
    mic_button: "Iniciar o detener grabación",
    from_language: "Idioma de origen",
    to_language: "Idioma de destino",
    font_size: "Tamaño de fuente del texto",
    font_size_help: "Ajustar el tamaño del texto mostrado",
    theme_toggle: "Cambio de tema",
    transcript: "Transcripción",
    transcript_help: "Abrir y descargar el historial completo de transcripción",
    settings: "Configuración",
    about_app: "Acerca de",
    fullscreen: "Pantalla completa",
    hide_left_panel: "Mostrar/ocultar panel izquierdo",
    hide_right_panel: "Mostrar/ocultar panel derecho",
    mic_button_label: "Iniciar o detener grabación",
    from_language_help: "Idioma principal de entrada/grabación",
    to_language_help: "Idioma de traducción/salida",
    font_size_slider: "Control deslizante de tamaño de texto",
    toggle_dark_mode: "Alternar modo oscuro",
    view_full_transcript: "Ver transcripción completa",
    ui_language: "Idioma de la interfaz",
    ui_language_help: "Idioma detectado automáticamente, pero puedes elegir otro.",
    theme_toggle_help: "Alternar entre modo claro y oscuro",
    about_help: "Aprende sobre esta aplicación y créditos",
    fullscreen_help: "Alternar modo de pantalla completa",
    save: "Guardar",
    llm_provider: "Proveedor de modelo IA",
    openai_api_key: "Clave API de OpenAI",
    claude_api_key: "Clave API de Claude",
    deepseek_api_key: "Clave API de Deepseek",
    local_llm_url: "URL de LLM local",
    proxy_url: "URL/Clave proxy (si es necesario)",
    tts_provider: "Proveedor TTS",
    tts_api_key: "Clave API TTS",
    tts_voice: "Voz",
    // NUX translations
    app_explanation: "Public:Translate convierte el habla en transcripciones bilingües lado a lado en tiempo real. Configúralo en segundos y comienza a transcribir o traducir instantáneamente.",
    ui_language_label: "Idioma de la interfaz",
    start_button: "Comenzar",
    next_button: "Siguiente",
    auto_speak: "Hablar automáticamente",
    silence_timeout: "Tiempo de silencio",
    debug_window: "Ventana de depuración",
    about_help: "Aprende sobre esta aplicación y créditos",
    fullscreen_help: "Alternar modo de pantalla completa",
    theme_toggle_help: "Alternar entre modo claro y oscuro",
    ui_language: "Idioma de la interfaz",
    ui_language_help: "Idioma detectado automáticamente, pero puedes elegir otro.",
    save: "Guardar",
    tts_provider: "Proveedor TTS",
    tts_api_key: "Clave API TTS",
    tts_voice: "Voz"
  },
  zh: {
    mic_button: "开始或停止录音",
    from_language: "源语言",
    to_language: "目标语言",
    font_size: "文本字体大小",
    font_size_help: "调整显示文本大小",
    theme_toggle: "主题切换",
    transcript: "转录",
    transcript_help: "打开并下载完整的转录历史",
    settings: "设置",
    about_app: "关于此应用",
    fullscreen: "全屏",
    hide_left_panel: "显示或隐藏左面板",
    hide_right_panel: "显示或隐藏右面板",
    mic_button_label: "开始或停止录音",
    from_language_help: "主要录音/输入语言",
    to_language_help: "翻译/输出语言",
    font_size_slider: "文本大小滑块",
    toggle_dark_mode: "切换深色模式",
    view_full_transcript: "查看完整转录",
    ui_language: "界面语言",
    ui_language_help: "语言自动检测，但您可以选择其他语言。",
    theme_toggle_help: "在浅色和深色模式之间切换",
    about_help: "了解此应用和致谢",
    fullscreen_help: "切换全屏模式",
    save: "保存",
    llm_provider: "AI模型提供商",
    openai_api_key: "OpenAI API密钥",
    claude_api_key: "Claude API密钥",
    deepseek_api_key: "Deepseek API密钥",
    local_llm_url: "本地LLM URL",
    proxy_url: "代理URL / 密钥（如需要）",
    tts_provider: "TTS提供商",
    tts_api_key: "TTS API密钥",
    tts_voice: "语音",
    // NUX translations
    app_explanation: "Public:Translate将语音实时转换为并排的双语转录。几秒钟内设置完成，立即开始转录或翻译。",
    ui_language_label: "界面语言",
    start_button: "开始使用",
    next_button: "下一步",
    auto_speak: "自动语音",
    silence_timeout: "静音超时",
    debug_window: "调试窗口",
    about_help: "了解此应用和致谢",
    fullscreen_help: "切换全屏模式",
    theme_toggle_help: "在浅色和深色模式之间切换",
    ui_language: "界面语言",
    ui_language_help: "语言自动检测，但您可以选择其他语言。",
    save: "保存",
    tts_provider: "TTS提供商",
    tts_api_key: "TTS API密钥",
    tts_voice: "语音"
  }
};

type Locale = "en" | "ja" | "fr" | "de" | "es" | "zh";

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
