"use client";

import { useRef, useEffect, useState } from "react";

interface TurnstileSimpleProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

// Định nghĩa interface cho Turnstile API
interface TurnstileAPI {
  render: (
    container: HTMLDivElement | string,
    options: {
      sitekey: string;
      theme?: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: (error: string) => void;
      // Sử dụng Record để định nghĩa index signature chính xác hơn
      [key: string]:
        | string
        | boolean
        | (() => void)
        | ((token: string) => void)
        | ((error: string) => void)
        | undefined;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

export function TurnstileSimple({
  siteKey,
  onVerify,
  onExpire,
  theme = "auto",
  className = "",
}: TurnstileSimpleProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackContainerRef = useRef<HTMLDivElement>(null);

  // Tải script Turnstile
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Thiết lập callback
    const callbackName = `onTurnstileCallback_${Date.now().toString(36)}`;

    // Thêm callback toàn cục
    // @ts-expect-error - Dynamic property assignment to window
    window[callbackName] = (token: string) => {
      onVerify(token);
    };

    // Kiểm tra nếu script đã tồn tại
    if (document.querySelector('script[src*="turnstile"]')) {
      setIsScriptLoaded(true);
      return () => {
        // @ts-expect-error - Dynamic property deletion from window
        delete window[callbackName];
      };
    }

    // Tạo và thêm script vào trang
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsScriptLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // @ts-expect-error - Dynamic property deletion from window
      delete window[callbackName];
    };
  }, [onVerify]);

  // Render Turnstile widget khi script đã tải xong
  useEffect(() => {
    if (
      !isScriptLoaded ||
      !containerRef.current ||
      isRendered ||
      typeof window === "undefined"
    ) {
      return;
    }

    // Đợi để đảm bảo window.turnstile có sẵn
    const timeoutId = setTimeout(() => {
      if (!window.turnstile) {
        return;
      }

      try {
        // Sử dụng type assertion để tránh lỗi TypeScript
        const turnstile = window.turnstile as unknown as TurnstileAPI;

        turnstile.render(containerRef.current!, {
          sitekey: siteKey,
          theme: theme,
          callback: (token: string) => {
            onVerify(token);
          },
          "expired-callback": () => {
            onExpire?.();
          },
        });
        setIsRendered(true);
      } catch (err) {
        // Xử lý lỗi nếu có
        console.error("Lỗi khi render widget Turnstile:", err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isScriptLoaded, siteKey, theme, onVerify, onExpire, isRendered]);

  // Thêm fallback widget chỉ ở phía client thay vì render trực tiếp trong JSX
  useEffect(() => {
    // Chỉ chạy ở phía client và khi script chưa được tải
    if (
      typeof window === "undefined" ||
      isScriptLoaded ||
      !fallbackContainerRef.current
    ) {
      return;
    }

    // Tạo script element
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;

    // Tạo div cho widget
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "cf-turnstile";
    widgetDiv.dataset.sitekey = siteKey;
    widgetDiv.dataset.theme = theme || "auto";

    // Lưu lại ref hiện tại để sử dụng trong cleanup
    const currentFallbackContainer = fallbackContainerRef.current;

    // Thêm các phần tử vào DOM
    document.head.appendChild(script);
    currentFallbackContainer.appendChild(widgetDiv);

    // Cleanup khi component unmount
    return () => {
      if (currentFallbackContainer.contains(widgetDiv)) {
        currentFallbackContainer.removeChild(widgetDiv);
      }
      // Script sẽ được giữ lại vì có thể các component khác cũng đang sử dụng
    };
  }, [isScriptLoaded, siteKey, theme]);

  return (
    <div className={className}>
      {!isScriptLoaded && (
        <div className="flex h-[70px] w-full items-center justify-center rounded-md border bg-muted/30 p-2">
          <p className="text-sm text-muted-foreground">Đang tải captcha...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className={isScriptLoaded ? "turnstile-container" : "hidden"}
      />
      {/* Container để thêm fallback widget bằng JavaScript */}
      <div
        ref={fallbackContainerRef}
        className={isScriptLoaded ? "hidden" : ""}
      />
    </div>
  );
}

export default TurnstileSimple;
