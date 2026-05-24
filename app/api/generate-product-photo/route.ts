import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

function getClient() {
  return new OpenAI();
}

const STYLE_GUIDES: Record<string, string> = {
  clean: "clean minimal white or light grey background, bright even studio lighting, crisp professional shadows",
  bold: "vibrant bold lifestyle setting, saturated eye-catching colors, dynamic high-energy composition",
  dark: "dark moody luxury background, dramatic chiaroscuro lighting, premium upscale high-end aesthetic",
  natural: "natural organic setting with plants or wood surfaces, soft diffused daylight, earthy warm tones",
};

// dall-e-3 supported sizes only
const SIZE_MAP: Record<string, "1024x1024" | "1792x1024" | "1024x1792"> = {
  square: "1024x1024",
  landscape: "1792x1024",
  portrait: "1024x1792",
  story: "1024x1792",
};

const ANGLES = [
  {
    name: "Hero Shot",
    suffix:
      "Product centered and facing forward, perfectly lit from front and sides, sharp focus on label and packaging, hero product photography style.",
  },
  {
    name: "Lifestyle Context",
    suffix:
      "Product placed in an aspirational real-world lifestyle context that tells a story about the customer's life and how the product fits into it.",
  },
  {
    name: "Detail Close-up",
    suffix:
      "Macro close-up shot highlighting premium texture, label typography, materials, and craftsmanship. Shallow depth of field, sharp details.",
  },
  {
    name: "Ad Composition",
    suffix:
      "Styled flat lay or arranged composition with complementary props and negative space intentionally left for ad headline overlay text. Balanced, editorial layout.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const { productName, productDescription, brandStyle, targetAudience, imageType } =
      await req.json();

    if (!productName?.trim()) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }

    const client = getClient();
    const size = SIZE_MAP[imageType as string] ?? "1024x1024";
    const styleDesc = STYLE_GUIDES[brandStyle as string] ?? STYLE_GUIDES.clean;

    const descPart = productDescription?.trim() ? `${productDescription.trim()}. ` : "";
    const audiencePart = targetAudience?.trim() ? ` Target audience: ${targetAudience.trim()}.` : "";

    const basePrompt =
      `Realistic ecommerce product photography for ${productName}. ` +
      descPart +
      styleDesc +
      `. Professional product photography, modern ecommerce ad style, realistic packaging, ` +
      `no fake brand logos, no distorted text, no people unless requested, high quality, ` +
      `conversion-focused, suitable for Shopify, Meta ads, and TikTok ads.` +
      audiencePart;

    const requests = ANGLES.map((angle) =>
      client.images.generate({
        model: "dall-e-3",
        prompt: `${basePrompt} ${angle.suffix}`,
        n: 1,
        size,
        quality: "hd",
      })
    );

    const responses = await Promise.all(requests);

    const images = responses.map((res, i) => ({
      angle: ANGLES[i].name,
      url: res.data?.[0]?.url ?? null,
    }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("generate-product-photo error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
