import { NextRequest, NextResponse } from "next/server";

const STYLE_DESCRIPTORS: Record<string, string> = {
  Gothic: "Gothic blackletter calligraphy, ornate medieval typography, heavy serifs",
  Script: "elegant cursive script, flowing handwritten calligraphy, fine ink strokes",
  Minimalist: "clean sans-serif minimalist typography, thin precise lines, modern geometric",
};

export async function POST(req: NextRequest) {
  try {
    const { text, style } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    const styleDesc = STYLE_DESCRIPTORS[style] || STYLE_DESCRIPTORS["Gothic"];
    const prompt = `A high-contrast professional tattoo design of the word "${text.trim()}", ${styleDesc} typography, bold black ink on a pure white background, clean vector lines, no shading, minimal aesthetic, 8k resolution.`;

    const response = await fetch("https://queue.fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "square_hd",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Fal.ai error:", errText);
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const data = await response.json();

    // fal.ai queue returns a request_id for async polling
    // For simplicity, handle both sync and async responses
    if (data.images && data.images[0]?.url) {
      return NextResponse.json({ imageUrl: data.images[0].url });
    }

    // If queued, poll for result
    if (data.request_id) {
      const resultUrl = `https://queue.fal.run/fal-ai/flux/dev/requests/${data.request_id}`;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(resultUrl, {
          headers: { Authorization: `Key ${falKey}` },
        });
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          if (pollData.status === "COMPLETED" && pollData.output?.images?.[0]?.url) {
            return NextResponse.json({ imageUrl: pollData.output.images[0].url });
          }
          if (pollData.status === "FAILED") {
            return NextResponse.json({ error: "Generation failed" }, { status: 502 });
          }
        }
      }
      return NextResponse.json({ error: "Generation timed out" }, { status: 504 });
    }

    return NextResponse.json({ error: "Unexpected response from AI" }, { status: 502 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
