import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── BRIA scene configurations ────────────────────────────────────────────────

const PHOTO_SCENES: Record<string, string[]> = {
  shopify: [
    "Clean white seamless studio background, soft box lighting from both sides, ecommerce hero image, Shopify product photography quality, soft shadow underneath",
    "Light grey gradient studio background, professional diffused lighting, premium ecommerce catalog shot, subtle drop shadow, sharp product detail",
    "Pure white background, rim lighting creating elegant product separation, beauty ecommerce photography, minimalist luxury DTC brand presentation",
    "Off-white textured studio background, warm balanced lighting, high-end ecommerce photography, professional skincare product listing",
  ],
  amazon: [
    "Pure white background, neutral balanced studio lighting from all sides, Amazon product listing photography, all product details clearly visible, commercial clarity",
    "White seamless background, bright three-point studio lighting, Amazon hero image standard, professional commercial product photography",
    "Pure white, soft overhead lighting, Amazon marketplace product shot, crisp accurate product presentation, catalog photography",
    "Clean white background, bright even lighting, Amazon listing quality, professional product photography, ecommerce standard",
  ],
  luxury: [
    "Dark moody background, dramatic chiaroscuro side lighting, luxury skincare advertisement, high-end beauty editorial, prestige cosmetics brand aesthetic",
    "Deep navy background with warm gold light accents, luxury cosmetics advertisement photography, Chanel and La Mer aesthetic, premium beauty brand",
    "Black marble surface, atmospheric mood lighting, luxury beauty editorial photography, dramatic shadows, high-end skincare advertisement",
    "Dark charcoal gradient background, silver rim lighting, ultra-luxury skincare advertisement, Tom Ford and Byredo brand aesthetic",
  ],
  bathroom: [
    "Modern white marble bathroom countertop, soft diffused natural window light, aspirational lifestyle skincare photography, clean luxury bathroom setting",
    "Carrara marble vanity surface, warm morning light, skincare routine lifestyle shot, luxury bathroom, aspirational product photography",
    "Stone bathroom counter, soft diffused light, spa-inspired setting, serene lifestyle skincare photography, premium bathroom scene",
    "White ceramic bathroom surface, fresh botanical elements, bright natural light, clean minimal lifestyle photography, wellness brand aesthetic",
  ],
  tiktok: [
    "Vibrant pink to purple gradient background, bold Gen-Z aesthetic, TikTok ecommerce product photography, eye-catching social media visual",
    "Neon gradient background, trendy social media product photography, TikTok-native visual style, bold saturated colors, viral aesthetic",
    "Bright pastel gradient background, Instagram and TikTok optimized product photography, trendy beauty brand aesthetic, social commerce",
    "Bold colorful gradient, energetic Gen-Z social media aesthetic, TikTok product shot, vibrant ecommerce photography",
  ],
  "meta-ad": [
    "Bold lifestyle background, premium DTC brand aesthetic, Meta Facebook Instagram ad quality, conversion-optimized product photography, scroll-stopping",
    "Clean bold accent color background, Instagram ad aesthetic, high-contrast product shot, social commerce photography, premium brand",
    "Aspirational minimal background with depth, Meta story format, scroll-stopping product photography, premium lifestyle brand",
    "Gradient background, product prominently centered, Meta carousel ad quality, eye-catching commercial photography, DTC brand aesthetic",
  ],
};

const ANGLE_TO_TYPE: Record<string, { type: string; variation: number }> = {
  "Hero Shot":         { type: "shopify",   variation: 0 },
  "Lifestyle Context": { type: "bathroom",  variation: 0 },
  "Ad Composition":    { type: "meta-ad",   variation: 0 },
  "Detail Close-up":   { type: "luxury",    variation: 0 },
};

const MODE_TO_TYPE: Record<string, string> = {
  studio: "shopify", luxury: "luxury", amazon: "amazon",
  "meta-ad": "meta-ad", tiktok: "tiktok", wellness: "bathroom", minimal: "shopify",
  clean: "shopify", bold: "meta-ad", dark: "luxury", natural: "bathroom",
  "viral-tiktok": "tiktok", feminine: "bathroom", premium: "shopify",
};

const STYLE_TO_PROMPT: Record<string, string> = {
  shopify: "Clean white studio background, professional ecommerce product photography, Shopify hero image quality, soft box lighting, sharp focus",
  amazon: "Pure white background, Amazon listing photography, neutral studio lighting, commercial product photography",
  luxury: "Dark luxury background, dramatic lighting, premium beauty advertisement, high-end skincare editorial",
  bathroom: "Marble bathroom counter, natural light, lifestyle skincare photography, luxury bathroom setting",
  tiktok: "Vibrant gradient background, TikTok ecommerce visual, bold Gen-Z aesthetic, social media product photography",
  "meta-ad": "Lifestyle background, Meta ad quality, DTC brand photography, scroll-stopping product image",
};

