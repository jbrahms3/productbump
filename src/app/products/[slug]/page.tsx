import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("loom.com") && u.pathname.startsWith("/share/")) {
      return `https://www.loom.com/embed${u.pathname.replace("/share", "")}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const comments = await prisma.comment.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
  });

  const progress = Math.min(
    (product.revenueAmount / product.revenueThreshold) * 100,
    100
  );

  const embed = product.demoVideoUrl ? embedUrl(product.demoVideoUrl) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        ← Back to homepage
      </Link>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 p-6">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            {product.logoUrl ? (
              <Image src={product.logoUrl} alt={product.name} fill className="object-contain p-1" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🚀</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.bumped && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  ✓ Reached {formatCurrency(product.revenueThreshold)}
                </span>
              )}
            </div>
            <p className="mt-1 text-gray-500">{product.tagline}</p>
            <p className="mt-1 text-xs text-gray-400">by {product.makerName}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-gray-200 p-3">
            <span className="text-2xl">▲</span>
            <span className="text-xl font-bold">{formatCurrency(product.revenueAmount)}</span>
            <span className="text-xs text-gray-400">revenue</span>
          </div>
        </div>

        {/* Progress */}
        {!product.bumped && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Progress to {formatCurrency(product.revenueThreshold)}</span>
              <span className="text-gray-500">
                {formatCurrency(product.revenueAmount)} / {formatCurrency(product.revenueThreshold)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {formatCurrency(product.revenueThreshold - product.revenueAmount)} more in revenue to make room on the homepage
            </p>
          </div>
        )}

        {/* Description */}
        <div className="border-t border-gray-100 px-6 py-5">
          <h2 className="mb-2 font-semibold text-gray-700">About</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{product.description}</p>
        </div>

        {/* Demo video */}
        {product.demoVideoUrl && (
          <div className="border-t border-gray-100 px-6 py-5">
            <h2 className="mb-2 font-semibold text-gray-700">Demo</h2>
            {embed ? (
              <div className="aspect-video overflow-hidden rounded-xl border border-gray-100">
                <iframe
                  src={embed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={product.demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                ▶ Watch demo video
              </a>
            )}
          </div>
        )}

        {/* Screenshots */}
        {product.screenshots.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5">
            <h2 className="mb-2 font-semibold text-gray-700">Screenshots</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {product.screenshots.map((url, i) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${product.name} screenshot ${i + 1}`} className="aspect-video w-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection productId={product.id} initialComments={comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))} />

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {product.stripeConnected ? (
              <span className="flex items-center gap-1 text-green-600">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified via Stripe
              </span>
            ) : (
              <span className="text-yellow-600">⚡ Unverified</span>
            )}
          </div>
          <a
            href={product.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs"
          >
            Visit {product.name} →
          </a>
        </div>
      </div>
    </div>
  );
}
