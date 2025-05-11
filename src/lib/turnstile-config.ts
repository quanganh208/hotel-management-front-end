export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

// Kiểm tra token captcha với Cloudflare Turnstile backend
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY || "");
    formData.append("response", token);

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const outcome = await result.json();
    return outcome.success;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}
