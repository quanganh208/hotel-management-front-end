"use client";

import { useState, useCallback, useEffect } from "react";

type TurnstileOptions = {
  sitekey: string;
  onSuccess?: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  onBeforeInteractive?: () => void;
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  appearance?: "always" | "interaction-only" | "execute-only";
  retry?: "auto" | "never";
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions,
      ) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export const useTurnstile = (options: TurnstileOptions) => {
  const [token, setToken] = useState<string | null>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Load Turnstile script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip if script is already loaded
    if (document.querySelector("script#turnstile-script")) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    // Callback when script is loaded
    window.onloadTurnstileCallback = () => {
      setIsLoaded(true);
    };

    document.body.appendChild(script);

    return () => {
      window.onloadTurnstileCallback = undefined;
      if (document.querySelector("script#turnstile-script")) {
        document.querySelector("script#turnstile-script")?.remove();
      }
    };
  }, []);

  // Initialize widget when script is loaded and container is ready
  useEffect(() => {
    if (!isLoaded || !containerRef || !window.turnstile || isInitialized)
      return;

    try {
      const id = window.turnstile.render(containerRef, {
        ...options,
        onSuccess: (token) => {
          setToken(token);
          options.onSuccess?.(token);
        },
        onExpire: () => {
          setToken(null);
          options.onExpire?.();
        },
        onError: (error) => {
          setToken(null);
          options.onError?.(error);
        },
      });

      setWidgetId(id);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing Turnstile:", error);
    }

    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [isLoaded, containerRef, options, isInitialized, widgetId]);

  // Reset the widget
  const reset = useCallback(() => {
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
      setToken(null);
    }
  }, [widgetId]);

  // Get container ref callback
  const ref = useCallback((node: HTMLDivElement | null) => {
    setContainerRef(node);
  }, []);

  return { token, ref, reset, isLoaded, isInitialized };
};

export default useTurnstile;
