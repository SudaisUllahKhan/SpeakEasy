"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GoogleAuthInner() {
  const searchParams = useSearchParams();
  // mobileRedirect is the deep-link URI the mobile app expects (exp:// in Expo Go, speakeasy:// in prod)
  const mobileRedirect = searchParams.get("mobileRedirect") ?? "";
  const [status, setStatus] = useState("Connecting to Google...");

  useEffect(() => {
    async function startOAuth() {
      try {
        // Step 1: get CSRF token and sign out any existing web session.
        // Chrome Custom Tabs shares cookies with the system browser, so if a
        // previous user signed in and then only signed out in the app (not the
        // browser), the stale next-auth.session-token cookie would cause
        // mobile-token to return the wrong user's token.
        const csrfRes = await fetch("/api/auth/csrf");
        const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

        await fetch("/api/auth/signout", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ csrfToken, callbackUrl: "/" }),
        });

        // Step 2: fetch a fresh CSRF token (the signout invalidates the old one)
        const freshCsrfRes = await fetch("/api/auth/csrf");
        const { csrfToken: freshCsrf } = (await freshCsrfRes.json()) as { csrfToken: string };

        // Step 3: build callbackUrl — include mobileRedirect so mobile-token
        // knows which scheme to redirect to (exp:// in Expo Go, speakeasy:// standalone)
        const mobileTokenUrl = new URL("/api/auth/mobile-token", window.location.origin);
        if (mobileRedirect) mobileTokenUrl.searchParams.set("mobileRedirect", mobileRedirect);

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/auth/signin/google";
        form.style.display = "none";

        const addInput = (name: string, value: string) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        };

        addInput("csrfToken", freshCsrf);
        addInput("callbackUrl", mobileTokenUrl.toString());

        document.body.appendChild(form);
        form.submit();
      } catch {
        setStatus("Failed to connect. Please try again.");
      }
    }
    void startOAuth();
  }, [mobileRedirect]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#f9fafb",
      color: "#374151",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <p style={{ fontSize: 18, fontWeight: 600 }}>{status}</p>
    </div>
  );
}

export default function GoogleAuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    }>
      <GoogleAuthInner />
    </Suspense>
  );
}
