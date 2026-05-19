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
        // Get CSRF token then immediately submit the Google sign-in form.
        // No pre-signout needed: the Google provider has prompt=select_account
        // so Google always shows the account picker, and mobile-signout already
        // deletes the server-side session on logout — stale cookies are harmless.
        const csrfRes = await fetch("/api/auth/csrf");
        const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

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

        addInput("csrfToken", csrfToken);
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
