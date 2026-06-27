"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "AI", "Developer", "Design", "Education", "Finance",
  "Health", "Marketing", "Productivity", "Other",
];

export default function SubmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    websiteUrl: "",
    logoUrl: "",
    makerName: "",
    makerEmail: "",
    category: "Productivity",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      // Redirect to the connect-stripe page for this product
      router.push(`/connect/stripe?productId=${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Product name *</label>
          <input
            className="input"
            placeholder="Acme SaaS"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Category *</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Tagline *</label>
        <input
          className="input"
          placeholder="The best way to manage your team's work"
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          maxLength={100}
          required
        />
        <p className="mt-1 text-xs text-gray-400">{form.tagline.length}/100</p>
      </div>

      <div>
        <label className="label">Description *</label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="Tell people what your product does and who it's for..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Website URL *</label>
        <input
          className="input"
          type="url"
          placeholder="https://yourproduct.com"
          value={form.websiteUrl}
          onChange={(e) => set("websiteUrl", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Logo URL</label>
        <input
          className="input"
          type="url"
          placeholder="https://yourproduct.com/logo.png"
          value={form.logoUrl}
          onChange={(e) => set("logoUrl", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Your name *</label>
          <input
            className="input"
            placeholder="Jane Doe"
            value={form.makerName}
            onChange={(e) => set("makerName", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Your email *</label>
          <input
            className="input"
            type="email"
            placeholder="jane@yourproduct.com"
            value={form.makerEmail}
            onChange={(e) => set("makerEmail", e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button type="submit" className="btn-primary justify-center py-3 text-base" disabled={loading}>
          {loading ? "Submitting…" : "Submit & Connect Stripe →"}
        </button>
        <p className="text-center text-xs text-gray-400">
          After submitting, you&apos;ll connect your Stripe account to verify subscribers.
        </p>
      </div>
    </form>
  );
}
