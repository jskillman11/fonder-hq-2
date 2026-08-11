"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F2F1EC",
        fontFamily: "'Marfa',ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
        letterSpacing: "-.05em",
        padding: 24,
      }}
    >
      <style>{`
        @font-face{font-family:'Marfa';src:url('/fonts/ABCMarfa-Light.otf') format('opentype');font-weight:300;font-style:normal;font-display:swap}
        @font-face{font-family:'Marfa';src:url('/fonts/ABCMarfa-Regular.otf') format('opentype');font-weight:400;font-style:normal;font-display:swap}
        @font-face{font-family:'Marfa';src:url('/fonts/ABCMarfa-Semibold.otf') format('opentype');font-weight:600;font-style:normal;font-display:swap}
      `}</style>
      <div
        style={{
          background: "#fff",
          border: "1px solid #DED9CF",
          borderRadius: 22,
          padding: "40px 36px",
          width: 360,
          maxWidth: "90vw",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(24,26,30,.04), 0 12px 32px rgba(24,26,30,.06)",
        }}
      >
        <Image src="/fonder-logo.png" alt="Fonder" width={52} height={52} style={{ borderRadius: 12, margin: "0 auto" }} priority />

        <h1 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", marginTop: 20 }}>Sign in to Fonder HQ</h1>
        <p style={{ fontSize: 13, color: "#6C6F76", marginTop: 6, lineHeight: 1.5 }}>Your growth program, always current.</p>

        {status === "sent" ? (
          <p style={{ fontSize: 13.5, color: "#6C6F76", marginTop: 22, lineHeight: 1.5 }}>
            Check <strong style={{ color: "#181A1E" }}>{email}</strong> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 26 }}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "13px 20px",
                border: "1px solid #DED9CF",
                borderRadius: 999,
                fontSize: 13.5,
                fontFamily: "inherit",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                display: "block",
                marginTop: 12,
                width: "100%",
                padding: "13px 20px",
                border: "none",
                borderRadius: 999,
                background: "#181A1E",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: status === "sending" ? "default" : "pointer",
                opacity: status === "sending" ? 0.6 : 1,
                boxSizing: "border-box",
              }}
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && <p style={{ color: "#F23400", fontSize: 12.5, marginTop: 10 }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
