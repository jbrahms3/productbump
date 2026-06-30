"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { formatTimeAgo } from "@/lib/format";

interface Comment {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

interface Props {
  productId: string;
  initialComments: Comment[];
}

export default function CommentSection({ productId, initialComments }: Props) {
  const { isSignedIn } = useUser();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to post comment");
      setComments((c) => [data, ...c]);
      setBody("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="px-6 py-5">
      <h2 className="mb-3 font-semibold text-gray-700">
        Comments {comments.length > 0 && <span className="text-gray-400">({comments.length})</span>}
      </h2>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="mb-5 flex flex-col gap-2">
          <textarea
            className="input min-h-[70px] resize-y text-sm"
            placeholder="Share your thoughts..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="btn-primary self-start text-xs"
            disabled={posting || !body.trim()}
          >
            {posting ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <SignInButton mode="modal">
            <button className="font-semibold text-brand-600 hover:underline">Sign in</button>
          </SignInButton>{" "}
          to leave a comment.
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet — be the first.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-xs font-bold text-white">
                {c.authorName[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-800">{c.authorName}</span>
                  <span className="text-xs text-gray-400">{formatTimeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-600">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
