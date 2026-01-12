import { NextRequest, NextResponse } from "next/server";
import { GenerateRequest, GenerateResponse } from "@/types";
import { generateWithOpenAI, buildPrompt } from "@/lib/ai-generator";

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await request.json();
    const { parameters } = body;

    // Validate required fields
    if (!parameters?.level || !parameters?.topic || !parameters?.duration || !parameters?.focus) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: level, topic, duration, and focus are required",
        },
        { status: 400 }
      );
    }

    // Validate level
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
          error: `Invalid duration. Must be one of: ${validDurations.join(", ")} minutes`,
        },
        { status: 400 }
      );
    }

    // Validate focus
    const validFocuses = ["Grammar", "Speaking", "Listening", "Reading"];
    if (!validFocuses.includes(parameters.focus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid focus. Must be one of: ${validFocuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Log the prompt that would be sent to AI (for debugging)
    const prompt = buildPrompt(parameters);
    console.log("=== AI PROMPT ===");
    console.log(prompt);
    console.log("=================");

    // Generate the lesson plan
    const plan = await generateWithOpenAI(parameters);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while generating the lesson plan",
      },
      { status: 500 }
    );
  }
}
