/**
 * API Route: Generate Dialectical Lesson Plan
 * 
 * Este endpoint genera planes de clase con enfoque dialéctico materialista
 * utilizando la API de Google Gemini.
 * 
 * FUENTES DE CONSULTA:
 * - Cambridge English (cambridgeenglish.org)
 * - British Council (britishcouncil.org)
 * - Marco Común Europeo de Referencia (CEFR)
 * 
 * ENFOQUE PEDAGÓGICO:
 * - Dialéctica Materialista (Tesis - Antítesis - Síntesis)
 * - Praxis social y transformadora
 * - Conexión con realidad material del estudiante
 */

import { NextRequest, NextResponse } from "next/server";
import { GenerateRequest, GenerateResponse } from "@/types";
import { generateWithGemini, buildDialecticalPrompt } from "@/lib/ai-generator";

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await request.json();
    const { parameters } = body;

    // Validate required fields
    if (!parameters?.level || !parameters?.topic || !parameters?.duration || !parameters?.focus) {
      return NextResponse.json(
        {
          success: false,
          error: "Parámetros requeridos: nivel, tema, duración y enfoque",
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
          error: `Nivel inválido. Debe ser uno de: ${validLevels.join(", ")}`,
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
          error: `Duración inválida. Debe ser: ${validDurations.join(", ")} minutos`,
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
          error: `Enfoque inválido. Debe ser: ${validFocuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Build and log the dialectical prompt (for debugging)
    const prompt = buildDialecticalPrompt(parameters);
    console.log("=== DIALECTICAL PROMPT ===");
    console.log("Parameters:", JSON.stringify(parameters, null, 2));
    console.log("Prompt length:", prompt.length);
    console.log("==========================");

    // Generate the dialectical lesson plan using Gemini
    const plan = await generateWithGemini(parameters);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error generating dialectical lesson plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar el plan de clase. Por favor, intente de nuevo.",
      },
      { status: 500 }
    );
  }
}
