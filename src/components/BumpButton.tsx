"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  makerUserId: string | null;
}

export default function BumpButton({ productId, makerUserId }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.id !== makerUserId) return null;

  async function handleBump() {
    if (!confirm("Manually bump this product off the homepage? This is for testing only.")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}/bump`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to bump");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleBump}
        disabled={loading}
        className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
      >
        {loading ? "Bumping…" : "🧪 Manually bump (testing)"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
