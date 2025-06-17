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
    
    if (!isRecording || !canAutoPlay || isAudioPlaying || !translation.trim() || isAutoPlayingRef.current || !isMountedRef.current || micButtonRecentlyClicked || translationAlreadyPlayed) {
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
        
        if (!isAudioPlaying && canAutoPlay && translation.trim() && isRecording && !isAutoPlayingRef.current && isMountedRef.current && !micButtonRecentlyClicked && !translationAlreadyPlayed) {
          console.log("[useAutoPlayOnSilence] Starting auto-play");
          isAutoPlayingRef.current = true;
          lastPlayedTranslationRef.current = translation; // Mark as played
          
          // Fire TTS using browser API
          if ("speechSynthesis" in window) {
            // Cancel any existing speech synthesis to prevent overlap
            window.speechSynthesis.cancel();
            
            const utter = new window.SpeechSynthesisUtterance(translation);
            utter.lang = lang;
            
            // Set the selected voice if available
            const selectedVoice = localStorage.getItem("rightSelectedVoice");
            if (selectedVoice && window.speechSynthesis.getVoices) {
              const voices = window.speechSynthesis.getVoices();
              const selectedVoiceObj = voices.find(voice => voice.voiceURI === selectedVoice);
              if (selectedVoiceObj) {
                console.log("Auto-play using voice:", selectedVoiceObj.name);
                utter.voice = selectedVoiceObj;
              }
            }
            
            setAudioPlaying(true);
            onAudioStart?.(); // Notify that audio is starting (for mic muting)
            
            // Clear the transcript after a short delay to prevent showing old text
            setTimeout(() => {
              if (isMountedRef.current) {
                console.log("[useAutoPlayOnSilence] Clearing transcript after auto-play start");
                onTranscriptClear?.();
              }
            }, 500); // Small delay to ensure audio has started
            
            utter.onend = () => {
              console.log("[useAutoPlayOnSilence] Auto-play ended");
              if (isMountedRef.current) {
                setAudioPlaying(false);
                isAutoPlayingRef.current = false;
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
          
          if (!isAudioPlaying && canAutoPlay && translation.trim() && isRecording && !isAutoPlayingRef.current && isMountedRef.current && !micButtonRecentlyClicked && !translationAlreadyPlayed) {
            console.log("[useAutoPlayOnSilence] Starting auto-play (stable transcript)");
            isAutoPlayingRef.current = true;
            lastPlayedTranslationRef.current = translation; // Mark as played
            
            if ("speechSynthesis" in window) {
              // Cancel any existing speech synthesis to prevent overlap
              window.speechSynthesis.cancel();
              
              const utter = new window.SpeechSynthesisUtterance(translation);
              utter.lang = lang;
              
              const selectedVoice = localStorage.getItem("rightSelectedVoice");
              if (selectedVoice && window.speechSynthesis.getVoices) {
                const voices = window.speechSynthesis.getVoices();
                const selectedVoiceObj = voices.find(voice => voice.voiceURI === selectedVoice);
                if (selectedVoiceObj) {
                  console.log("Auto-play using voice:", selectedVoiceObj.name);
                  utter.voice = selectedVoiceObj;
                }
              }
              
              setAudioPlaying(true);
              onAudioStart?.();
              
              // Clear the transcript after a short delay to prevent showing old text
              setTimeout(() => {
                if (isMountedRef.current) {
                  console.log("[useAutoPlayOnSilence] Clearing transcript after auto-play start (stable)");
                  onTranscriptClear?.();
                }
              }, 500); // Small delay to ensure audio has started
              
              utter.onend = () => {
                console.log("[useAutoPlayOnSilence] Auto-play ended");
                if (isMountedRef.current) {
                  setAudioPlaying(false);
                  isAutoPlayingRef.current = false;
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
          
          if (!isAudioPlaying && canAutoPlay && translation.trim() && isRecording && !isAutoPlayingRef.current && isMountedRef.current && !micButtonRecentlyClicked && !translationAlreadyPlayed) {
            console.log("[useAutoPlayOnSilence] Starting auto-play (remaining time)");
            isAutoPlayingRef.current = true;
            lastPlayedTranslationRef.current = translation; // Mark as played
            
            if ("speechSynthesis" in window) {
              // Cancel any existing speech synthesis to prevent overlap
              window.speechSynthesis.cancel();
              
              const utter = new window.SpeechSynthesisUtterance(translation);
              utter.lang = lang;
              
              const selectedVoice = localStorage.getItem("rightSelectedVoice");
              if (selectedVoice && window.speechSynthesis.getVoices) {
                const voices = window.speechSynthesis.getVoices();
                const selectedVoiceObj = voices.find(voice => voice.voiceURI === selectedVoice);
                if (selectedVoiceObj) {
                  console.log("Auto-play using voice:", selectedVoiceObj.name);
                  utter.voice = selectedVoiceObj;
                }
              }
              
              setAudioPlaying(true);
              onAudioStart?.();
              
              // Clear the transcript after a short delay to prevent showing old text
              setTimeout(() => {
                if (isMountedRef.current) {
                  console.log("[useAutoPlayOnSilence] Clearing transcript after auto-play start (remaining)");
                  onTranscriptClear?.();
                }
              }, 500); // Small delay to ensure audio has started
              
              utter.onend = () => {
                console.log("[useAutoPlayOnSilence] Auto-play ended");
                if (isMountedRef.current) {
                  setAudioPlaying(false);
                  isAutoPlayingRef.current = false;
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
}
