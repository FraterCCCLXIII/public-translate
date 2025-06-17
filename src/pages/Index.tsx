import React, { useState, useEffect, useRef } from "react";
import TranscriptNav from "@/components/TranscriptNav";
import NUX from "@/components/NUX";
import TranscriptPanel from "@/components/TranscriptPanel";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useTranslation } from "@/hooks/useTranslation";
import { useAutoPlayOnSilence } from "@/hooks/useAutoPlayOnSilence";
import { saveAs } from 'file-saver';

// Language metadata
const LANGUAGES = [
  // Major World Languages
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "ur", label: "Urdu" },
  { value: "tr", label: "Turkish" },
  { value: "th", label: "Thai" },
  { value: "vi", label: "Vietnamese" },
  { value: "id", label: "Indonesian" },
  { value: "ms", label: "Malay" },
  { value: "fa", label: "Persian" },
  { value: "he", label: "Hebrew" },
  { value: "pl", label: "Polish" },
  { value: "nl", label: "Dutch" },
  { value: "sv", label: "Swedish" },
  { value: "da", label: "Danish" },
  { value: "no", label: "Norwegian" },
  { value: "fi", label: "Finnish" },
  { value: "cs", label: "Czech" },
  { value: "sk", label: "Slovak" },
  { value: "hu", label: "Hungarian" },
  { value: "ro", label: "Romanian" },
  { value: "bg", label: "Bulgarian" },
  { value: "hr", label: "Croatian" },
  { value: "sr", label: "Serbian" },
  { value: "sl", label: "Slovenian" },
  { value: "et", label: "Estonian" },
  { value: "lv", label: "Latvian" },
  { value: "lt", label: "Lithuanian" },
  { value: "el", label: "Greek" },
  { value: "mt", label: "Maltese" },
  { value: "ga", label: "Irish" },
  { value: "cy", label: "Welsh" },
  { value: "is", label: "Icelandic" },
  { value: "ca", label: "Catalan" },
  { value: "eu", label: "Basque" },
  { value: "gl", label: "Galician" },
  { value: "af", label: "Afrikaans" },
  { value: "sw", label: "Swahili" },
  { value: "am", label: "Amharic" },
  { value: "yo", label: "Yoruba" },
  { value: "ig", label: "Igbo" },
  { value: "zu", label: "Zulu" },
  { value: "xh", label: "Xhosa" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "gu", label: "Gujarati" },
  { value: "pa", label: "Punjabi" },
  { value: "mr", label: "Marathi" },
  { value: "or", label: "Odia" },
  { value: "as", label: "Assamese" },
  { value: "ne", label: "Nepali" },
  { value: "si", label: "Sinhala" },
  { value: "my", label: "Burmese" },
  { value: "km", label: "Khmer" },
  { value: "lo", label: "Lao" },
  { value: "mn", label: "Mongolian" },
  { value: "ka", label: "Georgian" },
  { value: "hy", label: "Armenian" },
  { value: "az", label: "Azerbaijani" },
  { value: "kk", label: "Kazakh" },
  { value: "ky", label: "Kyrgyz" },
  { value: "uz", label: "Uzbek" },
  { value: "tg", label: "Tajik" },
  { value: "tk", label: "Turkmen" },
  { value: "ps", label: "Pashto" },
  { value: "ku", label: "Kurdish" },
  { value: "sd", label: "Sindhi" },
  { value: "bo", label: "Tibetan" },
  { value: "dz", label: "Dzongkha" },
  { value: "mk", label: "Macedonian" },
  { value: "sq", label: "Albanian" },
  { value: "be", label: "Belarusian" },
  { value: "uk", label: "Ukrainian" },
  { value: "bs", label: "Bosnian" },
  { value: "me", label: "Montenegrin" },
  { value: "fy", label: "Frisian" },
  { value: "lb", label: "Luxembourgish" },
  { value: "rm", label: "Romansh" },
  { value: "fo", label: "Faroese" },
  { value: "sm", label: "Samoan" },
  { value: "to", label: "Tongan" },
  { value: "fj", label: "Fijian" },
  { value: "haw", label: "Hawaiian" },
  { value: "mi", label: "Maori" },
  { value: "qu", label: "Quechua" },
  { value: "ay", label: "Aymara" },
  { value: "gn", label: "Guarani" },
  { value: "ht", label: "Haitian Creole" },
  { value: "jmc", label: "Machame" },
  { value: "sn", label: "Shona" },
  { value: "st", label: "Southern Sotho" },
  { value: "tn", label: "Tswana" },
  { value: "ve", label: "Venda" },
  { value: "ts", label: "Tsonga" },
  { value: "ss", label: "Swati" },
  { value: "nr", label: "Southern Ndebele" },
  { value: "nd", label: "Northern Ndebele" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "ak", label: "Akan" },
  { value: "tw", label: "Twi" },
  { value: "ee", label: "Ewe" },
  { value: "fon", label: "Fon" },
  { value: "ha", label: "Hausa" },
  { value: "ff", label: "Fulah" },
  { value: "wo", label: "Wolof" },
  { value: "dyo", label: "Jola-Fonyi" },
  { value: "bem", label: "Bemba" },
  { value: "ny", label: "Chichewa" },
  { value: "byn", label: "Blin" },
  { value: "ti", label: "Tigrinya" },
  { value: "so", label: "Somali" },
  { value: "om", label: "Oromo" },
  { value: "gsw", label: "Swiss German" },
  { value: "fur", label: "Friulian" },
  { value: "lld", label: "Ladin" },
  { value: "vec", label: "Venetian" },
  { value: "sc", label: "Sardinian" },
  { value: "co", label: "Corsican" },
  { value: "oc", label: "Occitan" },
  { value: "an", label: "Aragonese" },
  { value: "ast", label: "Asturian" },
  { value: "ext", label: "Extremaduran" },
  { value: "lad", label: "Ladino" },
  { value: "wa", label: "Walloon" },
  { value: "pcd", label: "Picard" },
  { value: "nrf", label: "Guernésiais" },
  { value: "jèr", label: "Jèrriais" },
  { value: "sco", label: "Scots" },
  { value: "gd", label: "Scottish Gaelic" },
  { value: "kw", label: "Cornish" },
  { value: "br", label: "Breton" },
  { value: "gv", label: "Manx" },
];

