/**
 * AI Generator for English Plan Creator
 * 
 * TECHNICAL REFERENCE SOURCES:
 * ============================
 * This module uses internationally recognized ELT standards:
 * 
 * 1. British Council (https://www.britishcouncil.org)
 *    - Teaching English resources
 *    - Lesson plans and activities
 *    - CEFR level descriptors
 * 
 * 2. Cambridge English (https://www.cambridgeenglish.org)
 *    - Cambridge Assessment methodology
 *    - Language assessment frameworks
 *    - Teaching qualifications standards (CELTA, DELTA)
 * 
 * 3. Common European Framework of Reference (CEFR)
 *    - Level descriptors (A1-C2)
 *    - Can-do statements
 *    - Competency frameworks
 * 
 * PEDAGOGICAL APPROACH:
 * ====================
 * This module implements the PPP (Presentation-Practice-Production) methodology,
 * the most widely used approach in international ELT:
 * - LEAD-IN: Engage students and activate prior knowledge
 * - PRESENTATION: Introduce new language in context
 * - PRACTICE: Controlled and semi-controlled practice
 * - PRODUCTION: Free practice and communicative tasks
 */

import { GoogleGenAI } from "@google/genai";
import { LessonParameters, LessonPlan, LessonStage } from "@/types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Builds the prompt using PPP methodology
 * 
 * @param params - Lesson parameters (level, topic, duration, focus)
 * @returns Structured prompt for PPP lesson plan generation
 */
export function buildPrompt(params: LessonParameters): string {
  const { level, topic, duration, focus } = params;

  const prompt = `You are an expert ELT (English Language Teaching) professional with extensive knowledge of international teaching methodologies.

=== TECHNICAL REFERENCE SOURCES ===
Base your lesson plan on established standards from:
- Cambridge English (cambridgeenglish.org): Assessment and teaching methodology, CELTA/DELTA standards
- British Council (britishcouncil.org): Pedagogical resources and best practices
- Common European Framework of Reference (CEFR): Level descriptors and competencies

=== METHODOLOGY: PPP (Presentation-Practice-Production) ===
Structure the lesson following the internationally recognized PPP framework:

1. LEAD-IN / WARM-UP (5-10% of lesson time)
   - Engage students and generate interest in the topic
   - Activate prior knowledge and relevant vocabulary
   - Set the context for the lesson
   - Use visuals, questions, or brief activities to hook students

2. PRESENTATION (20-25% of lesson time)
   - Introduce the target language in a meaningful context
   - Use authentic or semi-authentic materials when possible
   - Ensure meaning, form, and pronunciation (MFP) are addressed
   - Check understanding through concept checking questions (CCQs)
   - Model the target language clearly

3. PRACTICE (30-35% of lesson time)
   - Controlled practice: Focus on accuracy with teacher support
   - Semi-controlled practice: Gradually reduce scaffolding
   - Include error correction strategies
   - Use pair and group work for maximum student talking time (STT)
   - Activities: gap-fills, matching, drilling, substitution exercises

4. PRODUCTION (25-30% of lesson time)
   - Free practice with minimal teacher intervention
   - Communicative tasks that simulate real-world use
   - Focus on fluency over accuracy
   - Encourage personalization and creativity
   - Activities: role-plays, discussions, projects, presentations

=== TASK ===
Create a lesson plan for teaching "${topic}" to ${level} CEFR level students.

DURATION: ${duration} minutes
MAIN FOCUS: ${focus}

=== RESPONSE FORMAT ===
Respond ONLY with a valid JSON object (no markdown, no code blocks):

{
  "title": "Descriptive lesson title in English",
  "level": "${level}",
  "duration": "${duration} minutes",
  "focus": "${focus}",
  "objectives": [
    "Communicative objective 1 (CEFR-aligned)",
    "Communicative objective 2",
    "Skills objective"
  ],
  "lessonContext": "2-3 sentences explaining the communicative context and relevance for learners at this level.",
  "leadIn": {
    "title": "Lead-in / Warm-up",
    "duration": "X minutes",
    "activities": [
      "Activity 1: brief engaging opener",
      "Activity 2: activate prior knowledge"
    ],
    "materials": ["material1", "material2"],
    "teacherNotes": "Tips for the teacher",
    "stageObjective": "Engage students and set context"
  },
  "presentation": {
    "title": "Presentation",
    "duration": "X minutes",
    "activities": [
      "Activity 1: introduce language in context",
      "Activity 2: focus on meaning, form, pronunciation"
    ],
    "materials": ["material1"],
    "teacherNotes": "CCQs and modeling notes",
    "stageObjective": "Introduce and clarify target language"
  },
  "practice": {
    "title": "Practice",
    "duration": "X minutes",
    "activities": [
      "Activity 1: controlled practice",
      "Activity 2: semi-controlled practice"
    ],
    "materials": ["material1"],
    "teacherNotes": "Error correction approach",
    "stageObjective": "Practice target language with support"
  },
  "production": {
    "title": "Production",
    "duration": "X minutes",
    "activities": [
      "Activity 1: free communicative practice",
      "Activity 2: personalized language use"
    ],
    "materials": ["material1"],
    "teacherNotes": "Monitor for delayed error correction",
    "stageObjective": "Use language freely in communicative context"
  },
  "wrapUp": "Brief description of how to end the lesson: review key points, feedback, preview next lesson.",
  "homework": "Extension activity for self-study",
  "assessment": "How to assess student learning (formative/summative)"
}

IMPORTANT:
- All arrays must contain simple strings, NOT objects
- Content must be appropriate for ${level} level according to CEFR descriptors
- Activities must be achievable within ${duration} minutes
- Respond ONLY with the JSON, no additional text
- All content must be in English`;

  return prompt;
}

