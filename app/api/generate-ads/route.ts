import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AdGeneratorInput, AdKit } from "@/lib/generateAds";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert direct-response ecommerce ad copywriter specializing in Meta Ads, TikTok, UGC production, and performance marketing.

Given a product brief as JSON, return a complete ad kit as a single JSON object. No markdown fences, no explanation — only raw JSON.

The JSON must exactly match this shape:

{
  "overview": {
    "productSummary": "string",
    "customerAvatar": "string",
    "coreAngle": "string",
    "emotionalTrigger": "string",
    "firstTestAngle": "string"
  },
  "hooks": [
    { "type": "Curiosity" | "Pain-Point" | "Belief-Shift" | "Direct-Response" | "Comment-Reply", "text": "string" }
    // exactly 15 hooks — 3 per type, in this order: Curiosity x3, Pain-Point x3, Belief-Shift x3, Direct-Response x3, Comment-Reply x3
  ],
  "metaAds": [
    {
      "primaryText": "string",
      "headline": "string",
      "description": "string",
      "cta": "string",
      "angle": "string",
      "complianceSafe": "string"
    }
    // exactly 5 items with distinct angles
  ],
  "tiktokAds": [
    {
      "hook": "string",
      "script": "string — adjust timing to the videoLength (8 sec or 15 sec) from the input",
      "sceneDirection": "string",
      "caption": "string",
      "angle": "string"
    }
    // exactly 5 items
  ],
  "ugcScripts": [
    {
      "character": "string",
      "setting": "string",
      "cameraStyle": "string",
      "spokenScript": "string",
      "naturalActions": "string",
      "whyItWorks": "string"
    }
    // exactly 5 items with distinct characters (varied age, gender, setting)
  ],
  "seedancePrompts": [
    {
      "title": "string",
      "fullPrompt": "string — detailed 9:16 vertical AI video generation prompt for Seedance 2.0, describing character, setting, lighting, camera, audio, product placement, spoken lines, timing breakdown, and what to avoid",
      "characterDescription": "string",
      "setting": "string",
      "lighting": "string",
      "cameraMovement": "string",
      "audioDirection": "string",
      "productPlacement": "string",
      "spokenScript": "string",
      "timingBreakdown": "string — use the videoLength from input (8 sec or 15 sec)",
      "angle": "string",
      "avoidInstructions": "string"
    }
    // exactly 5 items
  ],
  "staticAds": [
    {
      "visualConcept": "string",
      "headline": "string",
      "subheadline": "string",
      "cta": "string",
      "layoutDirection": "string",
      "whyItWorks": "string"
    }
    // exactly 5 items
  ],
  "testingPlan": {
    "angles": ["string", "string", "string"],
    "platforms": ["string"],
    "creativeMix": "string",
    "metricsToWatch": ["string", "string", "string", "string", "string"],
    "killScaleRules": "string",
    "nextToGenerate": "string"
  }
}

Copy quality rules:
- Every line of copy must reference the specific product name, customer, problem, USP, and offer from the brief
- Use direct-response principles: hook → benefit → proof → offer → CTA
- Hooks must sound like real scroll-stopping openers, not generic templates
- UGC scripts must feel unscripted — natural speech patterns, awkward pauses noted, realistic characters
- Seedance fullPrompt must be long and precise — 150+ words with full production notes
- Meta compliance-safe versions must soften claims without losing conversion angle
- testingPlan.platforms must match the platforms array from the input
- All copy should match the campaign goal from the input (Conversions / Leads / Awareness / Retargeting)`;

export async function POST(req: NextRequest) {
  try {
    const input: AdGeneratorInput = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const kit = JSON.parse(cleaned) as AdKit;

    return NextResponse.json(kit);
  } catch (err) {
    console.error("generate-ads error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