// Helper function to get language family
const getLanguageFamily = (langCode: string): string => {
  const languageFamilies: { [key: string]: string[] } = {
    'germanic': ['en', 'de', 'nl', 'sv', 'da', 'no', 'is', 'af', 'fy', 'lb'],
    'romance': ['es', 'fr', 'it', 'pt', 'ca', 'gl', 'oc', 'an', 'ast', 'ext', 'lad', 'wa', 'pcd', 'nrf', 'jèr', 'co', 'rm', 'fur', 'lld', 'vec', 'sc'],
    'slavic': ['ru', 'pl', 'cs', 'sk', 'bg', 'hr', 'sr', 'sl', 'uk', 'be', 'bs', 'me', 'mk', 'sq'],
    'baltic': ['lt', 'lv', 'et'],
    'finnic': ['fi', 'et'],
    'celtic': ['ga', 'cy', 'kw', 'br', 'gv', 'gd', 'sco'],
    'semitic': ['ar', 'he', 'fa', 'ur', 'ps', 'ku', 'sd', 'so', 'am', 'ti', 'byn'],
    'indo-aryan': ['hi', 'bn', 'ur', 'ta', 'te', 'kn', 'ml', 'gu', 'pa', 'mr', 'or', 'as', 'ne', 'si', 'my', 'km', 'lo', 'bo', 'dz'],
    'turkic': ['tr', 'az', 'kk', 'ky', 'uz', 'tg', 'tk'],
    'mongolic': ['mn'],
    'caucasian': ['ka', 'hy'],
    'austronesian': ['id', 'ms', 'sm', 'to', 'fj', 'haw', 'mi'],
    'african': ['sw', 'yo', 'ig', 'zu', 'xh', 'sn', 'st', 'tn', 've', 'ts', 'ss', 'nr', 'nd', 'rw', 'ak', 'tw', 'ee', 'fon', 'ha', 'ff', 'wo', 'dyo', 'bem', 'ny'],
    'sino-tibetan': ['zh', 'bo', 'dz'],
    'japonic': ['ja'],
    'koreanic': ['ko'],
    'austroasiatic': ['vi', 'km', 'lo'],
    'tai-kadai': ['th', 'lo'],
    'dravidian': ['ta', 'te', 'kn', 'ml'],
    'indo-iranian': ['hi', 'bn', 'ur', 'fa', 'ps', 'ku', 'sd', 'ne', 'si', 'my'],
    'niger-congo': ['sw', 'yo', 'ig', 'zu', 'xh', 'sn', 'st', 'tn', 've', 'ts', 'ss', 'nr', 'nd', 'rw', 'ak', 'tw', 'ee', 'fon', 'ha', 'ff', 'wo', 'dyo', 'bem', 'ny'],
    'afro-asiatic': ['ar', 'he', 'fa', 'ur', 'ps', 'ku', 'sd', 'so', 'am', 'ti', 'byn', 'ha'],
    'uralic': ['fi', 'et', 'hu'],
    'altaic': ['tr', 'az', 'kk', 'ky', 'uz', 'tg', 'tk', 'mn'],
    'eskimo-aleut': ['iu'],
    'na-dene': ['nv'],
    'algonquian': ['oj', 'cr'],
    'iroquoian': ['chr'],
    'siouan': ['lkt'],
    'uto-aztecan': ['nah'],
    'mayan': ['quc'],
    'quechuan': ['qu', 'ay'],
    'arawak': ['gn'],
    'tupi': ['gn'],
    'carib': ['car'],
    'pama-nyungan': ['arn'],
    'polynesian': ['sm', 'to', 'fj', 'haw', 'mi'],
    'melanesian': ['fj'],
    'micronesian': ['haw'],
    'papuan': ['tpi'],
    'creole': ['ht'],
    'pidgin': ['tpi'],
    'constructed': ['eo', 'ia', 'vo'],
    'sign': ['ase', 'bfi', 'bzs', 'cdo', 'csl', 'csn', 'dse', 'ecs', 'esl', 'fsl', 'gsg', 'gus', 'hab', 'hds', 'hks', 'hos', 'hps', 'icl', 'iks', 'ils', 'inl', 'ins', 'ise', 'isg', 'isr', 'jcs', 'jls', 'jos', 'jsl', 'jss', 'jus', 'kgi', 'kvk', 'kvx', 'lbs', 'lce', 'lcf', 'liw', 'lls', 'lsb', 'lsg', 'lsl', 'lsn', 'lso', 'lsp', 'lst', 'lsv', 'lsw', 'lws', 'lzh', 'max', 'mdl', 'meo', 'mfa', 'mfb', 'mfs', 'min', 'mnp', 'mqg', 'msd', 'msr', 'mui', 'mzc', 'mzg', 'mzy', 'nan', 'nbs', 'ncs', 'nsi', 'nsl', 'nsp', 'nsr', 'nzs', 'okl', 'orn', 'ors', 'pga', 'pgz', 'pks', 'prl', 'prz', 'psc', 'psd', 'pse', 'psg', 'psl', 'pso', 'psp', 'psr', 'pys', 'rms', 'rsl', 'rsm', 'sdl', 'sfb', 'sfs', 'sgg', 'sgx', 'shu', 'slf', 'sls', 'sqk', 'sqs', 'sqx', 'ssh', 'ssp', 'ssr', 'svk', 'swc', 'swh', 'syy', 'szs', 'tmw', 'tse', 'tsm', 'tsq', 'tss', 'tsy', 'ttj', 'tza', 'ugn', 'ugy', 'ukl', 'uks', 'urk', 'uzn', 'uzs', 'vgt', 'vsi', 'vsl', 'vsv', 'wuu', 'xki', 'xml', 'xms', 'yds', 'ygs', 'yhs', 'ysl', 'ysp', 'yue', 'zib', 'zlm', 'zmi', 'zsl', 'zsm', 'zsr', 'zxx', 'zza']
  };
  for (const [family, codes] of Object.entries(languageFamilies)) {
    if (codes.includes(langCode)) {
      return family;
    }
  }
  return 'unknown';
};

