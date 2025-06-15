
import { useState, useCallback } from "react";

/**
 * Hook for translating text using a translation API, with fallback.
 * API: Uses LibreTranslate (open demo) as a public translation backend.
 * https://libretranslate.de/docs/
 */
export function useTranslation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async ({
      text,
      from,
      to,
    }: {
      text: string;
      from: string;
      to: string;
    }): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        if (!text.trim()) return "";
        // LibreTranslate API
        const response = await fetch("https://libretranslate.de/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            source: from,
            target: to,
            format: "text",
          }),
        });
        if (!response.ok) throw new Error("Translation API unavailable");
        const data = await response.json();
        setLoading(false);
        return data.translatedText || "";
      } catch (e: any) {
        setError(e.message || "Translation failed");
        setLoading(false);
        return `Translation unavailable (fallback): ${text}`;
      }
    },
    []
  );

  return { translate, loading, error };
}