/**
 * Converts any value to a string, handling objects and arrays
 */
function toStringValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map(toStringValue).join(", ");
    }
    const obj = value as Record<string, unknown>;
    const meaningfulKeys = ["description", "text", "content", "name", "title", "stage", "activity"];
    for (const key of meaningfulKeys) {
      if (obj[key] && typeof obj[key] === "string") {
        const prefix = obj["stage"] || obj["title"] || obj["name"];
        if (prefix && prefix !== obj[key]) {
          return `${prefix}: ${obj[key]}`;
        }
        return obj[key] as string;
      }
    }
    const stringValues = Object.values(obj)
      .filter((v) => typeof v === "string")
      .join(" - ");
    return stringValues || JSON.stringify(value);
  }
  return String(value);
}

/**
 * Normalizes an array to ensure all items are strings
 */
function normalizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) {
    return arr ? [toStringValue(arr)] : [];
  }
  return arr.map(toStringValue).filter((s) => s.length > 0);
}

/**
 * Normalizes a lesson stage
 */
function normalizeLessonStage(stage: unknown, defaultTitle: string): LessonStage {
  const defaultStage: LessonStage = {
    title: defaultTitle,
    duration: "10 minutes",
    activities: [],
    materials: [],
    teacherNotes: "",
    stageObjective: "",
  };

  if (!stage || typeof stage !== "object") {
    return defaultStage;
  }

  const s = stage as Record<string, unknown>;

  return {
    title: toStringValue(s.title) || defaultTitle,
    duration: toStringValue(s.duration) || defaultStage.duration,
    activities: normalizeStringArray(s.activities),
    materials: normalizeStringArray(s.materials),
    teacherNotes: toStringValue(s.teacherNotes),
    stageObjective: toStringValue(s.stageObjective),
  };
}

/**
 * Normalizes the lesson plan structure
 */