// Helper function to get language script
const getLanguageScript = (langCode: string): string => {
  const scriptMap: { [key: string]: string } = {
    // Latin script
    'en': 'latin', 'es': 'latin', 'fr': 'latin', 'de': 'latin', 'it': 'latin', 'pt': 'latin', 'pl': 'latin', 'nl': 'latin', 'sv': 'latin', 'da': 'latin', 'no': 'latin', 'fi': 'latin', 'cs': 'latin', 'sk': 'latin', 'hu': 'latin', 'ro': 'latin', 'hr': 'latin', 'sl': 'latin', 'et': 'latin', 'lv': 'latin', 'lt': 'latin', 'mt': 'latin', 'ga': 'latin', 'cy': 'latin', 'is': 'latin', 'ca': 'latin', 'eu': 'latin', 'gl': 'latin', 'af': 'latin', 'sw': 'latin', 'yo': 'latin', 'ig': 'latin', 'zu': 'latin', 'xh': 'latin', 'tr': 'latin', 'vi': 'latin', 'id': 'latin', 'ms': 'latin', 'az': 'latin', 'uz': 'latin', 'tk': 'latin', 'sq': 'latin', 'bs': 'latin', 'me': 'latin', 'fy': 'latin', 'lb': 'latin', 'rm': 'latin', 'fo': 'latin', 'sm': 'latin', 'to': 'latin', 'fj': 'latin', 'haw': 'latin', 'mi': 'latin', 'qu': 'latin', 'ay': 'latin', 'gn': 'latin', 'ht': 'latin', 'jmc': 'latin', 'sn': 'latin', 'st': 'latin', 'tn': 'latin', 've': 'latin', 'ts': 'latin', 'ss': 'latin', 'nr': 'latin', 'nd': 'latin', 'rw': 'latin', 'ak': 'latin', 'tw': 'latin', 'ee': 'latin', 'fon': 'latin', 'ha': 'latin', 'ff': 'latin', 'wo': 'latin', 'dyo': 'latin', 'bem': 'latin', 'ny': 'latin', 'so': 'latin', 'om': 'latin', 'gsw': 'latin', 'fur': 'latin', 'lld': 'latin', 'vec': 'latin', 'sc': 'latin', 'co': 'latin', 'oc': 'latin', 'an': 'latin', 'ast': 'latin', 'ext': 'latin', 'lad': 'latin', 'wa': 'latin', 'pcd': 'latin', 'nrf': 'latin', 'jèr': 'latin', 'sco': 'latin', 'gd': 'latin', 'kw': 'latin', 'br': 'latin', 'gv': 'latin',
    // Cyrillic script
    'ru': 'cyrillic', 'bg': 'cyrillic', 'sr': 'cyrillic', 'uk': 'cyrillic', 'be': 'cyrillic', 'mk': 'cyrillic', 'mn': 'cyrillic', 'kk': 'cyrillic', 'ky': 'cyrillic', 'tg': 'cyrillic',
    // Arabic script
    'ar': 'arabic', 'ur': 'arabic', 'fa': 'arabic', 'ps': 'arabic', 'ku': 'arabic', 'sd': 'arabic',
    // Hebrew script
    'he': 'hebrew',
    // Greek script
    'el': 'greek',
    // Chinese scripts
    'zh': 'han', 'ja': 'kana', 'ko': 'hangul',
    // Indian scripts
    'hi': 'devanagari', 'mr': 'devanagari', 'ne': 'devanagari', 'bn': 'bengali', 'as': 'bengali', 'or': 'odia', 'ta': 'tamil', 'te': 'telugu', 'kn': 'kannada', 'ml': 'malayalam', 'gu': 'gujarati', 'pa': 'gurmukhi', 'si': 'sinhala',
    // Southeast Asian scripts
    'th': 'thai', 'my': 'myanmar', 'km': 'khmer', 'lo': 'lao',
    // Other scripts
    'ka': 'georgian', 'hy': 'armenian', 'bo': 'tibetan', 'dz': 'tibetan', 'am': 'ethiopic', 'ti': 'ethiopic', 'byn': 'ethiopic'
  };
  return scriptMap[langCode] || 'latin'; // Default to latin
};

