import { useState, useCallback } from "react";

interface TranslationParams {
  text: string;
  from: string;
  to: string;
}

/**
 * Clean text to prevent corruption of Unicode characters, especially for Tibetan
 */
function cleanTextForTranslation(text: string, fromLang: string, toLang: string): string {
  // For Tibetan and other Unicode-heavy languages, ensure proper encoding
  if (fromLang === 'bo' || toLang === 'bo') {
    console.log("[useTranslation] Cleaning Tibetan text:", { original: text, length: text.length });
    
    // Remove any potential corruption markers that might be added by translation services
    let cleaned = text
      .replace(/[>\-]+/g, '') // Remove > and - characters that might be corruption markers
      .replace(/།\s*།/g, '།') // Clean up duplicate Tibetan punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log("[useTranslation] Cleaned Tibetan text:", { cleaned, length: cleaned.length });
    return cleaned;
  }
  
  return text.trim();
}

/**
 * Hook for translating text using multiple translation APIs with fallbacks.
 * Supports OpenAI, MyMemory (free), LibreTranslate, Google Translate, and other services.
 */
export function useTranslation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateWithOpenAI = useCallback(async (params: TranslationParams): Promise<string> => {
    const openaiKey = localStorage.getItem("openai_api_key");
    if (!openaiKey) {
      throw new Error("OpenAI API key not found");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text from ${params.from} to ${params.to}. Only return the translated text, nothing else. For Tibetan (bo) language, ensure proper Unicode character preservation.`
          },
          {
            role: "user",
            content: params.text
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content?.trim() || "";
    return cleanTextForTranslation(result, params.from, params.to);
  }, []);

  const translateWithMyMemory = useCallback(async (params: TranslationParams): Promise<string> => {
    // MyMemory is a free translation service that works well
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(params.text)}&langpair=${params.from}|${params.to}`;
    
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("MyMemory API unavailable");
    }

    const data = await response.json();
    const result = data.responseData?.translatedText || data.responseData?.translation || "";
    return cleanTextForTranslation(result, params.from, params.to);
  }, []);

  const translateWithLibreTranslate = useCallback(async (params: TranslationParams): Promise<string> => {
    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: params.text,
        source: params.from,
        target: params.to,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error("LibreTranslate API unavailable");
    }

    const data = await response.json();
    const result = data.translatedText || "";
    return cleanTextForTranslation(result, params.from, params.to);
  }, []);

  const translateWithGoogle = useCallback(async (params: TranslationParams): Promise<string> => {
    // Use a simple Google Translate API endpoint (no API key required)
    // This uses a public Google Translate service
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${params.from}&tl=${params.to}&dt=t&q=${encodeURIComponent(params.text)}`;
    
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Google Translate API unavailable");
    }

    const data = await response.json();
    // Google Translate returns an array where the first element contains translation segments
    const result = data[0]?.map((segment: any) => segment[0]).join("") || "";
    return cleanTextForTranslation(result, params.from, params.to);
  }, []);

  const translate = useCallback(
    async (params: TranslationParams): Promise<string> => {
      setLoading(true);
      setError(null);
      
      try {
        if (!params.text.trim()) return "";

        // Clean input text
        const cleanedInput = cleanTextForTranslation(params.text, params.from, params.to);
        console.log("[useTranslation] Translation request:", { 
          from: params.from, 
          to: params.to, 
          originalText: params.text,
          cleanedInput,
          isTibetan: params.from === 'bo' || params.to === 'bo'
        });

        // Get the selected translation provider from settings
        const selectedProvider = localStorage.getItem("translation_provider") || "auto";

        // Handle specific provider selection
        if (selectedProvider === "openai") {
          try {
            console.log("[useTranslation] Using OpenAI (selected provider)");
            const result = await translateWithOpenAI({ ...params, text: cleanedInput });
            setLoading(false);
            return result;
          } catch (openaiError: any) {
            console.warn("[useTranslation] OpenAI translation failed:", openaiError.message);
            setLoading(false);
            return `[OpenAI failed] ${cleanedInput}`;
          }
        }

        if (selectedProvider === "mymemory") {
          try {
            console.log("[useTranslation] Using MyMemory (selected provider)");
            const result = await translateWithMyMemory({ ...params, text: cleanedInput });
            setLoading(false);
            return result;
          } catch (memoryError: any) {
            console.warn("[useTranslation] MyMemory translation failed:", memoryError.message);
            setLoading(false);
            return `[MyMemory failed] ${cleanedInput}`;
          }
        }

        if (selectedProvider === "libretranslate") {
          try {
            console.log("[useTranslation] Using LibreTranslate (selected provider)");
            const result = await translateWithLibreTranslate({ ...params, text: cleanedInput });
            setLoading(false);
            return result;
          } catch (libreError: any) {
            console.warn("[useTranslation] LibreTranslate translation failed:", libreError.message);
            setLoading(false);
            return `[LibreTranslate failed] ${cleanedInput}`;
          }
        }

        if (selectedProvider === "googletranslate") {
          try {
            console.log("[useTranslation] Using Google Translate (selected provider)");
            const result = await translateWithGoogle({ ...params, text: cleanedInput });
            setLoading(false);
            return result;
          } catch (googleError: any) {
            console.warn("[useTranslation] Google Translate translation failed:", googleError.message);
            setLoading(false);
            return `[Google Translate failed] ${cleanedInput}`;
          }
        }

        // Auto mode - try providers in order
        if (selectedProvider === "auto") {
          // Try OpenAI first if API key is available
          const openaiKey = localStorage.getItem("openai_api_key");
          if (openaiKey) {
            try {
              console.log("[useTranslation] Attempting OpenAI translation");
              const result = await translateWithOpenAI({ ...params, text: cleanedInput });
              setLoading(false);
              return result;
            } catch (openaiError: any) {
              console.warn("[useTranslation] OpenAI translation failed:", openaiError.message);
              // Don't retry OpenAI if it's a quota/rate limit error
              if (openaiError.message.includes("quota") || openaiError.message.includes("429")) {
                console.log("[useTranslation] Skipping OpenAI due to quota/rate limit");
              } else {
                // Continue to fallback
              }
            }
          }

          // Try Google Translate as second option (free, reliable)
          try {
            console.log("[useTranslation] Attempting Google Translate translation");
            const result = await translateWithGoogle({ ...params, text: cleanedInput });
            setLoading(false);
            return result;
          } catch (googleError) {
            console.warn("[useTranslation] Google Translate translation failed:", googleError);
            // Continue to next fallback
          }

          // Try MyMemory as third option (free, no CORS issues)
          try {
            console.log("[useTranslation] Attempting MyMemory translation");
            const result = await translateWithMyMemory({ ...params, text: cleanedInput });
            setLoading(false);
            return result;
          } catch (memoryError) {
            console.warn("[useTranslation] MyMemory translation failed:", memoryError);
            // Continue to next fallback
          }

          // Try LibreTranslate as fourth option
          try {
            console.log("[useTranslation] Attempting LibreTranslate translation");
            const result = await translateWithLibreTranslate({ ...params, text: cleanedInput });
            setLoading(false);
            return result;
          } catch (libreError) {
            console.warn("[useTranslation] LibreTranslate translation failed:", libreError);
            // Continue to final fallback
          }
        }

        // Final fallback - return original text with note
        setLoading(false);
        return `[Translation unavailable] ${cleanedInput}`;
        
      } catch (e: any) {
        setError(e.message || "Translation failed");
        setLoading(false);
        return `[Translation error] ${params.text}`;
      }
    },
    [translateWithOpenAI, translateWithMyMemory, translateWithLibreTranslate, translateWithGoogle]
  );

  return { translate, loading, error };
}
