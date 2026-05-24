// Ad Generator service. The UI calls generateAds(input) and renders whatever
// JSON comes back. Today it returns a mock kit so the page is fully usable
// without API keys. Swap mockGenerate() for a real AI call when ready —
// see the TODO block inside generateAds().

export type Platform = "Meta Feed" | "TikTok" | "Instagram Stories" | "YouTube Shorts";
export type Goal = "Conversions" | "Leads" | "Awareness" | "Retargeting";
export type AdType =
  | "UGC Video"
  | "Image Ad"
  | "Problem/Solution"
  | "Testimonial"
  | "Founder Ad"
  | "Educational Ad";
export type VideoLength = "8 sec" | "15 sec";
export type HookType =
  | "Curiosity"
  | "Pain-Point"
  | "Belief-Shift"
  | "Direct-Response"
  | "Comment-Reply";

export interface AdGeneratorInput {
  productUrl: string;
  productName: string;
  productImage?: string | null;
  category: string;
  targetCustomer: string;
  mainProblem: string;
  uniqueSellingPoint: string;
  offer: string;
  platforms: Platform[];
  goal: Goal;
  adType: AdType;
  videoLength: VideoLength;
}

export interface Overview {
  productSummary: string;
  customerAvatar: string;
  coreAngle: string;
  emotionalTrigger: string;
  firstTestAngle: string;
}

export interface Hook {
  type: HookType;
  text: string;
}

export interface MetaAd {
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  angle: string;
  complianceSafe: string;
}

export interface TikTokAd {
  hook: string;
  script: string;
  sceneDirection: string;
  caption: string;
  angle: string;
}

export interface UGCScript {
  character: string;
  setting: string;
  cameraStyle: string;
  spokenScript: string;
  naturalActions: string;
  whyItWorks: string;
}

export interface SeedancePrompt {
  title: string;
  fullPrompt: string;
  characterDescription: string;
  setting: string;
  lighting: string;
  cameraMovement: string;
  audioDirection: string;
  productPlacement: string;
  spokenScript: string;
  timingBreakdown: string;
  angle: string;
  avoidInstructions: string;
}

export interface StaticAd {
  visualConcept: string;
  headline: string;
  subheadline: string;
  cta: string;
  layoutDirection: string;
  whyItWorks: string;
}

export interface TestingPlan {
  angles: string[];
  platforms: string[];
  creativeMix: string;
  metricsToWatch: string[];
  killScaleRules: string;
  nextToGenerate: string;
}

export interface AdKit {
  overview: Overview;
  hooks: Hook[];
  metaAds: MetaAd[];
  tiktokAds: TikTokAd[];
  ugcScripts: UGCScript[];
  seedancePrompts: SeedancePrompt[];
  staticAds: StaticAd[];
  testingPlan: TestingPlan;
}

