import axios from "axios";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

const isServer = typeof window === "undefined";
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Session caching mechanism
let cachedSession: Session | null = null;
let sessionExpiry = 0;
const SESSION_MAX_AGE = 5 * 60 * 1000; // 5 minutes

async function getSessionCached() {
  const now = Date.now();

  // Return cached session if still valid
  if (cachedSession && now < sessionExpiry) {
    return cachedSession;
  }

  // Fetch new session only when needed
  const session = await getSession();

  // Only cache if session exists
  if (session) {
    cachedSession = session;
    sessionExpiry = now + SESSION_MAX_AGE;
  } else {
    // Clear cache if no session
    cachedSession = null;
    sessionExpiry = 0;
  }

  return session;
}

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Chỉ gọi getSession ở client-side
    if (!isServer) {
      const session = await getSessionCached();
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Chỉ xử lý logout ở client-side
    if (!isServer && error.response?.status === 401) {
      // Clear cache on 401 errors
      cachedSession = null;
      sessionExpiry = 0;

      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: true, callbackUrl: "/auth/login" });
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
