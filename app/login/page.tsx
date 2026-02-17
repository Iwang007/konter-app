"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return setMsg(error.message);

    // login sukses -> ke halaman utama
    window.location.href = "/";
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <form onSubmit={onLogin} style={{ width: 360, maxWidth: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Login Konter</h1>
        <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>Masuk pakai email & password Supabase Auth.</p>

        <label style={{ fontSize: 12 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc", marginTop: 6, marginBottom: 12 }}
          placeholder="admin@email.com"
        />

        <label style={{ fontSize: 12 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc", marginTop: 6, marginBottom: 12 }}
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "Masuk..." : "Login"}
        </button>

        {msg ? (
          <div style={{ marginTop: 12, fontSize: 13, color: "crimson" }}>{msg}</div>
        ) : null}
      </form>
    </div>
  );
}