const STRICT_REQUIREMENT =
  "Professional ecommerce product photography. Preserve exact product shape, bottle structure, label placement, and proportions. Photorealistic, commercial studio quality.";

function isForbiddenError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return msg.includes("403") || msg.includes("forbidden") || msg.includes("401") || msg.includes("unauthorized");
}

export async function POST(req: NextRequest) {
  try {
    const FAL_KEY = process.env.FAL_KEY;
    const keyPresent = !!FAL_KEY;
    console.log("[generate-product-photo] FAL_KEY present:", keyPresent, "| prefix:", FAL_KEY ? FAL_KEY.slice(0, 6) + "..." : "none");

    if (!FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured — add it to Vercel environment variables" }, { status: 500 });
    }

    // Explicit auth config — required for Vercel serverless; auto-read is not reliable
    fal.config({ credentials: FAL_KEY });

    const {
      productName,
      productDescription,
      brandStyle,
      targetAudience,
      imageType,
      angle,
      photoType: rawPhotoType,
      variation = 0,
      brandName,
      brandColors,
      referenceImageUrl,
    } = await req.json();

    if (!productName?.trim()) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }

    const photoType =
      rawPhotoType ||
      (angle && ANGLE_TO_TYPE[angle]?.type) ||
      MODE_TO_TYPE[brandStyle as string] ||
      "shopify";

    const variationIdx = Math.min(Math.max(Number(variation) || 0, 0), 3);

    console.log("[generate-product-photo]", {
      productName,
      photoType,
      variationIdx,
      hasReferenceImage: !!referenceImageUrl,
      angle: angle || "(none)",
    });

    const brandPart = brandName?.trim() ? ` for ${brandName.trim()} brand` : "";
    const colorPart = brandColors?.trim() ? `, inspired by color palette: ${brandColors.trim()}` : "";
    const descPart = productDescription?.trim() ? ` Product: ${productDescription.trim()}.` : "";

    let imageUrl: string;

    if (referenceImageUrl) {
      // ── BRIA Product Shot (image-to-image) ──────────────────────────────────
      const scenes = PHOTO_SCENES[photoType] ?? PHOTO_SCENES.shopify;
      const sceneDescription =
        `${scenes[variationIdx]}${brandPart}${colorPart}.${descPart} ${STRICT_REQUIREMENT}`;

      console.log("[generate-product-photo] Calling fal-ai/bria/product-shot");

      const { data } = await fal.run("fal-ai/bria/product-shot", {
        input: {
          image_url: referenceImageUrl,
          scene_description: sceneDescription,
          placement_type: "manual_placement",
          manual_placement_selection: photoType === "tiktok" ? "center_vertical" : "bottom_center",
          num_results: 1,
          shot_size: [1024, 1024],
          fast: true,
          optimize_description: false,
        },
      });

      imageUrl = data.images?.[0]?.url;
      console.log("[generate-product-photo] BRIA imageUrl received:", !!imageUrl);
    } else {
      // ── FLUX text-to-image fallback (no reference image) ────────────────────
      const sceneBase = STYLE_TO_PROMPT[photoType] ?? STYLE_TO_PROMPT.shopify;
      const prompt =
        `Realistic ecommerce product photograph for ${productName.trim()}. ` +
        descPart +
        (targetAudience?.trim() ? ` Target audience: ${targetAudience.trim()}.` : "") +
        ` ${sceneBase}${brandPart}${colorPart}. ` +
        "Ultra-realistic, sharp focus, professional studio quality, no distorted geometry, no warped labels, no floating elements, commercial photography.";

      const AR_MAP: Record<string, "1:1" | "3:4" | "9:16" | "16:9"> = { square: "1:1", portrait: "3:4", story: "9:16", landscape: "16:9" };
      const aspectRatio = AR_MAP[imageType as string] ?? "1:1";

      console.log("[generate-product-photo] Calling fal-ai/flux-pro/kontext/text-to-image");

      const { data } = await fal.run("fal-ai/flux-pro/kontext/text-to-image", {
        input: {
          prompt,
          guidance_scale: 3.5,
          output_format: "jpeg",
          aspect_ratio: aspectRatio,
        },
      });

      imageUrl = data.images?.[0]?.url;
      console.log("[generate-product-photo] FLUX imageUrl received:", !!imageUrl);
    }

    if (!imageUrl) throw new Error("No image URL returned from model — images array may be empty");

    const imgRes = await fetch(imageUrl);
    const buffer = await imgRes.arrayBuffer();
    const b64 = Buffer.from(buffer).toString("base64");

    console.log("[generate-product-photo] Success, b64 length:", b64.length);
    return NextResponse.json({ angle: angle || `variation-${variationIdx}`, b64 });
  } catch (err) {
    console.error("[generate-product-photo] Error:", err instanceof Error ? err.message : err);

    if (isForbiddenError(err)) {
      return NextResponse.json(
        { error: "Fal API authorization failed (403/401). Check FAL_KEY value, account billing, and model access at fal.ai/dashboard." },
        { status: 403 }
      );
    }

    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
