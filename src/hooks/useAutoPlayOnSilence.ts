import { useEffect, useRef } from "react";

/**
 * Calls onAutoPlay after `timeoutMs` of silence (no mic activity/recording).
 * Only fires if `isRecording` is true, and resets if recording restarts.
 * @param isRecording - Is the microphone currently recording?
 * @param transcript - The main transcript (not used, but may trigger effect if relevant)
 * @param translation - The translation to read aloud if silent for timeoutMs
 * @param canAutoPlay - Whether TTS should be triggered (e.g., only on right panel)
 * @param isAudioPlaying - Is TTS currently playing? Prevents overlap.
 * @param setAudioPlaying - Function to update TTS playing state
 * @param lang - language for TTS
 * @param timeoutMs - silence threshold in ms (default 5000)
 * @param onAudioStart - Callback when audio starts (for mic muting)
 * @param onAudioEnd - Callback when audio ends (for mic unmuting)
 * @param onTranscriptClear - Callback when the transcript is cleared
 */
export function useAutoPlayOnSilence({
  isRecording,
  transcript,
  translation,
  canAutoPlay,
  isAudioPlaying,
  setAudioPlaying,
  lang = "ja",
  timeoutMs = 5000,
  onAudioStart,
  onAudioEnd,
  onTranscriptClear,
}: {
  isRecording: boolean;
  transcript: string;
  translation: string;
  canAutoPlay: boolean;
  isAudioPlaying: boolean;
  setAudioPlaying: (b: boolean) => void;
  lang?: string;
  timeoutMs?: number;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onTranscriptClear?: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const lastTranscriptTimeRef = useRef<number>(0);
  const isAutoPlayingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const micButtonClickedTimeRef = useRef<number>(0);
  const lastPlayedTranslationRef = useRef<string>("");
  const micReactivatedRef = useRef<boolean>(false);
  const wasRecordingRef = useRef<boolean>(false);
  const playedTranslationsRef = useRef<Set<string>>(new Set());

  // Set mounted flag
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Clean up global function
      if (typeof window !== 'undefined') {
        delete (window as any).clearAutoPlayTimers;
      }
    };
  }, []);

  useEffect(() => {
    console.log("[useAutoPlayOnSilence] Effect triggered:", {
      isRecording,
      canAutoPlay,
      isAudioPlaying,
      transcript,
      translation,
      timeoutMs
    });

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Don't auto-play if conditions aren't met or component is unmounting
    const timeSinceMicClick = Date.now() - micButtonClickedTimeRef.current;
    const micButtonRecentlyClicked = timeSinceMicClick < 3000; // 3 seconds
    const translationAlreadyPlayed = translation === lastPlayedTranslationRef.current;
    
    // Reset mic reactivated flag when recording starts
    if (isRecording && !wasRecordingRef.current) {
      console.log("[useAutoPlayOnSilence] Recording started, resetting mic reactivated flag");
      micReactivatedRef.current = false;
    }
    wasRecordingRef.current = isRecording;
    
    // Auto-play should trigger when recording stops (silence detected) and we have a translation
    // OR when we're recording but the transcript hasn't changed for a while (silence during recording)
    const shouldTriggerAutoPlay = (
      canAutoPlay && 
      !isAudioPlaying && 
      translation.trim() && 
      !isAutoPlayingRef.current && 
      isMountedRef.current && 
      !micButtonRecentlyClicked && 
      !translationAlreadyPlayed
    );

    if (!shouldTriggerAutoPlay) {
      console.log("[useAutoPlayOnSilence] Conditions not met for auto-play", {
        isRecording,
        canAutoPlay,
        isAudioPlaying,
        hasTranslation: !!translation.trim(),
        isAutoPlaying: isAutoPlayingRef.current,
        isMounted: isMountedRef.current,
        micButtonRecentlyClicked,
        timeSinceMicClick,
        translationAlreadyPlayed
      });
      return;
    }

    // If transcript changed, reset the timer
    if (transcript !== lastTranscriptRef.current) {
      console.log("[useAutoPlayOnSilence] Transcript changed, resetting timer");
      
      // Reset played translation when new speech is detected
      if (transcript && transcript.length > lastTranscriptRef.current.length) {
        console.log("[useAutoPlayOnSilence] New speech detected, resetting played translation");
        lastPlayedTranslationRef.current = "";
        
        // Clear transcript if mic was recently reactivated and this is new speech
        if (micReactivatedRef.current) {
          console.log("[useAutoPlayOnSilence] Clearing transcript after mic reactivation and new speech");
          onTranscriptClear?.();
          micReactivatedRef.current = false; // Reset the flag
        }
      }
      
      lastTranscriptRef.current = transcript;
      lastTranscriptTimeRef.current = Date.now();
      
      // Start new timer
      timerRef.current = setTimeout(() => {
        console.log("[useAutoPlayOnSilence] Timer fired, attempting auto-play");
        
        // Double-check conditions before playing
        const timeSinceMicClick = Date.now() - micButtonClickedTimeRef.current;
        const micButtonRecentlyClicked = timeSinceMicClick < 3000; // 3 seconds
        const translationAlreadyPlayed = translation === lastPlayedTranslationRef.current;
        
        // Filter out "Translating..." and other status messages
        const validTranslation = translation && 
          translation !== "Translating..." && 
          translation !== "No translation yet." &&
          !translation.startsWith("[Translation error:") &&
          !translation.startsWith("[Translation failed") ? translation : "";
        
        if (!isAudioPlaying && canAutoPlay && validTranslation && validTranslation.trim() && !isAutoPlayingRef.current && isMountedRef.current && !micButtonRecentlyClicked && !translationAlreadyPlayed) {
          console.log("[useAutoPlayOnSilence] Starting auto-play");
          isAutoPlayingRef.current = true;
          lastPlayedTranslationRef.current = translation; // Mark as played
          
          // Fire TTS using browser API
          if ("speechSynthesis" in window) {
            // Cancel any existing speech synthesis to prevent overlap
            window.speechSynthesis.cancel();
            
            const cleanText = cleanTextForSpeech(translation, lang);
            const utter = new window.SpeechSynthesisUtterance(cleanText);
            utter.lang = lang;
            
            // Set the selected voice if available
            const selectedVoice = localStorage.getItem("rightSelectedVoice");
            if (selectedVoice && window.speechSynthesis.getVoices) {
              const voices = window.speechSynthesis.getVoices();
              console.log("[useAutoPlayOnSilence] Available voices for auto-play:", voices.map(v => `${v.name} (${v.lang})`));
              const selectedVoiceObj = voices.find(voice => voice.voiceURI === selectedVoice);
              if (selectedVoiceObj) {
                console.log("Auto-play using voice:", selectedVoiceObj.name);
                utter.voice = selectedVoiceObj;
              } else {
                // Enhanced voice selection logic for auto-play
                const bestVoice = findBestVoiceForLanguage(voices, lang);
                if (bestVoice) {
                  console.log("Auto-play using best available voice for", lang, ":", bestVoice.name);
                  utter.voice = bestVoice;
                } else {
                  console.log("[useAutoPlayOnSilence] No suitable voice found for language:", lang);
                }
              }
            } else if (window.speechSynthesis.getVoices) {
              // Enhanced voice selection logic when no voice is stored
              const voices = window.speechSynthesis.getVoices();
              console.log("[useAutoPlayOnSilence] No stored voice, available voices:", voices.map(v => `${v.name} (${v.lang})`));
              const bestVoice = findBestVoiceForLanguage(voices, lang);
              if (bestVoice) {
                console.log("Auto-play using best available voice for", lang, ":", bestVoice.name);
                utter.voice = bestVoice;
              } else {
                console.log("[useAutoPlayOnSilence] No suitable voice found for language:", lang);
              }
            }
            
            setAudioPlaying(true);
            onAudioStart?.(); // Notify that audio is starting (for mic muting)
            
            utter.onend = () => {
              console.log("[useAutoPlayOnSilence] Auto-play ended");
              if (isMountedRef.current) {
              setAudioPlaying(false);
                isAutoPlayingRef.current = false;
                micReactivatedRef.current = true; // Mark that mic has been reactivated
                onAudioEnd?.(); // Notify that audio has ended (for mic unmuting)
              }
            };
            utter.onerror = (error) => {
              console.error("[useAutoPlayOnSilence] Auto-play error:", error);
              if (isMountedRef.current) {
              setAudioPlaying(false);
                isAutoPlayingRef.current = false;
                onAudioEnd?.(); // Notify that audio has ended (for mic unmuting)
              }
            };
            window.speechSynthesis.speak(utter);
          }
        } else {
          console.log("[useAutoPlayOnSilence] Conditions changed, not playing");
        }
      }, timeoutMs);
    } else {
      // If transcript hasn't changed, check if enough time has passed
      const timeSinceLastChange = Date.now() - lastTranscriptTimeRef.current;
      if (timeSinceLastChange >= timeoutMs) {
        console.log("[useAutoPlayOnSilence] Enough time passed since last change, attempting auto-play");
        
        // Start timer for immediate play
        timerRef.current = setTimeout(() => {
          const timeSinceMicClick = Date.now() - micButtonClickedTimeRef.current;
          const micButtonRecentlyClicked = timeSinceMicClick < 3000; // 3 seconds
          const translationAlreadyPlayed = translation === lastPlayedTranslationRef.current;
          
          // Filter out "Translating..." and other status messages
          const validTranslation = translation && 
            translation !== "Translating..." && 
            translation !== "No translation yet." &&
            !translation.startsWith("[Translation error:") &&
            !translation.startsWith("[Translation failed") ? translation : "";
          
          if (!isAudioPlaying && canAutoPlay && validTranslation && validTranslation.trim() && !isAutoPlayingRef.current && isMountedRef.current && !micButtonRecentlyClicked && !translationAlreadyPlayed) {
            console.log("[useAutoPlayOnSilence] Starting auto-play (stable transcript)");
            isAutoPlayingRef.current = true;
            lastPlayedTranslationRef.current = translation; // Mark as played
            
            if ("speechSynthesis" in window) {
              // Cancel any existing speech synthesis to prevent overlap
              window.speechSynthesis.cancel();
              
              const cleanText = cleanTextForSpeech(translation, lang);
              const utter = new window.SpeechSynthesisUtterance(cleanText);
              utter.lang = lang;
              
              const selectedVoice = localStorage.getItem("rightSelectedVoice");
              if (selectedVoice && window.speechSynthesis.getVoices) {
                const voices = window.speechSynthesis.getVoices();
                console.log("[useAutoPlayOnSilence] Available voices for auto-play (stable):", voices.map(v => `${v.name} (${v.lang})`));
                const selectedVoiceObj = voices.find(voice => voice.voiceURI === selectedVoice);
                if (selectedVoiceObj) {
                  console.log("Auto-play using voice:", selectedVoiceObj.name);
                  utter.voice = selectedVoiceObj;
                } else {
                  // Enhanced voice selection logic for auto-play
                  const bestVoice = findBestVoiceForLanguage(voices, lang);
                  if (bestVoice) {
                    console.log("Auto-play using best available voice for", lang, ":", bestVoice.name);
                    utter.voice = bestVoice;
                  } else {
                    console.log("[useAutoPlayOnSilence] No suitable voice found for language:", lang);
                  }
                }
              } else if (window.speechSynthesis.getVoices) {
                // Enhanced voice selection logic when no voice is stored
                const voices = window.speechSynthesis.getVoices();
                console.log("[useAutoPlayOnSilence] No stored voice, available voices (stable):", voices.map(v => `${v.name} (${v.lang})`));
                const bestVoice = findBestVoiceForLanguage(voices, lang);
                if (bestVoice) {
                  console.log("Auto-play using best available voice for", lang, ":", bestVoice.name);
                  utter.voice = bestVoice;
                } else {
                  console.log("[useAutoPlayOnSilence] No suitable voice found for language:", lang);
                }
              }
              
              setAudioPlaying(true);
              onAudioStart?.();
              
              utter.onend = () => {
                console.log("[useAutoPlayOnSilence] Auto-play ended");
                if (isMountedRef.current) {
                  setAudioPlaying(false);
                  isAutoPlayingRef.current = false;
                  micReactivatedRef.current = true; // Mark that mic has been reactivated
                  onAudioEnd?.();
                }
              };
              utter.onerror = (error) => {
                console.error("[useAutoPlayOnSilence] Auto-play error:", error);
                if (isMountedRef.current) {
                  setAudioPlaying(false);
                  isAutoPlayingRef.current = false;
                  onAudioEnd?.();
                }
              };
              window.speechSynthesis.speak(utter);
            }
          }
        }, 100); // Small delay to ensure state is stable
      } else {
        // Set timer for remaining time
        const remainingTime = timeoutMs - timeSinceLastChange;
        console.log(`[useAutoPlayOnSilence] Setting timer for remaining time: ${remainingTime}ms`);
        
        timerRef.current = setTimeout(() => {
          const timeSinceMicClick = Date.now() - micButtonClickedTimeRef.current;
          const micButtonRecentlyClicked = timeSinceMicClick < 3000; // 3 seconds
          const translationAlreadyPlayed = translation === lastPlayedTranslationRef.current;
          
          // Filter out "Translating..." and other status messages
          const validTranslation = translation && 
            translation !== "Translating..." && 
            translation !== "No translation yet." &&
            !translation.startsWith("[Translation error:") &&
            !translation.startsWith("[Translation failed") ? translation : "";
          
          if (!isAudioPlaying && canAutoPlay && validTranslation && validTranslation.trim() && !isAutoPlayingRef.current && isMountedRef.current && !micButtonRecentlyClicked && !translationAlreadyPlayed) {
            console.log("[useAutoPlayOnSilence] Starting auto-play (remaining time)");
            isAutoPlayingRef.current = true;
            lastPlayedTranslationRef.current = translation; // Mark as played
            
            if ("speechSynthesis" in window) {
              // Cancel any existing speech synthesis to prevent overlap
              window.speechSynthesis.cancel();
              
              const cleanText = cleanTextForSpeech(translation, lang);
              const utter = new window.SpeechSynthesisUtterance(cleanText);
              utter.lang = lang;
              
              const selectedVoice = localStorage.getItem("rightSelectedVoice");
              if (selectedVoice && window.speechSynthesis.getVoices) {
                const voices = window.speechSynthesis.getVoices();
                console.log("[useAutoPlayOnSilence] Available voices for auto-play (remaining):", voices.map(v => `${v.name} (${v.lang})`));
                const selectedVoiceObj = voices.find(voice => voice.voiceURI === selectedVoice);
                if (selectedVoiceObj) {
                  console.log("Auto-play using voice:", selectedVoiceObj.name);
                  utter.voice = selectedVoiceObj;
                } else {
                  // Enhanced voice selection logic for auto-play
                  const bestVoice = findBestVoiceForLanguage(voices, lang);
                  if (bestVoice) {
                    console.log("Auto-play using best available voice for", lang, ":", bestVoice.name);
                    utter.voice = bestVoice;
                  } else {
                    console.log("[useAutoPlayOnSilence] No suitable voice found for language:", lang);
                  }
                }
              } else if (window.speechSynthesis.getVoices) {
                // Enhanced voice selection logic when no voice is stored
                const voices = window.speechSynthesis.getVoices();
                console.log("[useAutoPlayOnSilence] No stored voice, available voices (remaining):", voices.map(v => `${v.name} (${v.lang})`));
                const bestVoice = findBestVoiceForLanguage(voices, lang);
                if (bestVoice) {
                  console.log("Auto-play using best available voice for", lang, ":", bestVoice.name);
                  utter.voice = bestVoice;
                } else {
                  console.log("[useAutoPlayOnSilence] No suitable voice found for language:", lang);
                }
              }
              
              setAudioPlaying(true);
              onAudioStart?.();
              
              utter.onend = () => {
                console.log("[useAutoPlayOnSilence] Auto-play ended");
                if (isMountedRef.current) {
                  setAudioPlaying(false);
                  isAutoPlayingRef.current = false;
                  micReactivatedRef.current = true; // Mark that mic has been reactivated
                  onAudioEnd?.();
                }
              };
              utter.onerror = (error) => {
                console.error("[useAutoPlayOnSilence] Auto-play error:", error);
                if (isMountedRef.current) {
                  setAudioPlaying(false);
                  isAutoPlayingRef.current = false;
                  onAudioEnd?.();
                }
              };
              window.speechSynthesis.speak(utter);
            }
          }
        }, remainingTime);
      }
    }
  }, [isRecording, canAutoPlay, isAudioPlaying, transcript, translation, timeoutMs, lang, onAudioStart, onAudioEnd, onTranscriptClear]);

  // Function to clear timers and reset state
  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isAutoPlayingRef.current = false;
    micButtonClickedTimeRef.current = Date.now();
    console.log("[useAutoPlayOnSilence] Timers cleared");
  };

  // Expose clear function globally for external access
  if (typeof window !== 'undefined') {
    (window as any).clearAutoPlayTimers = clearTimers;
  }

  // Helper function to find best voice for language
  const findBestVoiceForLanguage = (voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;
    
    console.log(`[useAutoPlayOnSilence] Finding best voice for language: ${langCode}`);
    console.log(`[useAutoPlayOnSilence] Available voices:`, voices.map(v => `${v.name} (${v.lang})`));
    
    let bestVoice = null;
    
    // First, try to find an exact language match
    bestVoice = voices.find(v => v.lang === langCode);
    if (bestVoice) {
      console.log(`[useAutoPlayOnSilence] Found exact language match: ${bestVoice.name} (${bestVoice.lang})`);
      return bestVoice;
    }
    
    // If no exact match, try to find a voice that starts with the language code
    if (!bestVoice) {
      bestVoice = voices.find(v => v.lang.startsWith(langCode));
      if (bestVoice) {
        console.log(`[useAutoPlayOnSilence] Found language prefix match: ${bestVoice.name} (${bestVoice.lang})`);
        return bestVoice;
      }
    }
    
    // If still no match, try to find a voice with similar language family
    if (!bestVoice) {
      const langFamily = getLanguageFamily(langCode);
      console.log(`[useAutoPlayOnSilence] Language family for ${langCode}: ${langFamily}`);
      bestVoice = voices.find(v => {
        const voiceLangFamily = getLanguageFamily(v.lang);
        return voiceLangFamily === langFamily;
      });
      if (bestVoice) {
        console.log(`[useAutoPlayOnSilence] Found language family match: ${bestVoice.name} (${bestVoice.lang}) - family: ${langFamily}`);
        return bestVoice;
      }
    }
    
    // If still no match, try to find a voice with the same script/alphabet
    if (!bestVoice) {
      const script = getLanguageScript(langCode);
      console.log(`[useAutoPlayOnSilence] Language script for ${langCode}: ${script}`);
      bestVoice = voices.find(v => {
        const voiceScript = getLanguageScript(v.lang);
        return voiceScript === script;
      });
      if (bestVoice) {
        console.log(`[useAutoPlayOnSilence] Found script match: ${bestVoice.name} (${bestVoice.lang}) - script: ${script}`);
        return bestVoice;
      }
    }
    
    // Fallback to first available voice
    if (!bestVoice) {
      bestVoice = voices[0];
      console.log(`[useAutoPlayOnSilence] Using fallback voice: ${bestVoice.name} (${bestVoice.lang})`);
    }
    
    return bestVoice;
  };

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

  // Helper function to clean text for speech synthesis, especially for Tibetan
  const cleanTextForSpeech = (text: string, langCode: string): string => {
    if (langCode === 'bo') {
      const cleaned = text
        .replace(/[>\-]+/g, '') // Remove > and - characters that might be corruption markers
        .replace(/།\s*།/g, '།') // Clean up duplicate Tibetan punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      console.log("[useAutoPlayOnSilence] Cleaned Tibetan text for auto-play:", cleaned);
      return cleaned;
    }
    return text;
  };
}
