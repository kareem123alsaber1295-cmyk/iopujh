import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Map legacy brandStyle → generationMode for backward compat (results page)
const STYLE_TO_MODE: Record<string, string> = {
  clean: "studio", bold: "tiktok", dark: "luxury", natural: "wellness",
};

const MODE_VIBES: Record<string, string> = {
  luxury: "luxury skincare advertisement, dark premium background, dramatic chiaroscuro studio lighting, gold and obsidian color palette, high-end editorial beauty aesthetic matching Chanel, La Mer, and Tom Ford",
  studio: "clean professional studio product photography, pure white seamless background, balanced soft-box lighting from multiple angles, crisp grounded shadows, Shopify hero image quality",
  amazon: "Amazon product listing photograph, pure white background, neutral studio lighting from all sides, commercial photography standard, no props, straightforward professional product presentation",
  "meta-ad": "Meta and Instagram advertisement creative, bold lifestyle background, conversion-optimized visual hierarchy, premium DTC brand aesthetic, eye-catching composition, scroll-stopping quality",
  tiktok: "TikTok ecommerce product visual, vibrant trendy Gen-Z aesthetic, bold saturated colors, social-media-native composition, beauty creator style, high energy",
  wellness: "wellness and holistic brand photography, warm natural materials, soft diffused window light, earthy neutral tones, organic textures, clean calm living aesthetic",
  minimal: "minimal premium product photography, vast deliberate negative space, sparse clean composition, Swiss design influence, premium skincare brand aesthetic matching Aesop and Byredo",
};

const ANGLE_DIRECTIONS: Record<string, string> = {
  "Hero Shot": "Center the product perfectly on a clean surface facing directly forward. Symmetrical lighting from both sides. This is the primary hero product photograph showing the full product clearly.",
  "Lifestyle Context": "Place the product in a carefully composed aspirational lifestyle setting. Complementary props and environment reinforce the brand world and tell the customer's story.",
  "Detail Close-up": "Extreme close-up macro photography on the product's most premium details — label typography, cap material, surface texture, liquid color (if visible). Very shallow depth of field, maximum sharpness on the focal point.",
  "Ad Composition": "Styled flat-lay or editorial arrangement with intentional negative space in the upper third designed for a headline and CTA text overlay. Balanced magazine-worthy layout ready for advertising.",
};

const ASPECT_RATIO_MAP: Record<string, string> = {
  square: "1:1",
  portrait: "3:4",
  story: "9:16",
  landscape: "16:9",
};


function buildPrompt(params: {
  productName: string;
  productDescription: string;
  brandStyle: string;
  targetAudience: string;
  mode: string;
  angle: string;
  hasReference: boolean;
}): string {
  const modeVibe = MODE_VIBES[params.mode] || MODE_VIBES.studio;
  const angleDir = ANGLE_DIRECTIONS[params.angle] || ANGLE_DIRECTIONS["Hero Shot"];
  const descPart = params.productDescription?.trim()
    ? `The product details: ${params.productDescription.trim()}. `
    : "";
  const audiencePart = params.targetAudience?.trim()
    ? `Target customer: ${params.targetAudience.trim()}. `
    : "";

  const quality =
    "Ultra-realistic ecommerce product photography. Sharp professional focus. Realistic packaging materials with correct surface properties. No distorted geometry, no warped labels, no floating elements, no duplicate products, no broken packaging, no unrealistic reflections, no blurry text, no extra hands or people. Photo-quality render. Commercial studio grade.";

  if (params.hasReference) {
    return (
      `Edit this reference product image for ${params.productName}. ` +
      `PRESERVE EXACTLY: the bottle or container shape, cap design, structural proportions, shadow placement, surface reflections, material texture properties, camera perspective, and background composition. ` +
      `REPLACE ONLY: the label design, logo, brand name text, and packaging color palette with a fresh ${params.mode} brand identity. ` +
      descPart +
      audiencePart +
      `Visual direction: ${modeVibe}. ` +
      `Composition: ${angleDir} ` +
      quality
    );
  }

  return (
    `Create a premium realistic ecommerce product photograph for ${params.productName}. ` +
    descPart +
    audiencePart +
    `Visual direction: ${modeVibe}. ` +
    `Composition: ${angleDir} ` +
    quality
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    const {
      productName,
      productDescription,
      brandStyle,
      targetAudience,
      imageType,
      angle,
      generationMode,
      referenceImageUrl,
      strength = 0.5,
    } = await req.json();

    if (!productName?.trim()) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }

    // Resolve mode: explicit generationMode > brandStyle mapping > default
    const mode = generationMode || STYLE_TO_MODE[brandStyle as string] || "studio";

    const prompt = buildPrompt({
      productName: productName.trim(),
      productDescription: productDescription || "",
      brandStyle: brandStyle || "clean",
      targetAudience: targetAudience || "",
      mode,
      angle: angle || "Hero Shot",
      hasReference: !!referenceImageUrl,
    });

    // Map strength slider (0–1) to guidance_scale (1.5–5.5)
    const guidanceScale = 1.5 + (Number(strength) * 4.0);

    const aspectRatio = (ASPECT_RATIO_MAP[imageType as string] ?? "1:1") as
      "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" | "21:9" | "9:21";
    const gs = Math.round(guidanceScale * 10) / 10;
    let imageUrl: string;

    if (referenceImageUrl) {
      const { data } = await fal.run("fal-ai/flux-pro/kontext", {
        input: {
          image_url: referenceImageUrl,
          prompt,
          guidance_scale: gs,
          output_format: "jpeg",
          aspect_ratio: aspectRatio,
        },
      });
      imageUrl = data.images?.[0]?.url;
    } else {
      const { data } = await fal.run("fal-ai/flux-pro/kontext/text-to-image", {
        input: {
          prompt,
          guidance_scale: gs,
          output_format: "jpeg",
          aspect_ratio: aspectRatio,
        },
      });
      imageUrl = data.images?.[0]?.url;
    }

    if (!imageUrl) throw new Error("No image URL returned from model");

    // Fetch and convert to base64 for consistent client interface
    const imgRes = await fetch(imageUrl);
    const buffer = await imgRes.arrayBuffer();
    const b64 = Buffer.from(buffer).toString("base64");

    return NextResponse.json({ angle, b64 });
  } catch (err) {
    console.error("generate-product-photo error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