export async function generateAds(input: AdGeneratorInput): Promise<AdKit> {
  try {
    const res = await fetch("/api/generate-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return (await res.json()) as AdKit;
  } catch (err) {
    console.warn("AI generation failed, using mock:", err);
    await new Promise((r) => setTimeout(r, 600));
    return mockGenerate(input);
  }
}

function mockGenerate(input: AdGeneratorInput): AdKit {
  const name = input.productName || "Your Product";
  const customer = input.targetCustomer || "your ideal customer";
  const problem = input.mainProblem || "the everyday struggle they're tired of";
  const usp = input.uniqueSellingPoint || "the only one in its category that delivers in days, not weeks";
  const benefit = "what it promises — visible results without the runaround";
  const offer = input.offer || "20% off + free shipping on your first order";
  const category = input.category || "your category";
  const len = input.videoLength;
  const shortLen = len === "8 sec";
  const timing = {
    setup: shortLen ? "0–1" : "0–3",
    spoken: shortLen ? "1–6" : "3–13",
    outro: shortLen ? "6–8" : "13–15",
    midpoint: shortLen ? "3" : "8",
  };

  return {
    overview: {
      productSummary: `${name} is a ${category} product built for ${customer}. It solves ${problem} by delivering ${benefit}. Positioning leans on ${usp}.`,
      customerAvatar: `${customer} who has already tried generic options and is skeptical of overpromising brands. Active on Meta and TikTok, age 24–44, lives by social proof and 30-second demos.`,
      coreAngle: `Frame ${name} as the no-nonsense fix for ${problem} — short timeline, visible proof, low risk thanks to the ${offer}.`,
      emotionalTrigger: `Relief + quiet confidence. The before-state is frustration with things that don't work; the after-state is "finally, something delivered."`,
      firstTestAngle: `Problem/Solution UGC: a relatable ${customer} narrating their old routine, the breaking point, and the switch to ${name}. Pair with a Meta Feed static using a bold headline and a TikTok hook variant.`,
    },

    hooks: [
      { type: "Curiosity", text: `I tried 7 ${category} products in 60 days. Only one made it to day 30.` },
      { type: "Curiosity", text: `Nobody talks about why ${category} products quietly stop working — until now.` },
      { type: "Curiosity", text: `${name} doesn't look special. That's the whole point.` },
      { type: "Pain-Point", text: `If you're tired of ${problem}, this is the part of the ad you should not skip.` },
      { type: "Pain-Point", text: `${customer} struggling with ${problem}: stop buying the next one and read this.` },
      { type: "Pain-Point", text: `Three years of wasted money on ${category} fixed by one Tuesday afternoon.` },
      { type: "Belief-Shift", text: `${category} doesn't have to be complicated. We were sold a lie.` },
      { type: "Belief-Shift", text: `The real reason ${category} brands don't show before/afters anymore.` },
      { type: "Belief-Shift", text: `You don't need a 10-step routine. You need one product that actually does the thing.` },
      { type: "Direct-Response", text: `${offer} on ${name}. Risk-free trial. Cancel anytime, no questions.` },
      { type: "Direct-Response", text: `Get ${name} today — visible results in 7 days or your money back.` },
      { type: "Direct-Response", text: `Selling out fast. Grab ${name} with ${offer} before tonight.` },
      { type: "Comment-Reply", text: `Replying to @sarah who asked "does ${name} actually work?" — here's exactly what 30 days looks like.` },
      { type: "Comment-Reply", text: `POV: a stranger in the comments told me to try ${name} and I'm never going back.` },
      { type: "Comment-Reply", text: `"Is it really worth it?" — answering this one honestly, no script.` },
    ],

    metaAds: [
      {
        primaryText: `${customer}, this is the part nobody tells you about ${category}: most products quietly underdeliver after week 2. ${name} was built specifically to fix that. ${benefit}. ${usp}.\n\nTry it with ${offer}. 30-day risk-free guarantee.`,
        headline: `Finally — ${category} that actually keeps working`,
        description: `${offer} · Risk-free trial`,
        cta: "Shop Now",
        angle: "Problem/Solution",
        complianceSafe: `${name} is designed to help with ${problem} for many users. Individual results may vary. Try it with our 30-day satisfaction guarantee.`,
      },
      {
        primaryText: `I'm not going to oversell this. ${name} did one thing well: ${benefit}. That's why it's worth your attention.\n\nFor ${customer} dealing with ${problem}, this is the simplest swap you can make today.\n\n${offer}.`,
        headline: `The honest take on ${name}`,
        description: `For ${customer} who's tired of the runaround`,
        cta: "Learn More",
        angle: "Founder/Honest",
        complianceSafe: `${name} is designed to help with ${problem}. Results vary by individual. See guarantee terms on our site.`,
      },
      {
        primaryText: `"I didn't expect to write this review." — Real customer, 6 weeks in.\n\n${name} was the first thing in ${category} that gave me ${benefit}. ${usp}.\n\nIf ${problem} sounds familiar, take advantage of ${offer}.`,
        headline: `Why ${customer} are switching to ${name}`,
        description: `Real reviews · Risk-free trial`,
        cta: "Shop Now",
        angle: "Testimonial",
        complianceSafe: `Reviews reflect individual experiences. Your results may vary. ${name} is not a substitute for professional advice where relevant.`,
      },
      {
        primaryText: `3 things to know about ${category}:\n\n1. Most products plateau by week 2.\n2. The ingredient/feature most brands skip is what actually makes the difference.\n3. ${name} was built around that one thing.\n\nThat's why ${customer} keep coming back. ${offer} for first-time orders.`,
        headline: `The 1 thing most ${category} brands skip`,
        description: `Educational · ${offer}`,
        cta: "Learn More",
        angle: "Educational",
        complianceSafe: `Information shared is general guidance for ${category} shoppers. Always consult relevant professionals for personal decisions.`,
      },
      {
        primaryText: `Quick announcement: ${name} is back in stock with ${offer}.\n\nIf you've been on the fence about ${category}, this is your reminder. ${benefit}. ${usp}. 30-day guarantee.\n\nFair warning — last drop sold out in 4 days.`,
        headline: `Back in stock — ${name}`,
        description: `${offer} ends Sunday`,
        cta: "Shop Now",
        angle: "Urgency/Restock",
        complianceSafe: `Supply is limited based on current inventory. ${offer} subject to terms listed at checkout.`,
      },
    ],

    tiktokAds: [
      {
        hook: `I tried 7 ${category} products in 60 days. Here's the only one I'd buy again.`,
        script: shortLen
          ? `0–1s: Walk in holding 7 products.\n1–3s: "I bought every one to fix ${problem}."\n3–5s: Throw 6 in trash.\n5–8s: Hold up ${name}. End with ${offer}.`
          : `0–2s: Walk into bathroom holding 7 products.\n2–6s: "I bought every one of these to fix ${problem}."\n6–10s: Throw 6 in trash on camera.\n10–15s: Hold up ${name}. "Only one that actually did what it said." End with ${offer}.`,
        sceneDirection: "Handheld, raw, natural light. No transitions. Trash-bin sound should be a real on-camera thud, not added in post.",
        caption: `not a brand deal i just had to share this 😭 #${category.replace(/\s+/g, "")} #fyp`,
        angle: "Comparison / Honest review",
      },
      {
        hook: `POV: ${customer} who finally found something that works`,
        script: `Cold open on tired/frustrated face. Voiceover: "${problem} for years." Cut to product unboxing in hand. "Day 7." Show result. "Day 30." Show better result. End with: "${offer}, link in bio."`,
        sceneDirection: "Mirror selfie style for opening, then handheld iPhone. Casual outfit. No ring light.",
        caption: `okay this is embarrassing but i had to post #${category.replace(/\s+/g, "")} ad`,
        angle: "Transformation",
      },
      {
        hook: `Replying to @user — yes, ${name} actually does what it says.`,
        script: `Stitched/duet style. Read the comment on screen. Then talk straight to camera: "I was skeptical too. Here's what 14 days looked like." Show timeline. End on the bottle/product close-up. CTA: "Link in bio, ${offer}."`,
        sceneDirection: "Comment overlay using TikTok native style. One continuous take, no cuts after the comment.",
        caption: `replying to a real comment, no script #honest #${category.replace(/\s+/g, "")}`,
        angle: "Comment-reply",
      },
      {
        hook: `If you're spending more than $50/month on ${category}, watch this.`,
        script: `Voiceover with quick cuts of expensive shelf products. "I was the same. Then I learned ${usp}." Cut to ${name}. "One bottle replaced 4 of these." Show the math on screen. CTA.`,
        sceneDirection: "Quick cuts, on-screen text for the math. Calm, confident delivery, not hyped.",
        caption: `not a finance video i promise 😅 #${category.replace(/\s+/g, "")}tip`,
        angle: "Educational / Cost-saver",
      },
      {
        hook: `Day 1 of trying ${name} so you don't have to`,
        script: `Series-style opener. "I'm going to use ${name} every day for 30 days." Show the product. Quick clip of using it. Tease the result. CTA: "Following along? ${offer} in bio."`,
        sceneDirection: "Vlog style, natural light. Set up the series so viewers come back for Day 7, Day 14, Day 30 cuts.",
        caption: `30 day ${name} challenge starts now #${category.replace(/\s+/g, "")} #challenge`,
        angle: "Series / Episodic",
      },
    ],

    ugcScripts: [
      {
        character: `Female, late 20s, ${customer}. Natural makeup, casual t-shirt, in their own bathroom.`,
        setting: "Bathroom with normal lighting — not styled, not perfect. Toothbrush visible in background.",
        cameraStyle: "Handheld iPhone selfie, slight shake, no gimbal, no filters. Eye contact straight to lens.",
        spokenScript: `"Okay so I'm just going to be honest. I've been dealing with ${problem} for like, three years. I've tried so many ${category} things. ${name} is the first one that actually did ${benefit} without all the side effects. I'm not getting paid to say this — it's literally just in my routine now."`,
        naturalActions: "Picks up the product mid-sentence. Holds it casually, not like a commercial. Glances down once to check label. Small awkward laugh after the line 'I'm not getting paid to say this.'",
        whyItWorks: "Pattern-breaks the polished ad feel. The bathroom + small laugh = high believability. Honesty disclaimer reads as honest rather than scripted.",
      },
      {
        character: `Male, mid 30s, founder-energy. Plain hoodie, in a kitchen or office.`,
        setting: "Home kitchen or simple desk, late afternoon light from a window.",
        cameraStyle: "Locked-off iPhone on a stack of books. Slight head tilt, natural pacing.",
        spokenScript: `"I'll keep this short. I built ${name} because I had the same problem you do — ${problem}. Three things matter: ${benefit}, ${usp}, and you can try it with ${offer}. If it doesn't work, you get your money back. That's the whole pitch."`,
        naturalActions: "Holds product up at the line 'three things matter,' sets it down at the end. No smile until the last beat.",
        whyItWorks: "Founder ads convert when delivery is calm and the offer is plain. No hype = perceived competence.",
      },
      {
        character: `Female, 40s, ${customer} with more lived-in look. Glasses, sweater, looks like an actual customer not a model.`,
        setting: "Living room, soft lamp lighting, plant in frame.",
        cameraStyle: "Tripod-mounted iPhone, slight zoom-in over the 30 seconds. One continuous take.",
        spokenScript: `"I bought ${name} because my daughter sent me a link. I was skeptical — I've seen a lot of stuff in ${category} that doesn't deliver. But week two, I noticed ${benefit}. Now I order it on subscription. That's all I have to say."`,
        naturalActions: "Sips from a mug halfway through. Looks off-camera once like she's recalling the moment.",
        whyItWorks: "Authentic recommendation from an older demographic carries social proof to younger buyers (gifting angle) and reinforces credibility for peers.",
      },
      {
        character: `Male, late 20s, gym/fitness aesthetic but not over-the-top.`,
        setting: "Gym hallway or car after workout — sweat-towel slung over shoulder.",
        cameraStyle: "Handheld, post-workout flush on face, real and a little out of breath.",
        spokenScript: `"Quick one — I've been using ${name} for six weeks. ${problem} used to wreck my week. Now I don't think about it. ${benefit}, ${usp}. Link's in the description, ${offer} if you're new."`,
        naturalActions: "Wipes face with towel mid-sentence. Holds product up briefly, almost casually, then drops hand.",
        whyItWorks: "Casual + post-effort context = the product fits into a real life, not a curated one. High retention on TikTok.",
      },
      {
        character: `Female, mid 20s, content creator energy but not influencer-polished.`,
        setting: "Sitting cross-legged on a bed, fairy lights but no studio gear.",
        cameraStyle: "Phone in hand, talking down to it. Vertical, vlog-style.",
        spokenScript: `"I'm not gonna do the whole influencer thing — here's the honest review. ${name}, $${"X"}, ${offer}. Pros: ${benefit}. Cons: it took about a week before I saw anything, so don't expect day-one magic. Would I rebuy? Yeah."`,
        naturalActions: "Counts pros/cons on fingers. Shrugs at 'would I rebuy.' Looks slightly off-screen when listing the con.",
        whyItWorks: "Adding a believable 'con' boosts trust dramatically. Pros + cons format outperforms pure praise in DR testing.",
      },
    ],

    seedancePrompts: [
      {
        title: `${name} — Honest Bathroom Confession`,
        fullPrompt: `9:16 vertical, realistic iPhone-style footage. Female, late 20s, ${customer}, natural makeup, casual t-shirt, standing in a normal home bathroom with a toothbrush visible behind her. Soft natural daylight from a small window, slight shadow on face — not studio lighting. Camera is handheld at arm's length, very slight natural shake, eye contact straight to lens. She speaks the following in a calm, slightly amused tone: "Okay so I'm just going to be honest. I've been dealing with ${problem} for like, three years. I've tried so many ${category} things. ${name} is the first one that actually did what it said without all the side effects. I'm not getting paid to say this — it's literally just in my routine now." She picks up ${name} mid-sentence, holds it at chest height, glances down at the label once, lets out a small awkward laugh after the 'not getting paid' line. Close-mic audio: clear vocal, slight bathroom room-tone, no music. Timing: ${timing.setup}s setup, ${timing.spoken}s spoken, ${timing.outro}s product hold. Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, perfect studio lighting, plastic facial expressions.`,
        characterDescription: `Female, late 20s, ${customer}, natural makeup, casual t-shirt`,
        setting: "Home bathroom with toothbrush visible, normal not styled",
        lighting: "Soft natural daylight from a small window, slight shadow on face",
        cameraMovement: "Handheld arm's length, very slight natural shake, locked eye contact",
        audioDirection: "Close-mic vocal, slight bathroom room-tone, no music",
        productPlacement: "Picked up mid-sentence, held at chest, glance down at label once",
        spokenScript: `"Okay so I'm just going to be honest. I've been dealing with ${problem} for like, three years. I've tried so many ${category} things. ${name} is the first one that actually did ${benefit} without all the side effects. I'm not getting paid to say this — it's literally just in my routine now."`,
        timingBreakdown: `${timing.setup}s setup, ${timing.spoken}s spoken, ${timing.outro}s product hold`,
        angle: "Honest review / Confessional",
        avoidInstructions: "Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, perfect studio lighting, plastic facial expressions.",
      },
      {
        title: `${name} — Founder Direct-to-Camera`,
        fullPrompt: `9:16 vertical, realistic iPhone-style footage. Male, mid 30s, founder energy, plain dark hoodie, sitting at a simple wooden desk in a home office. Late afternoon natural light from a window to his left, warm tone. Camera locked off on a stack of books at desk height, not perfectly straight. He speaks calmly, no hype: "I'll keep this short. I built ${name} because I had the same problem you do — ${problem}. Three things matter: ${benefit}, ${usp}, and you can try it with ${offer}. If it doesn't work, you get your money back. That's the whole pitch." He lifts ${name} into frame at 'three things matter,' sets it down at the end, allows a small calm smile only on the final beat. Close-mic vocal, quiet room tone, no music. Timing: 0–3s setup, 3–${shortLen ? "7" : "13"}s script, last 1–2s pause. Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, dramatic music, hyped voice.`,
        characterDescription: "Male, mid 30s, plain dark hoodie, founder energy",
        setting: "Home office desk, plain background, simple",
        lighting: "Late afternoon natural light from window-left, warm tone",
        cameraMovement: "Locked off on stack of books, slightly off-axis",
        audioDirection: "Close-mic vocal, quiet room tone, no music",
        productPlacement: "Lifted into frame at 'three things matter,' set down at end",
        spokenScript: `"I'll keep this short. I built ${name} because I had the same problem you do — ${problem}. Three things matter: ${benefit}, ${usp}, and you can try it with ${offer}. If it doesn't work, you get your money back. That's the whole pitch."`,
        timingBreakdown: `0–3s setup, 3–${len}s spoken, 1–2s pause at end`,
        angle: "Founder authority",
        avoidInstructions: "Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, dramatic music, hyped voice.",
      },
      {
        title: `${name} — Post-Workout Confidence`,
        fullPrompt: `9:16 vertical, realistic iPhone-style footage. Male, late 20s, athletic but not extreme, flushed cheeks, slightly sweaty, sweat-towel slung over one shoulder, standing in a gym hallway near a water fountain or outside near a car. Cool early-evening lighting, slightly blue tint. Handheld iPhone at arm's length, slight movement as he catches his breath. Subject speaks naturally, mildly out of breath: "Quick one — I've been using ${name} for six weeks. ${problem} used to wreck my week. Now I don't think about it. ${benefit}, ${usp}. Link's in the description, ${offer} if you're new." Wipes face with towel mid-sentence, holds ${name} up briefly and casually, drops hand. Close-mic vocal with light ambient gym sound. Timing: 0–2s establishing breath, 2–${shortLen ? "7" : "13"}s script, brief towel-wipe beat at end. Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, salesman tone, exaggerated breathing.`,
        characterDescription: "Male, late 20s, athletic, post-workout look with towel",
        setting: "Gym hallway or outside near car, after a workout",
        lighting: "Cool early-evening light, slight blue tint",
        cameraMovement: "Handheld arm's length, natural sway with breath",
        audioDirection: "Close-mic vocal, light ambient gym sound",
        productPlacement: "Held up briefly and casually mid-sentence, dropped naturally",
        spokenScript: `"Quick one — I've been using ${name} for six weeks. ${problem} used to wreck my week. Now I don't think about it. ${benefit}, ${usp}. Link's in the description, ${offer} if you're new."`,
        timingBreakdown: `0–2s establishing, 2–${len}s spoken, end on towel-wipe`,
        angle: "Lifestyle integration",
        avoidInstructions: "Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, salesman tone, exaggerated breathing.",
      },
      {
        title: `${name} — Living Room Mom Endorsement`,
        fullPrompt: `9:16 vertical, realistic iPhone-style footage. Female, 40s, glasses, comfortable sweater, sitting in a living room armchair with a houseplant visible behind her. Soft warm lamp light, slight golden tone, no overhead lighting. Camera on a tripod about 4 feet away, framed waist-up, very slow gentle zoom-in over the duration. She speaks warmly, unhurried: "I bought ${name} because my daughter sent me a link. I was skeptical — I've seen a lot of stuff in ${category} that doesn't deliver. But week two, I noticed ${benefit}. Now I order it on subscription. That's all I have to say." She sips from a mug halfway through. Glances off-camera once. Close-mic vocal, light room tone. Timing: 0–3s setup, 3–${shortLen ? "7" : "13"}s script with sip beat at midpoint. Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, dramatic gestures, fast cuts.`,
        characterDescription: "Female, 40s, glasses, sweater, real-customer aesthetic",
        setting: "Living room armchair, houseplant in frame",
        lighting: "Warm lamp light, golden tone, no overhead",
        cameraMovement: "Tripod, slow gentle zoom-in across full duration",
        audioDirection: "Close-mic vocal, light room tone",
        productPlacement: "Held in lap or beside mug, not raised for camera",
        spokenScript: `"I bought ${name} because my daughter sent me a link. I was skeptical — I've seen a lot of stuff in ${category} that doesn't deliver. But week two, I noticed ${benefit}. Now I order it on subscription. That's all I have to say."`,
        timingBreakdown: `0–3s setup, 3–${len}s spoken with mid sip beat`,
        angle: "Multi-generational trust",
        avoidInstructions: "Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, dramatic gestures, fast cuts.",
      },
      {
        title: `${name} — Bedroom Honest Review`,
        fullPrompt: `9:16 vertical, realistic iPhone-style footage. Female, mid 20s, content-creator-but-not-polished, sitting cross-legged on a bed with soft fairy lights but no studio equipment. Mixed lamp + ambient evening light, slightly cool. Phone in hand, talking down into the lens vlog-style, occasional natural reframing. She speaks like she's catching up with a friend: "I'm not gonna do the whole influencer thing — here's the honest review. ${name}, ${offer}. Pros: ${benefit}. Cons: it took about a week before I saw anything, so don't expect day-one magic. Would I rebuy? Yeah." Counts pros and cons on her fingers. Shrugs softly at 'would I rebuy.' Glances off-screen when listing the con. Close-mic vocal, faint room hum. Timing: 0–2s frame-in, 2–${shortLen ? "7" : "13"}s script with finger-counting beats. Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, scripted-sounding cadence, perfect lighting.`,
        characterDescription: "Female, mid 20s, casual creator energy, not influencer-polished",
        setting: "Bedroom with fairy lights, sitting cross-legged on bed",
        lighting: "Mixed lamp + ambient evening light, slightly cool",
        cameraMovement: "Handheld vertical vlog-style, natural reframing",
        audioDirection: "Close-mic vocal, faint room hum",
        productPlacement: "Held in hand from start, gestured with while speaking",
        spokenScript: `"I'm not gonna do the whole influencer thing — here's the honest review. ${name}, ${offer}. Pros: ${benefit}. Cons: it took about a week before I saw anything, so don't expect day-one magic. Would I rebuy? Yeah."`,
        timingBreakdown: `0–2s frame-in, 2–${len}s spoken with finger-count beats`,
        angle: "Balanced honest review (with believable con)",
        avoidInstructions: "Avoid fake movements, glitches, robotic delivery, overproduced commercial feel, unrealistic product interaction, scripted-sounding cadence, perfect lighting.",
      },
    ],

    staticAds: [
      {
        visualConcept: `Split-frame: left side shows "before" scene representing ${problem} (cluttered, frustrated). Right side shows clean, calm scene with ${name} prominently placed. Pastel palette pulled from the LaunchLabs gradient.`,
        headline: `Stop fixing ${problem}. Fix ${category}.`,
        subheadline: `${name} delivers ${benefit} — backed by a 30-day risk-free trial.`,
        cta: "Shop Now",
        layoutDirection: "1080×1080 square. Headline top-center bold sans-serif, product hero centered, CTA pill at bottom. Soft drop shadow on product, no harsh edges.",
        whyItWorks: "Before/after framing converts cold traffic when problem is universally felt. The bold contrast carries the story without needing copy to do the heavy lifting.",
      },
      {
        visualConcept: `Hero close-up of ${name} on a clean colored background (deep violet or pink). Overlay text uses gradient. Negative space dominates 60% of the frame.`,
        headline: `The ${category} ${customer} keep reordering`,
        subheadline: `${usp}. ${offer} on first order.`,
        cta: "Get Yours",
        layoutDirection: "1080×1350 portrait. Product takes up bottom 40%. Headline on top with gradient-text. Subheadline smaller below. CTA in white capsule lower-right.",
        whyItWorks: "Pure product hero ads scale well after winning angle is found. Reorder framing implies social proof without needing a face.",
      },
      {
        visualConcept: `5-star quote graphic. Real-looking review screenshot card centered on a textured pastel background. Stars in amber, review in dark text. Product thumbnail bottom-right.`,
        headline: `"Finally a ${category} that does what it says."`,
        subheadline: `— Verified buyer · ${name}`,
        cta: "Read Reviews",
        layoutDirection: "1080×1080. Review card has 16px border-radius, faint shadow, white background. Surrounding background uses LaunchLabs gradient at 20% opacity.",
        whyItWorks: "Testimonial statics still outperform creative-heavy ads for mid-funnel retargeting. Direct quote with stars passes the half-second scroll test.",
      },
      {
        visualConcept: `Educational infographic. 3 numbered points with simple icons explaining why ${category} usually fails and how ${name} solves it. White background, accent color on numbers.`,
        headline: `3 reasons ${category} stops working`,
        subheadline: `And how ${name} fixes all 3.`,
        cta: "See How",
        layoutDirection: "1080×1350 portrait. Title top, 3 stacked rows of icon + heading + 1-line body, CTA bar bottom. High contrast, mobile-readable type at min 28px.",
        whyItWorks: "Educational statics earn longer dwell time on Meta, which the algorithm rewards. Works especially well for first-touch top-of-funnel.",
      },
      {
        visualConcept: `Bold offer banner: gradient background, ${offer} in massive condensed type, ${name} product floating right side.`,
        headline: `${offer}`,
        subheadline: `${name} · Risk-free 30-day guarantee · Ends Sunday`,
        cta: "Claim Offer",
        layoutDirection: "1080×1080. Offer text occupies left 60%, product right 40%. CTA fixed bottom-center. Use the LaunchLabs gradient as background.",
        whyItWorks: "Direct response statics with bold offers convert warm/retargeted audiences. Use sparingly for cold — better as a closer in the funnel.",
      },
    ],

    testingPlan: {
      angles: [
        `Problem/Solution — UGC bathroom confession opening with ${problem} and ending on ${name}.`,
        `Founder Honest — direct-to-camera, calm, offer-first.`,
        `Comment-Reply — stitched reply to a believable customer question.`,
      ],
      platforms: input.platforms.length > 0 ? input.platforms : ["Meta Feed", "TikTok"],
      creativeMix: `Run 3 video variants per angle (9 total) + 2 static control ads (offer banner + testimonial quote). Same daily budget per angle for fair read. Keep landing page identical across variants.`,
      metricsToWatch: [
        "CTR — first 24h kill threshold below 1.0% on Meta, 0.8% on TikTok",
        "Hook retention (3s view rate) — keep if > 25%, kill if < 15%",
        "CPA vs target — Pro target $25, kill if 1.5× over after $X spend",
        "ROAS — minimum viable 1.8× day 7, target 2.5× day 14",
        "Comments-to-impressions ratio — flag if abnormally high (good signal or compliance risk)",
      ],
      killScaleRules: `Kill any ad set at <0.8% CTR or >1.5× CPA target after $50 spend in first 48h. Scale winners by duplicating into broader audiences with 2× budget; never edit a winning ad set directly. After 7 days, retire bottom 30% of creatives and refresh.`,
      nextToGenerate: `Once a winning angle emerges, generate 5 more UGC variants of the winner (different character, same script structure), plus 2 retargeting statics with offer-first copy. Add a long-form (30s) version of the top-performing 8s hook for Meta Reels placement.`,
    },
  };
}