function normalizeLessonPlan(rawPlan: Record<string, unknown>, params: LessonParameters): LessonPlan {
  return {
    title: toStringValue(rawPlan.title) || `${params.topic} - ${params.focus} (${params.level})`,
    level: params.level,
    duration: toStringValue(rawPlan.duration) || `${params.duration} minutes`,
    focus: params.focus,
    objectives: normalizeStringArray(rawPlan.objectives),
    lessonContext: toStringValue(rawPlan.lessonContext) || 
      "This lesson helps students develop communicative competence in real-world contexts.",
    leadIn: normalizeLessonStage(rawPlan.leadIn, "Lead-in / Warm-up"),
    presentation: normalizeLessonStage(rawPlan.presentation, "Presentation"),
    practice: normalizeLessonStage(rawPlan.practice, "Practice"),
    production: normalizeLessonStage(rawPlan.production, "Production"),
    wrapUp: toStringValue(rawPlan.wrapUp) ||
      "Review key language points, provide feedback, and preview the next lesson.",
    homework: toStringValue(rawPlan.homework),
    assessment: toStringValue(rawPlan.assessment),
  };
}

/**
 * Generates a fallback response when API fails
 */
export function generateFallback(params: LessonParameters): LessonPlan {
  const { level, topic, duration, focus } = params;

  const durationNum = parseInt(duration);
  const leadInTime = Math.round(durationNum * 0.1);
  const presentationTime = Math.round(durationNum * 0.2);
  const practiceTime = Math.round(durationNum * 0.35);
  const productionTime = Math.round(durationNum * 0.35);

  const levelContext: Record<string, string> = {
    A1: "beginners who need basic vocabulary and simple structures for everyday situations",
    A2: "elementary learners who can handle simple, routine exchanges",
    B1: "intermediate learners who can deal with most situations likely to arise while travelling",
    B2: "upper-intermediate learners who can interact with a degree of fluency and spontaneity",
    C1: "advanced learners who can express themselves fluently and spontaneously",
  };

  const focusActivities: Record<string, { leadIn: string[]; presentation: string[]; practice: string[]; production: string[] }> = {
    Grammar: {
      leadIn: [
        "Show images/video related to the grammar context",
        "Elicit examples of target structure from students' experience",
      ],
      presentation: [
        `Present ${topic} through a short text or dialogue`,
        "Highlight form on the board, drill pronunciation",
        "Use CCQs to check understanding of meaning",
      ],
      practice: [
        "Gap-fill exercises focusing on form",
        "Sentence transformation in pairs",
        "Error correction activity",
      ],
      production: [
        `Speaking task requiring use of ${topic}`,
        "Written paragraph using target structure",
      ],
    },
    Speaking: {
      leadIn: [
        "Discussion questions to activate topic vocabulary",
        "Brief pair discussion about personal experience",
      ],
      presentation: [
        `Introduce useful phrases/vocabulary for ${topic}`,
        "Model dialogue or conversation",
        "Focus on pronunciation and intonation",
      ],
      practice: [
        "Controlled role-play with prompts",
        "Information gap activity",
        "Substitution drills with variations",
      ],
      production: [
        "Free discussion or debate on the topic",
        "Role-play without scripts",
        "Group presentation or mini-talk",
      ],
    },
    Listening: {
      leadIn: [
        "Pre-listening discussion to predict content",
        "Pre-teach key vocabulary from the audio",
      ],
      presentation: [
        `Play audio/video related to ${topic}`,
        "Gist questions - listen for main idea",
        "Highlight key language from the recording",
      ],
      practice: [
        "Detailed comprehension questions",
        "True/False or matching activities",
        "Listen and complete exercises",
      ],
      production: [
        "Discussion based on listening content",
        "Role-play similar situations",
        "Create own dialogue based on model",
      ],
    },
    Reading: {
      leadIn: [
        "Predict content from title/images",
        "Pre-teach blocking vocabulary",
      ],
      presentation: [
        `Read text about ${topic}`,
        "Gist reading task - match headings or main idea",
        "Highlight target language in context",
      ],
      practice: [
        "Detailed comprehension questions",
        "Vocabulary exercises from text",
        "Text reconstruction activities",
      ],
      production: [
        "Discussion of text content",
        "Writing similar text type",
        "Presentation based on reading",
      ],
    },
    Integrated: {
      leadIn: [
        "Multi-skill warm-up: watch short video, discuss in pairs",
        "Activate vocabulary through visual prompts",
      ],
      presentation: [
        `Introduce ${topic} through reading or listening input`,
        "Focus on target language (vocabulary/grammar)",
        "Model both receptive and productive skills",
      ],
      practice: [
        "Reading/listening comprehension tasks",
        "Controlled speaking practice based on input",
        "Written exercises reinforcing language",
      ],
      production: [
        "Integrated task: research, discuss, and present",
        "Group project combining all skills",
        "Real-world simulation activity",
      ],
    },
  };

  const activities = focusActivities[focus];

  return {
    title: `${topic} - ${focus} Lesson (${level})`,
    level,
    duration: `${duration} minutes`,
    focus,
    objectives: [
      `Develop ${focus.toLowerCase()} skills related to ${topic} at CEFR ${level} level`,
      "Use target language accurately and appropriately",
      "Communicate effectively in context-relevant situations",
    ],
    lessonContext: `This lesson is designed for ${levelContext[level]}. Students will develop their ${focus.toLowerCase()} skills while learning about ${topic}, preparing them for real-world communication.`,
    leadIn: {
      title: "Lead-in / Warm-up",
      duration: `${leadInTime} minutes`,
      activities: activities.leadIn,
      materials: ["Visual aids", "Discussion prompts"],
      teacherNotes: "Keep energy high, involve all students, and set clear context.",
      stageObjective: "Engage students and activate prior knowledge",
    },
    presentation: {
      title: "Presentation",
      duration: `${presentationTime} minutes`,
      activities: activities.presentation,
      materials: ["Board/slides", "Model text or audio", "Handouts"],
      teacherNotes: "Focus on MFP (Meaning, Form, Pronunciation). Use CCQs to check understanding.",
      stageObjective: "Introduce and clarify target language",
    },
    practice: {
      title: "Practice",
      duration: `${practiceTime} minutes`,
      activities: activities.practice,
      materials: ["Worksheets", "Activity cards", "Timer"],
      teacherNotes: "Monitor closely, provide immediate correction during controlled practice.",
      stageObjective: "Practice target language with accuracy focus",
    },
    production: {
      title: "Production",
      duration: `${productionTime} minutes`,
      activities: activities.production,
      materials: ["Task cards", "Role-play scenarios", "Presentation materials"],
      teacherNotes: "Step back and monitor. Note errors for delayed feedback. Focus on fluency.",
      stageObjective: "Use language freely in communicative context",
    },
    wrapUp: `Review key language points from the lesson. Provide feedback on common errors observed during production. Preview what students will learn next class.`,
    homework: `Self-study task: Practice ${topic} through online exercises or by applying the language in a real-life situation and reporting back.`,
    assessment: "Formative assessment through monitoring during practice and production stages. Note areas for review in future lessons.",
  };
}

/**
 * Generates lesson plan using Google Gemini API
 * 
 * @param params - Lesson parameters from user
 * @returns Promise<LessonPlan> - PPP-structured lesson plan
 */
export async function generateWithGemini(
  params: LessonParameters
): Promise<LessonPlan> {
  // Build the prompt
  const prompt = buildPrompt(params);

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not configured, using fallback");
    return generateFallback(params);
  }

  try {
    console.log("=== SENDING PPP PROMPT TO GEMINI ===");
    console.log("Parameters:", params);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    console.log("=== GEMINI RESPONSE ===");
    console.log(text?.substring(0, 800) + "...");

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Clean markdown formatting
    let cleanedText = text.trim();
    
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    
    cleanedText = cleanedText.trim();

    // Parse and normalize
    const rawPlan = JSON.parse(cleanedText);
    const plan = normalizeLessonPlan(rawPlan, params);

    // Validate structure
    if (!plan.title || !plan.leadIn || !plan.presentation || !plan.practice || !plan.production) {
      throw new Error("Invalid PPP structure from Gemini");
    }

    return plan;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.log("Using fallback response");
    return generateFallback(params);
  }
}

// Legacy export for backward compatibility
export { buildPrompt as buildDialecticalPrompt };
