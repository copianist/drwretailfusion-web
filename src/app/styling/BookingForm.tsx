"use client";
import { useState } from "react";

export default function BookingForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setState("done");
    else { setError(data.error || "Something went wrong"); setState("idle"); }
  }
  if (state === "done")
    return (
      <div className="panel">
        <h3>Request received</h3>
        <p>Your stylist will confirm the time and email a secure invoice. You can also track it under <a href="/account">your account</a>.</p>
      </div>
    );
  return (
    <form className="form panel" onSubmit={onSubmit}>
      <h3>Request a consultation</h3>
      <label>Full name<input name="name" required defaultValue={defaultName} /></label>
      <label>Email<input name="email" type="email" required defaultValue={defaultEmail} /></label>
      <label>Preferred date & time<input name="preferredDate" required placeholder="e.g. Tue 2 Dec, afternoon" /></label>
      <label>What are you shopping for?<textarea name="notes" rows={4} placeholder="Occasion, style goals, sizes…" /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn primary wide" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Request consultation"}</button>
    </form>
  );
}
