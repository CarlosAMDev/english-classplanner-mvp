/**
 * API Route: Generate Lesson Plan
 * 
 * This endpoint generates lesson plans following international ELT methodology
 * using the Google Gemini API.
 * 
 * TECHNICAL REFERENCES:
 * - Cambridge English (cambridgeenglish.org)
 * - British Council (britishcouncil.org)
 * - Common European Framework of Reference (CEFR)
 * 
 * METHODOLOGY:
 * - PPP (Presentation-Practice-Production)
 * - Communicative Language Teaching (CLT)
 * - Task-Based Learning (TBL) elements
 */

import { NextRequest, NextResponse } from "next/server";
import { GenerateRequest, GenerateResponse } from "@/types";
import { generateWithGemini, buildPrompt } from "@/lib/ai-generator";

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await request.json();
    const { parameters } = body;

    // Validate required fields
    if (!parameters?.level || !parameters?.topic || !parameters?.duration || !parameters?.focus) {
      return NextResponse.json(
        {
          success: false,
          error: "Required parameters: level, topic, duration, and focus",
        },
        { status: 400 }
      );
    }

    // Validate level (CEFR)
    const validLevels = ["A1", "A2", "B1", "B2", "C1"];
    if (!validLevels.includes(parameters.level)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid level. Must be one of: ${validLevels.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate duration
    const validDurations = ["45", "60", "90"];
    if (!validDurations.includes(parameters.duration)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid duration. Must be: ${validDurations.join(", ")} minutes`,
        },
        { status: 400 }
      );
    }

    // Validate focus
    const validFocuses = ["Grammar", "Speaking", "Listening", "Reading", "Integrated"];
    if (!validFocuses.includes(parameters.focus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid focus. Must be: ${validFocuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Build and log the prompt (for debugging)
    const prompt = buildPrompt(parameters);
    console.log("=== PPP LESSON PLAN PROMPT ===");
    console.log("Parameters:", JSON.stringify(parameters, null, 2));
    console.log("Prompt length:", prompt.length);
    console.log("==============================");

    // Generate the lesson plan using Gemini
    const plan = await generateWithGemini(parameters);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error generating lesson plan. Please try again.",
      },
      { status: 500 }
    );
  }
}