const Index = () => {
  // Use the actual voice recognition hook
  const {
    recording,
    result,
    start,
    stop,
    clearTranscript,
    leftLang,
    rightLang,
    setLeftLang,
    setRightLang,
  } = useVoiceRecognition();

  // Translation hook for testing
  const { translate } = useTranslation();

  // Determine if user has completed NUX
  const [showNUX, setShowNUX] = useState(() => {
    return localStorage.getItem("nux_completed") !== "true";
  });

  // Debug window state - default to hidden
  const [showDebugWindow, setShowDebugWindow] = useState(() => {
    return localStorage.getItem("debug_window_visible") === "true";
  });

  // Per-panel text size state
  const [leftTextSize, setLeftTextSize] = useState(40);
  const [rightTextSize, setRightTextSize] = useState(40);

  // Panel alignment state
  const [leftAlign, setLeftAlign] = useState<"left" | "right">("left");
  const [rightAlign, setRightAlign] = useState<"left" | "right">("left");
  const [leftReverseOrder, setLeftReverseOrder] = useState(false);
  const [rightReverseOrder, setRightReverseOrder] = useState(false);

  // Debug logging for alignment state
  useEffect(() => {
    console.log("[Index] Left alignment changed:", { leftAlign, leftLang, canReorderCharacters: leftLang === "ja" });
  }, [leftAlign, leftLang]);

  useEffect(() => {
    console.log("[Index] Right alignment changed:", { rightAlign, rightLang, canReorderCharacters: rightLang === "ja" });
  }, [rightAlign, rightLang]);

  // Panel visibility state
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  // Audio playback state for both panels
  const [leftAudioPlaying, setLeftAudioPlaying] = useState(false);
  const [rightAudioPlaying, setRightAudioPlaying] = useState(false);

  // Voice selection state for both panels
  const [leftSelectedVoice, _setLeftSelectedVoice] = useState<string>(() => localStorage.getItem("leftSelectedVoice") || "");
  const [rightSelectedVoice, _setRightSelectedVoice] = useState<string>(() => localStorage.getItem("rightSelectedVoice") || "");
  const [leftVoiceManuallySelected, setLeftVoiceManuallySelected] = useState(false);
  const [rightVoiceManuallySelected, setRightVoiceManuallySelected] = useState(false);

  // Wrap setters to track manual selection
  const setLeftSelectedVoice = (voice: string, manual = false) => {
    _setLeftSelectedVoice(voice);
    if (manual) setLeftVoiceManuallySelected(true);
  };
  const setRightSelectedVoice = (voice: string, manual = false) => {
    _setRightSelectedVoice(voice);
    if (manual) setRightVoiceManuallySelected(true);
  };

  // Reset manual flag when language changes
  useEffect(() => {
    setLeftVoiceManuallySelected(false);
  }, [leftLang]);
  useEffect(() => {
    setRightVoiceManuallySelected(false);
  }, [rightLang]);

  // Auto-speak settings
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => localStorage.getItem("auto_speak") !== "false");
  const [silenceTimeout, setSilenceTimeout] = useState<number>(() => parseInt(localStorage.getItem("silence_timeout") || "3000"));

  // Handle mic muting during audio playback - use counter to track multiple audio sessions
  const [activeAudioSessions, setActiveAudioSessions] = useState(0);
  const [wasRecordingBeforeAnyAudio, setWasRecordingBeforeAnyAudio] = useState(false);
  const [micButtonJustClicked, setMicButtonJustClicked] = useState(false);

  // Use ref to track recording state more reliably
  const recordingRef = useRef(recording);
  recordingRef.current = recording;

  // Debug logging for audio state
  useEffect(() => {
    console.log("[Index] Audio state changed:", { activeAudioSessions, wasRecordingBeforeAnyAudio, recording });
  }, [activeAudioSessions, wasRecordingBeforeAnyAudio, recording]);

  // Ensure audio playing states are reset when all sessions end
  useEffect(() => {
    if (activeAudioSessions === 0) {
      console.log("[Index] All audio sessions ended, resetting audio playing states");
      setLeftAudioPlaying(false);
      setRightAudioPlaying(false);
      setWasRecordingBeforeAnyAudio(false);
    }
  }, [activeAudioSessions]);

  // Save voice selections to localStorage
  useEffect(() => {
    localStorage.setItem("leftSelectedVoice", leftSelectedVoice);
  }, [leftSelectedVoice]);

  useEffect(() => {
    localStorage.setItem("rightSelectedVoice", rightSelectedVoice);
  }, [rightSelectedVoice]);

  // Auto-select appropriate voices when languages change
  useEffect(() => {
    const selectBestVoiceForLanguage = (langCode: string, setVoice: (voice: string) => void, manuallySelected: boolean) => {
      if (manuallySelected) return; // Don't auto-select if user picked
      if (window.speechSynthesis && window.speechSynthesis.getVoices) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;
        let bestVoice = null;
        bestVoice = voices.find(v => v.lang === langCode);
        if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(langCode));
        if (!bestVoice) {
          const langFamily = getLanguageFamily(langCode);
          bestVoice = voices.find(v => {
            const voiceLangFamily = getLanguageFamily(v.lang);
            return voiceLangFamily === langFamily;
          });
        }
        if (!bestVoice) {
          const script = getLanguageScript(langCode);
          bestVoice = voices.find(v => {
            const voiceScript = getLanguageScript(v.lang);
            return voiceScript === script;
          });
        }
        if (!bestVoice) bestVoice = voices[0];
        if (bestVoice) {
          console.log(`[Index] Auto-selecting voice for ${langCode}:`, bestVoice.name, bestVoice.voiceURI);
          setVoice(bestVoice.voiceURI);
        }
      }
    };
    selectBestVoiceForLanguage(leftLang, (v) => setLeftSelectedVoice(v, false), leftVoiceManuallySelected);
    selectBestVoiceForLanguage(rightLang, (v) => setRightSelectedVoice(v, false), rightVoiceManuallySelected);
  }, [leftLang, rightLang, leftVoiceManuallySelected, rightVoiceManuallySelected]);

  const handleAudioStart = () => {
    console.log("[Index] Audio playback started - mic should be muted", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio, micButtonJustClicked });
    
    // Prevent audio if mic button was just clicked
    if (micButtonJustClicked) {
      console.log("[Index] Preventing auto-play - mic button was just clicked");
      return;
    }
    
    // If this is the first audio session, remember if we were recording
    if (activeAudioSessions === 0) {
      setWasRecordingBeforeAnyAudio(recording);
    }
    
    // Increment active audio sessions
    setActiveAudioSessions(prev => {
      const newCount = prev + 1;
      console.log("[Index] Active audio sessions incremented to:", newCount);
      return newCount;
    });
    
    // Stop recording when audio starts to prevent feedback
    if (recording) {
      console.log("[Index] Stopping recording due to audio playback");
      stop();
    }
  };

  const handleAudioEnd = () => {
    console.log("[Index] Audio playback ended - mic can be unmuted", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
    
    // Decrement active audio sessions
    setActiveAudioSessions(prev => {
      const newCount = Math.max(0, prev - 1); // Prevent negative counts
      console.log("[Index] Active audio sessions reduced to:", newCount);
      
      // If no more active audio sessions, always restart recording
      if (newCount === 0 && !recordingRef.current) {
        console.log("[Index] Auto-restarting recording after translation playback ended");
        // Add a small delay to ensure state is properly updated
        setTimeout(() => {
          console.log("[Index] Executing delayed start() call");
          start();
        }, 100);
      } else if (newCount === 0) {
        console.log("[Index] Not restarting recording - already recording", { recording: recordingRef.current });
      }
      
      return newCount;
    });
  };

  // Use auto-play hook for right panel (translation)
  useAutoPlayOnSilence({
    isRecording: recording,
    transcript: result.transcript,
    translation: result.translation,
    canAutoPlay: autoSpeak && rightVisible && !leftAudioPlaying && !rightAudioPlaying && !micButtonJustClicked,
    isAudioPlaying: rightAudioPlaying,
    setAudioPlaying: setRightAudioPlaying,
    lang: rightLang,
    timeoutMs: silenceTimeout,
    onAudioStart: handleAudioStart,
    onAudioEnd: handleAudioEnd,
    onTranscriptClear: clearTranscript,
  });

  // Spacebar handling for stopping audio playback
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && (leftAudioPlaying || rightAudioPlaying)) {
        event.preventDefault();
        
        // Stop all audio playback
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
        setLeftAudioPlaying(false);
        setRightAudioPlaying(false);
        
        // Reset all audio sessions and resume recording if needed
        setActiveAudioSessions(0);
        if (!recordingRef.current) {
          console.log("[Index] Auto-restarting recording after spacebar stop");
          start();
        }
        setWasRecordingBeforeAnyAudio(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leftAudioPlaying, rightAudioPlaying, recording, start, wasRecordingBeforeAnyAudio]);

  // Debug: Check Web Speech API availability
  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log("Web Speech API available:", !!SpeechRecognitionCtor);
    
    if (SpeechRecognitionCtor) {
      console.log("SpeechRecognition constructor found");
    } else {
      console.warn("Web Speech API not available - will use demo mode");
    }
  }, []);

  // Debug: Log voice recognition results
  useEffect(() => {
    if (result.transcript || result.translation) {
      console.log("Voice recognition result updated:", result);
    }
  }, [result]);

  // Debug: Monitor recording state changes
  useEffect(() => {
    console.log("[Index] Recording state changed:", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
  }, [recording, activeAudioSessions, wasRecordingBeforeAnyAudio]);

  // Test translation function
  const testTranslation = async () => {
    try {
      console.log("Testing translation...");
      const testResult = await translate({
        text: "Hello world",
        from: "en",
        to: "ja"
      });
      console.log("Translation test result:", testResult);
      alert(`Translation test: "Hello world" -> "${testResult}"`);
    } catch (error) {
      console.error("Translation test failed:", error);
      alert("Translation test failed: " + error);
    }
  };

  // When NUX finishes, mark complete and hide
  const handleNUXFinish = () => {
    localStorage.setItem("nux_complete", "1");
    setShowNUX(false);
  };

  // If recording started, close NUX if open
  useEffect(() => {
    if (recording && showNUX) {
      setShowNUX(false);
    }
  }, [recording, showNUX]);

  // Handle mic click - start/stop voice recognition
  const handleMicClick = () => {
    console.log("[Index] Mic clicked, current state:", { 
      recording, 
      leftAudioPlaying, 
      rightAudioPlaying, 
      activeAudioSessions, 
      wasRecordingBeforeAnyAudio,
      micButtonJustClicked
    });
    
    // Set flag to prevent audio interference
    setMicButtonJustClicked(true);
    setTimeout(() => setMicButtonJustClicked(false), 2000); // Clear after 2 seconds
    
    // Always clear any audio states first to prevent interference
    if (leftAudioPlaying || rightAudioPlaying || activeAudioSessions > 0) {
      console.log("[Index] Clearing audio states before mic action");
      setLeftAudioPlaying(false);
      setRightAudioPlaying(false);
      setActiveAudioSessions(0);
      setWasRecordingBeforeAnyAudio(false);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    
    // Force cancel any ongoing speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear any existing auto-play timers by temporarily disabling auto-play
    // This will trigger the useAutoPlayOnSilence hook to clear its timers
    const currentAutoSpeak = autoSpeak;
    if (currentAutoSpeak) {
      console.log("[Index] Temporarily disabling auto-play to clear timers");
      // The auto-play hook will re-evaluate when canAutoPlay changes
    }
    
    // Clear auto-play timers directly
    if (typeof window !== 'undefined' && (window as any).clearAutoPlayTimers) {
      console.log("[Index] Clearing auto-play timers");
      (window as any).clearAutoPlayTimers();
    }
    
    if (recording) {
      console.log("[Index] Stopping recording via mic click");
      stop();
    } else {
      console.log("[Index] Starting recording via mic click");
      start();
    }
  };

  // Helpers to get language labels
  const leftLabel = LANGUAGES.find(l => l.value === leftLang)?.label || leftLang;
  const rightLabel = LANGUAGES.find(l => l.value === rightLang)?.label || rightLang;

  // Convert transcript and translation to the format expected by TranscriptPanel
  const transcriptData = result.transcript ? [{ text: result.transcript, timestamp: "" }] : [];
  const translationData = result.translation ? [{ text: result.translation, timestamp: "" }] : [];

  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const [translationHistory, setTranslationHistory] = useState<string[]>([]);

  // When you get a new transcript/translation (replace where result.transcript/result.translation is set):
  useEffect(() => {
    if (result.transcript) setTranscriptHistory(prev => [...prev, result.transcript]);
    if (result.translation) setTranslationHistory(prev => [...prev, result.translation]);
  }, [result.transcript, result.translation]);

  // For download, collate input/translation pairs:
  const handleDownload = () => {
    let content = '';
    for (let i = 0; i < Math.max(transcriptHistory.length, translationHistory.length); i++) {
      if (transcriptHistory[i]) content += transcriptHistory[i] + '\n';
      if (translationHistory[i]) content += translationHistory[i] + '\n';
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'transcript.txt');
  };

  return (
    <>
      {/* NUX overlays UI, but bottom controls are always visible */}
      {showNUX && (
        <NUX
          onFinish={handleNUXFinish}
          recording={recording}
        />
      )}
      {/* Main app w/controls is always interactive */}
      <div>
        <TranscriptNav
          recording={recording}
          onMicClick={handleMicClick}
          textSize={40}
          setTextSize={() => {}} // unused, legacy prop
          leftLang={leftLang}
          rightLang={rightLang}
          setLeftLang={setLeftLang}
          setRightLang={setRightLang}
          leftVisible={leftVisible}
          rightVisible={rightVisible}
          setLeftVisible={setLeftVisible}
          setRightVisible={setRightVisible}
          transcript={transcriptHistory.join('\n')}
          translation={translationHistory.join('\n')}
          transcriptHistory={transcriptHistory}
          translationHistory={translationHistory}
          isAudioPlaying={activeAudioSessions > 0}
          showDebugWindow={showDebugWindow}
          setShowDebugWindow={setShowDebugWindow}
          autoSpeak={autoSpeak}
          setAutoSpeak={setAutoSpeak}
          silenceTimeout={silenceTimeout}
          setSilenceTimeout={setSilenceTimeout}
        />
        
        {/* Debug controls - only show in development */}
        {showDebugWindow && (
          <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
            <h3 className="text-sm font-bold mb-2">Debug Controls</h3>
            <button
              onClick={testTranslation}
              className="block w-full mb-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Translation
            </button>
            <div className="text-xs text-gray-600">
              <div>Recording: {recording ? "Yes" : "No"}</div>
              <div>Left Lang: {leftLang}</div>
              <div>Right Lang: {rightLang}</div>
              <div>Left Voice: {leftSelectedVoice || "Default"}</div>
              <div>Right Voice: {rightSelectedVoice || "Default"}</div>
              <div>Auto-Speak: {autoSpeak ? "On" : "Off"}</div>
              <div>Silence Timeout: {silenceTimeout / 1000}s</div>
              <div>Left Audio: {leftAudioPlaying ? "Playing" : "Stopped"}</div>
              <div>Right Audio: {rightAudioPlaying ? "Playing" : "Stopped"}</div>
              <div>Active Audio Sessions: {activeAudioSessions}</div>
              <div>Was Recording Before Audio: {wasRecordingBeforeAnyAudio ? "Yes" : "No"}</div>
              <div>Mic Button Protection: {micButtonJustClicked ? "Active" : "Inactive"}</div>
            </div>
          </div>
        )}
        
        {/* Render transcript panels as main content */}
        <div className="flex flex-row gap-4 w-full max-w-6xl mx-auto mt-6 px-4">
          {leftVisible && (
            <div className="flex-1 min-w-0">
              <TranscriptPanel
                title={leftLabel}
                text={transcriptData}
                align="left"
                textSize={leftTextSize}
                setTextSize={setLeftTextSize}
                lang={leftLang}
                showTimestamps={false}
                showVisibilityToggle={false}
                pillStyle={false}
                isRecording={recording}
                visible={leftVisible}
                setVisible={setLeftVisible}
                alignState={{
                  currentAlign: leftAlign,
                  setCurrentAlign: setLeftAlign,
                  reverseOrder: leftReverseOrder,
                  setReverseOrder: setLeftReverseOrder,
                }}
                audioButtonProps={{
                  text: result.transcript,
                  playing: leftAudioPlaying || activeAudioSessions > 0,
                  setPlaying: setLeftAudioPlaying,
                  lang: leftLang,
                  onPlaybackStart: () => {
                    console.log("[Index] Left panel audio started", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio, micButtonJustClicked });
                    
                    // Prevent audio if mic button was just clicked
                    if (micButtonJustClicked) {
                      console.log("[Index] Preventing audio playback - mic button was just clicked");
                      return;
                    }
                    
                    // If this is the first audio session, remember if we were recording
                    if (activeAudioSessions === 0) {
                      setWasRecordingBeforeAnyAudio(recording);
                    }
                    
                    // Increment active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = prev + 1;
                      console.log("[Index] Active audio sessions incremented to:", newCount);
                      return newCount;
                    });
                    
                    // Stop recording when audio starts to prevent feedback
                    if (recording) {
                      console.log("[Index] Stopping recording due to left panel audio");
                      stop();
                    }
                  },
                  onPlaybackEnd: () => {
                    console.log("[Index] Left panel audio ended", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
                    
                    // Decrement active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = Math.max(0, prev - 1); // Prevent negative counts
                      console.log("[Index] Active audio sessions reduced to:", newCount);
                      
                      // If no more active audio sessions, always restart recording
                      if (newCount === 0 && !recordingRef.current) {
                        console.log("[Index] Auto-restarting recording after left panel audio ended");
                        // Add a small delay to ensure state is properly updated
                        setTimeout(() => {
                          console.log("[Index] Executing delayed start() call for left panel");
                          start();
                        }, 100);
                      } else if (newCount === 0) {
                        console.log("[Index] Not restarting recording after left panel audio - already recording", { recording: recordingRef.current });
                      }
                      
                      return newCount;
                    });
                  },
                  disabled: micButtonJustClicked || false, // Disable when mic button was just clicked
                  selectedVoice: leftSelectedVoice,
                  setSelectedVoice: setLeftSelectedVoice,
                }}
              />
            </div>
          )}
          {rightVisible && (
            <div className="flex-1 min-w-0">
              <TranscriptPanel
                title={rightLabel}
                text={translationData}
                align="right"
                textSize={rightTextSize}
                setTextSize={setRightTextSize}
                lang={rightLang}
                showTimestamps={false}
                showVisibilityToggle={false}
                pillStyle={false}
                isRecording={recording}
                visible={rightVisible}
                setVisible={setRightVisible}
                alignState={{
                  currentAlign: rightAlign,
                  setCurrentAlign: setRightAlign,
                  reverseOrder: rightReverseOrder,
                  setReverseOrder: setRightReverseOrder,
                }}
                audioButtonProps={{
                  text: result.translation,
                  playing: rightAudioPlaying || activeAudioSessions > 0,
                  setPlaying: setRightAudioPlaying,
                  lang: rightLang,
                  onPlaybackStart: () => {
                    console.log("[Index] Right panel audio started", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio, micButtonJustClicked });
                    
                    // Prevent audio if mic button was just clicked
                    if (micButtonJustClicked) {
                      console.log("[Index] Preventing audio playback - mic button was just clicked");
                      return;
                    }
                    
                    // If this is the first audio session, remember if we were recording
                    if (activeAudioSessions === 0) {
                      setWasRecordingBeforeAnyAudio(recording);
                    }
                    
                    // Increment active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = prev + 1;
                      console.log("[Index] Active audio sessions incremented to:", newCount);
                      return newCount;
                    });
                    
                    // Stop recording when audio starts to prevent feedback
                    if (recording) {
                      console.log("[Index] Stopping recording due to right panel audio");
                      stop();
                    }
                  },
                  onPlaybackEnd: () => {
                    console.log("[Index] Right panel audio ended", { recording, activeAudioSessions, wasRecordingBeforeAnyAudio });
                    
                    // Decrement active audio sessions
                    setActiveAudioSessions(prev => {
                      const newCount = Math.max(0, prev - 1); // Prevent negative counts
                      console.log("[Index] Active audio sessions reduced to:", newCount);
                      
                      // If no more active audio sessions, always restart recording
                      if (newCount === 0 && !recordingRef.current) {
                        console.log("[Index] Auto-restarting recording after right panel audio ended");
                        // Add a small delay to ensure state is properly updated
                        setTimeout(() => {
                          console.log("[Index] Executing delayed start() call for right panel");
                          start();
                        }, 100);
                      } else if (newCount === 0) {
                        console.log("[Index] Not restarting recording after right panel audio - already recording", { recording: recordingRef.current });
                      }
                      
                      return newCount;
                    });
                  },
                  disabled: micButtonJustClicked || false, // Disable when mic button was just clicked
                  selectedVoice: rightSelectedVoice,
                  setSelectedVoice: setRightSelectedVoice,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
