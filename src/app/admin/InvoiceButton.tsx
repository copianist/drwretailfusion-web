"use client";
import { useState } from "react";

export default function InvoiceButton({ id, defaultDollars }: { id: string; defaultDollars: number }) {
  const [dollars, setDollars] = useState(String(defaultDollars));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="row">
      <input className="mini" value={dollars} onChange={(e) => setDollars(e.target.value)} aria-label="Amount in USD" />
      <button
        className="btn small"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await fetch("/api/admin/invoice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultationId: id, amountCents: Math.round(Number(dollars) * 100) }) });
          const data = await res.json().catch(() => ({}));
          if (res.ok) window.location.reload();
          else { setMsg(data.error || "Failed"); setBusy(false); }
        }}
      >
        {busy ? "Sending…" : "Send invoice"}
      </button>
      {msg && <span className="error small">{msg}</span>}
    </div>
  );
}
