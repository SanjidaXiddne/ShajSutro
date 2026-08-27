export function getApiBase(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;

    // 1. Localhost / 127.0.0.1 development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      if (envUrl && envUrl.includes("localhost")) {
        return envUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
      }
      return "http://localhost:5000";
    }

    // 2. Local Wi-Fi network (e.g. testing from mobile phone on same network)
    if (
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return `${protocol}//${hostname}:5000`;
      }
    }

    // 3. Live production domain (Vercel or custom domain)
    if (hostname.endsWith("vercel.app") || hostname.includes("shajsutro")) {
      if (envUrl && !envUrl.includes("localhost")) {
        return envUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
      }
      return "https://online-shopping-backend-liart.vercel.app";
    }
  }

  // Fallback for SSR / Node environment
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }

  const raw = envUrl || "https://online-shopping-backend-liart.vercel.app";
  const cleaned = raw.replace(/\/api\/?$/, "").replace(/\/$/, "");
  return cleaned === "" || cleaned === "/" ? "" : cleaned;
}
