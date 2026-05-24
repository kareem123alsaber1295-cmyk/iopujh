import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getClient() {
  return new OpenAI();
}

const STYLE_GUIDES: Record<string, string> = {
  clean: "clean minimal white or light grey background, bright even studio lighting, crisp professional shadows",
  bold: "vibrant bold lifestyle setting, saturated eye-catching colors, dynamic high-energy composition",
  dark: "dark moody luxury background, dramatic chiaroscuro lighting, premium upscale high-end aesthetic",
  natural: "natural organic setting with plants or wood surfaces, soft diffused daylight, earthy warm tones",
};

const SIZE_MAP: Record<string, "1024x1024" | "1536x1024" | "1024x1536"> = {
  square: "1024x1024",
  landscape: "1536x1024",
  portrait: "1024x1536",
  story: "1024x1536",
};

const ANGLE_SUFFIXES: Record<string, string> = {
  "Hero Shot":
    "Product centered and facing forward, perfectly lit from front and sides, sharp focus on label and packaging, hero product photography style.",
  "Lifestyle Context":
    "Product placed in an aspirational real-world lifestyle context that tells a story about the customer's life and how the product fits into it.",
  "Detail Close-up":
    "Macro close-up shot highlighting premium texture, label typography, materials, and craftsmanship. Shallow depth of field, sharp details.",
  "Ad Composition":
    "Styled flat lay or arranged composition with complementary props and negative space intentionally left for ad headline overlay text. Balanced, editorial layout.",
};

export async function POST(req: NextRequest) {
  try {
    const { productName, productDescription, brandStyle, targetAudience, imageType, angle } =
      await req.json();

    if (!productName?.trim()) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }

    const client = getClient();
    const size = SIZE_MAP[imageType as string] ?? "1024x1024";
    const styleDesc = STYLE_GUIDES[brandStyle as string] ?? STYLE_GUIDES.clean;
    const angleSuffix = ANGLE_SUFFIXES[angle as string] ?? "";

    const descPart = productDescription?.trim() ? `${productDescription.trim()}. ` : "";
    const audiencePart = targetAudience?.trim() ? ` Target audience: ${targetAudience.trim()}.` : "";

    const prompt =
      `Realistic ecommerce product photography for ${productName}. ` +
      descPart +
      styleDesc +
      `. Professional product photography, modern ecommerce ad style, realistic packaging, ` +
      `no fake brand logos, no distorted text, no people unless requested, high quality, ` +
      `conversion-focused, suitable for Shopify, Meta ads, and TikTok ads.` +
      audiencePart +
      (angleSuffix ? ` ${angleSuffix}` : "");

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size,
      quality: "medium",
    });

    return NextResponse.json({
      angle,
      b64: response.data?.[0]?.b64_json ?? null,
    });
  } catch (err) {
    console.error("generate-product-photo error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
