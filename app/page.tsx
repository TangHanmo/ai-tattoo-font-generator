"use client";

import { useState } from "react";
import Image from "next/image";

const STYLES = [
  { id: "Gothic", label: "Gothic" },
  { id: "Script", label: "Script" },
  { id: "Minimalist", label: "Minimalist" },
];

export default function Home() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("Gothic");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setImageUrl(data.imageUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-widest uppercase text-white mb-2">
          AI Tattoo Font Generator
        </h1>
        <p className="text-zinc-400 text-sm tracking-wide">
          Enter your text · Choose a style · Generate your tattoo design
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-lg space-y-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter name or word..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-lg tracking-wider"
        />

        {/* Style Selector */}
        <div className="flex gap-3">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold tracking-widest uppercase transition-all ${
                style === s.id
                  ? "bg-white text-zinc-950"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="w-full py-3 bg-white text-zinc-950 font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Generating..." : "Generate Tattoo Design"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-6 text-red-400 text-sm">{error}</p>
      )}

      {/* Preview */}
      <div className="mt-10 w-full max-w-lg">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-zinc-500">
              <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              <span className="text-sm tracking-wider">AI is crafting your design...</span>
            </div>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt="Tattoo design preview"
              width={512}
              height={512}
              className="w-full h-full object-contain"
              unoptimized
            />
          ) : (
            <p className="text-zinc-600 text-sm tracking-wider">Preview will appear here</p>
          )}
        </div>

        {/* Download Button */}
        <button
          disabled={!imageUrl}
          className="mt-4 w-full py-3 bg-zinc-800 text-zinc-500 font-bold uppercase tracking-widest rounded-lg cursor-not-allowed opacity-50"
        >
          Download HD Image (Pay to Unlock)
        </button>
      </div>

      <p className="mt-10 text-zinc-700 text-xs tracking-wider">
        Powered by Fal.ai · Flux.1 Dev
      </p>
    </main>
  );
}
