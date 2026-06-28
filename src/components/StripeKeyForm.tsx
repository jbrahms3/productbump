"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  reconnect?: boolean;
}

export default function StripeKeyForm({ productId, reconnect = false }: Props) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/connect/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, restrictedKey: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (reconnect && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary justify-center text-sm"
      >
        Reconnect with a different key
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        className="input font-mono text-sm"
        placeholder="rk_live_... or rk_test_..."
        value={key}
        onChange={(e) => setKey(e.target.value)}
        required
      />
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn-primary justify-center py-2.5"
        disabled={loading || !key}
      >
        {loading ? "Connecting…" : reconnect ? "Save new key →" : "Connect Stripe →"}
      </button>
    </form>
  );
}
