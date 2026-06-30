"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "AI", "Developer", "Design", "Education", "Finance",
  "Health", "Marketing", "Productivity", "Other",
];

export default function SubmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SCREENSHOTS = 6;
  const [screenshots, setScreenshots] = useState<{ url: string; preview: string }[]>([]);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotDragging, setScreenshotDragging] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    websiteUrl: "",
    demoVideoUrl: "",
    makerName: "",
    makerEmail: "",
    category: "Productivity",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2 MB.");
      return;
    }
    setError("");
    setLogoUploading(true);
    setLogoPreview(URL.createObjectURL(file));

    const data = new FormData();
    data.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setLogoUrl(json.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLogoPreview(null);
    } finally {
      setLogoUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function removeLogo() {
    setLogoPreview(null);
    setLogoUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadScreenshots(files: FileList | File[]) {
    const slotsLeft = MAX_SCREENSHOTS - screenshots.length;
    if (slotsLeft <= 0) return;
    const toUpload = Array.from(files).slice(0, slotsLeft);

    setScreenshotUploading(true);
    setError("");
    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        setError("Screenshots must be image files.");
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Each screenshot must be under 2 MB.");
        continue;
      }
      const preview = URL.createObjectURL(file);
      const data = new FormData();
      data.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        setScreenshots((s) => [...s, { url: json.url, preview }]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }
    setScreenshotUploading(false);
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadScreenshots(e.target.files);
    e.target.value = "";
  }

  function handleScreenshotDrop(e: React.DragEvent) {
    e.preventDefault();
    setScreenshotDragging(false);
    uploadScreenshots(e.dataTransfer.files);
  }

  function removeScreenshot(index: number) {
    setScreenshots((s) => s.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (logoUploading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logoUrl,
          screenshots: screenshots.map((s) => s.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
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

      {/* Logo upload */}
      <div>
        <label className="label">Logo</label>
        {logoPreview ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoPreview}
              alt="Logo preview"
              className="h-16 w-16 rounded-2xl border border-gray-200 object-contain p-1 shadow-sm"
            />
            <div className="flex flex-col gap-1">
              {logoUploading ? (
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="h-4 w-4 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading…
                </span>
              ) : (
                <span className="text-sm font-medium text-emerald-600">✓ Logo uploaded</span>
              )}
              <button
                type="button"
                onClick={removeLogo}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors text-left"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
              dragging
                ? "border-brand-400 bg-brand-50"
                : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drop your logo here, or <span className="text-brand-600">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP, SVG — max 2 MB</p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div>
        <label className="label">Demo video (optional)</label>
        <input
          className="input"
          type="url"
          placeholder="https://youtube.com/watch?v=... or loom.com/share/..."
          value={form.demoVideoUrl}
          onChange={(e) => set("demoVideoUrl", e.target.value)}
        />
      </div>

      {/* Screenshots */}
      <div>
        <label className="label">Screenshots (optional, up to {MAX_SCREENSHOTS})</label>
        {screenshots.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-3">
            {screenshots.map((s, i) => (
              <div key={s.url} className="group relative overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.preview} alt={`Screenshot ${i + 1}`} className="aspect-video w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {screenshots.length < MAX_SCREENSHOTS && (
          <div
            onClick={() => screenshotInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setScreenshotDragging(true); }}
            onDragLeave={() => setScreenshotDragging(false)}
            onDrop={handleScreenshotDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 transition-colors ${
              screenshotDragging
                ? "border-brand-400 bg-brand-50"
                : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/50"
            }`}
          >
            <p className="text-sm font-medium text-gray-700">
              {screenshotUploading ? "Uploading…" : <>Drop screenshots here, or <span className="text-brand-600">browse</span></>}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP — max 2 MB each, {MAX_SCREENSHOTS - screenshots.length} left</p>
          </div>
        )}
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleScreenshotChange}
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
        <button
          type="submit"
          className="btn-primary justify-center py-3 text-base"
          disabled={loading || logoUploading}
        >
          {loading ? "Submitting…" : "Submit & Connect Stripe →"}
        </button>
        <p className="text-center text-xs text-gray-400">
          After submitting, you&apos;ll connect your Stripe account to verify revenue.
        </p>
      </div>
    </form>
  );
}
