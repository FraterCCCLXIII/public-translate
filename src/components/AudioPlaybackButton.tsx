import React, { useEffect, useState, useRef } from "react";
import { AudioLines, LoaderCircle, Settings as SettingsIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";

interface AudioPlaybackButtonProps {
  text: string;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  disabled?: boolean;
  lang?: string;
  selectedVoice?: string;
  setSelectedVoice?: (voiceId: string, manual?: boolean) => void;
}

/**
 * Plays text using Web Speech Synthesis API (browser TTS).
 * Handles loading state, playback control, and allows interrupt/resume via external events.
 * Allows popover to pick a voice for this button (per-language).
 */
const AudioPlaybackButton: React.FC<AudioPlaybackButtonProps> = ({
  text,
  onPlaybackStart,
  onPlaybackEnd,
  playing,
  setPlaying,
  disabled,
  lang = "en",
  selectedVoice,
  setSelectedVoice
}) => {
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef(window.speechSynthesis);
  // Timer to allow delayed closing on mouse leave
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis && window.speechSynthesis.getVoices) {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);
        setAvailableVoices(voices);
        
        // Enhanced voice selection logic
        if (voices.length > 0) {
          let bestVoice = null;
          
          console.log(`[AudioPlaybackButton] Selecting voice for language: ${lang}`);
          console.log(`[AudioPlaybackButton] Available voices:`, voices.map(v => `${v.name} (${v.lang})`));
          
          // First, try to find an exact language match
          bestVoice = voices.find(v => v.lang === lang);
          if (bestVoice) {
            console.log(`[AudioPlaybackButton] Found exact language match: ${bestVoice.name} (${bestVoice.lang})`);
          }
          
          // If no exact match, try to find a voice that starts with the language code
          if (!bestVoice) {
            bestVoice = voices.find(v => v.lang.startsWith(lang));
            if (bestVoice) {
              console.log(`[AudioPlaybackButton] Found language prefix match: ${bestVoice.name} (${bestVoice.lang})`);
            }
          }
          
          // If still no match, try to find a voice with similar language family
          if (!bestVoice) {
            const langFamily = getLanguageFamily(lang);
            console.log(`[AudioPlaybackButton] Language family for ${lang}: ${langFamily}`);
            bestVoice = voices.find(v => {
              const voiceLangFamily = getLanguageFamily(v.lang);
              return voiceLangFamily === langFamily;
            });
            if (bestVoice) {
              console.log(`[AudioPlaybackButton] Found language family match: ${bestVoice.name} (${bestVoice.lang}) - family: ${langFamily}`);
            }
          }
          
          // If still no match, try to find a voice with the same script/alphabet
          if (!bestVoice) {
            const script = getLanguageScript(lang);
            console.log(`[AudioPlaybackButton] Language script for ${lang}: ${script}`);
            bestVoice = voices.find(v => {
              const voiceScript = getLanguageScript(v.lang);
              return voiceScript === script;
            });
            if (bestVoice) {
              console.log(`[AudioPlaybackButton] Found script match: ${bestVoice.name} (${bestVoice.lang}) - script: ${script}`);
            }
          }
          
          // Fallback to first available voice
          if (!bestVoice) {
            bestVoice = voices[0];
            console.log(`[AudioPlaybackButton] Using fallback voice: ${bestVoice.name} (${bestVoice.lang})`);
          }
          
          // Only update if we found a better voice or no voice is currently selected
          if (!selectedVoice || bestVoice.voiceURI !== selectedVoice) {
            console.log(`[AudioPlaybackButton] Auto-selecting voice for ${lang}:`, bestVoice.name, bestVoice.voiceURI);
            setSelectedVoice && setSelectedVoice(bestVoice.voiceURI);
          } else {
            console.log(`[AudioPlaybackButton] Voice already selected for ${lang}:`, bestVoice.name);
          }
        } else {
          console.log(`[AudioPlaybackButton] No voices available for language: ${lang}`);
        }
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also listen for voiceschanged event
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [lang, selectedVoice, setSelectedVoice]);

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

  // Start speech on click
  const handleAudioClick = (e: React.MouseEvent) => {
    console.log("[AudioPlaybackButton] Audio button clicked", {
      playing,
      text: text?.substring(0, 50) + "...",
      target: e.target,
      currentTarget: e.currentTarget,
      eventPhase: e.eventPhase
    });
    
    e.stopPropagation();
    if (playing) {
      console.log("[AudioPlaybackButton] Stopping audio playback");
      synthRef.current.cancel();
      setPlaying(false);
      setLoading(false);
      onPlaybackEnd?.();
      return;
    }
    if (!text) {
      console.log("[AudioPlaybackButton] No text to play");
      return;
    }
    if (!window.speechSynthesis) {
      console.log("[AudioPlaybackButton] Speech synthesis not available");
      return;
    }
    
    // Debug Tibetan text corruption
    if (lang === 'bo') {
      console.log("[AudioPlaybackButton] Tibetan text analysis:", {
        originalText: text,
        textLength: text.length,
        hasCorruption: text.includes('>') || text.includes('-') || text.includes('།'),
        unicodeChars: Array.from(text).map(char => char.charCodeAt(0).toString(16)),
        cleanText: text.replace(/[>\-]+/g, '').replace(/།\s*།/g, '།').trim()
      });
    }
    
    console.log("[AudioPlaybackButton] Starting audio playback");
    setLoading(true);
    setPlaying(true);
    onPlaybackStart?.();

    // Cancel any existing speech synthesis to prevent overlap
    synthRef.current.cancel();

    // Clean text for Tibetan to prevent corruption
    let cleanText = text;
    if (lang === 'bo') {
      cleanText = text
        .replace(/[>\-]+/g, '') // Remove > and - characters that might be corruption markers
        .replace(/།\s*།/g, '།') // Clean up duplicate Tibetan punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      console.log("[AudioPlaybackButton] Cleaned Tibetan text for speech:", cleanText);
    }

    const utter = new window.SpeechSynthesisUtterance(cleanText);
    utter.lang = lang;
    
    // Set the selected voice if available
    if (selectedVoice) {
      const selectedVoiceObj = availableVoices.find(voice => voice.voiceURI === selectedVoice);
      if (selectedVoiceObj) {
        console.log("Using voice:", selectedVoiceObj.name, selectedVoiceObj.voiceURI);
        utter.voice = selectedVoiceObj;
      } else {
        console.log("Selected voice not found:", selectedVoice);
        console.log("Available voices:", availableVoices.map(v => `${v.name} (${v.voiceURI})`));
      }
    } else {
      console.log("No voice selected, using default voice for language:", lang);
    }
    
    console.log("Speech synthesis utterance config:", {
      text: cleanText?.substring(0, 50) + "...",
      lang: utter.lang,
      voice: utter.voice?.name || "default",
      voiceURI: utter.voice?.voiceURI || "none"
    });
    
    utter.onend = () => {
      console.log("[AudioPlaybackButton] Audio playback ended");
      setLoading(false);
      setPlaying(false);
      onPlaybackEnd?.();
    };
    utter.onerror = (event) => {
      console.log("[AudioPlaybackButton] Audio playback error:", event);
      setLoading(false);
      setPlaying(false);
      onPlaybackEnd?.();
    };
    synthRef.current.speak(utter);
  };

  useEffect(() => {
    if (!playing) {
      synthRef.current.cancel();
      setLoading(false);
    }
  }, [playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Handlers for hover popover trigger
  const handleIconMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setPopoverOpen(true);
  };

  const handleIconMouseLeave = () => {
    // Only close after a short delay to allow moving to popover content
    closeTimerRef.current = setTimeout(() => setPopoverOpen(false), 120);
  };

  const handlePopoverMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleAudioClick}
          className="p-1 rounded hover:bg-accent focus:outline-none transition"
          disabled={disabled}
          aria-label={playing ? "Stop audio playback" : "Play transcript with text-to-speech"}
          style={{ 
            pointerEvents: disabled ? "none" : "auto",
            position: 'relative',
            zIndex: 1
          }}
          onMouseEnter={handleIconMouseEnter}
          onMouseLeave={handleIconMouseLeave}
        >
          {loading ? (
            <LoaderCircle className="animate-spin text-gray-500" size={18} />
          ) : (
            <AudioLines className={playing ? "text-blue-500" : "text-gray-800 dark:text-gray-200"} size={18} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        className="w-48 max-h-56 overflow-auto custom-scrollbar px-0 py-2"
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
      >
        <div className="font-semibold text-xs text-gray-700 mb-2 px-3">
          Choose Voice
        </div>
        <div className="flex flex-col gap-1 px-2">
          {availableVoices.length === 0 ? (
            <div className="text-xs text-gray-500 px-2 py-1">Loading voices...</div>
          ) : (
            availableVoices.map((voice) => (
              <Button
                key={voice.voiceURI}
                onClick={() => setSelectedVoice && setSelectedVoice(voice.voiceURI, true)}
                variant={selectedVoice === voice.voiceURI ? "default" : "outline"}
                className={`w-full text-left px-2 py-1 rounded ${
                  selectedVoice === voice.voiceURI 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                tabIndex={0}
              >
                <div className="text-xs">
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-xs opacity-70">{voice.lang}</div>
                </div>
              </Button>
            ))
          )}
        </div>
        <style>
          {`
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #94a3b8 #e5e7eb;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #94a3b8;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #e5e7eb;
              border-radius: 4px;
            }
          `}
        </style>
      </PopoverContent>
    </Popover>
  );
};

export default AudioPlaybackButton;

