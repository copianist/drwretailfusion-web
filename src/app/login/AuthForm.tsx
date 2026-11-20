"use client";
import Link from "next/link";
import { useState } from "react";

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) window.location.href = dest;
    else { setError(data.error || "Something went wrong"); setBusy(false); }
  }

  return (
    <div className="wrap section narrow">
      <h1>{mode === "login" ? "Sign in" : "Create your account"}</h1>
      <form className="form" onSubmit={onSubmit}>
        {mode === "register" && (<label>Full name<input name="name" required autoComplete="name" /></label>)}
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Password<input name="password" type="password" required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary wide" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="muted">
        {mode === "login" ? (<>New to DRW? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></>) : (<>Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link></>)}
      </p>
    </div>
  );
}
