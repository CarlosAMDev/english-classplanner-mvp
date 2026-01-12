import { LessonParameters, LessonPlan } from "@/types";

/**
 * Builds the strict prompt for AI generation following British Council
 * and Cambridge English methodologies within CEFR framework.
 */
export function buildPrompt(params: LessonParameters): string {
  const { level, topic, duration, focus } = params;

  const prompt = `You are an expert English language teacher trainer following British Council and Cambridge English methodologies.

STRICT INSTRUCTIONS:
- Use ONLY methodologies approved by the British Council and Cambridge English.
- Do NOT invent structures outside the Common European Framework of Reference (CEFR).
- The lesson MUST be appropriate for ${level} level students according to CEFR descriptors.
- All activities must be achievable within the ${duration}-minute timeframe.
- The primary focus is ${focus}, but integrate other skills where appropriate.

TASK:
Generate a detailed lesson plan for teaching "${topic}" to ${level} level English learners.

CLASS DURATION: ${duration} minutes
PRIMARY FOCUS: ${focus}

RESPONSE FORMAT:
You MUST respond with a valid JSON object following this exact structure:
{
  "title": "Descriptive lesson title",
  "level": "${level}",
  "duration": "${duration} minutes",
  "focus": "${focus}",
  "objectives": ["objective1", "objective2", "objective3"],
  "warmUp": {
    "title": "Warm-up",
    "duration": "X minutes",
    "activities": ["activity1", "activity2"],
    "materials": ["material1"],
    "teacherNotes": "Optional notes"
  },
  "mainActivity": {
    "title": "Main Activity",
    "duration": "X minutes",
    "activities": ["activity1", "activity2", "activity3"],
    "materials": ["material1", "material2"],
    "teacherNotes": "Optional notes"
  },
  "wrapUp": {
    "title": "Wrap-up",
    "duration": "X minutes",
    "activities": ["activity1", "activity2"],
    "materials": ["material1"],
    "teacherNotes": "Optional notes"
  },
  "homework": "Optional homework assignment",
  "assessment": "How to assess student learning"
}

IMPORTANT: Respond ONLY with the JSON object. No additional text.`;

  return prompt;
}

/**
 * Simulates AI response for MVP purposes.
 * In production, this would call OpenAI API with the built prompt.
 */
export function simulateAIResponse(params: LessonParameters): LessonPlan {
  const { level, topic, duration, focus } = params;

  // Duration distribution based on class length
  const durationNum = parseInt(duration);
  const warmUpTime = Math.round(durationNum * 0.15);
  const mainTime = Math.round(durationNum * 0.65);
  const wrapUpTime = Math.round(durationNum * 0.2);

  // Level-appropriate complexity
  const levelComplexity: Record<string, { vocab: string; tasks: string }> = {
    A1: { vocab: "basic", tasks: "simple matching and repetition" },
    A2: { vocab: "elementary", tasks: "gap-fill and short dialogues" },
    B1: { vocab: "intermediate", tasks: "information gap and role-plays" },
    B2: { vocab: "upper-intermediate", tasks: "debates and presentations" },
    C1: { vocab: "advanced", tasks: "analysis and synthesis tasks" },
  };

  const complexity = levelComplexity[level];

  // Generate focus-specific activities
  const focusActivities: Record<string, { warm: string[]; main: string[]; wrap: string[] }> = {
    Grammar: {
      warm: [
        `Review previous ${complexity.vocab} grammar structures through quick elicitation`,
        `Show visual prompts to activate prior knowledge about ${topic}`,
      ],
      main: [
        `Present ${topic} using the guided discovery approach (Cambridge methodology)`,
        `Controlled practice: ${complexity.tasks} focusing on form`,
        `Semi-controlled practice: personalized sentence completion`,
        `Freer practice: communicative activity applying ${topic} in context`,
      ],
      wrap: [
        `Error correction based on monitoring during activities`,
        `Summarize key rules and usage patterns`,
        `Quick comprehension check with exit tickets`,
      ],
    },
    Speaking: {
      warm: [
        `Discussion questions to activate topic vocabulary`,
        `Brainstorming activity related to ${topic}`,
      ],
      main: [
        `Model dialogue demonstrating target language for ${topic}`,
        `Controlled speaking: structured dialogue practice in pairs`,
        `Information gap activity requiring use of ${topic}`,
        `Role-play scenario for freer practice (British Council communicative approach)`,
      ],
      wrap: [
        `Peer feedback session on fluency and accuracy`,
        `Class discussion summarizing key expressions`,
        `Self-assessment checklist completion`,
      ],
    },
    Listening: {
      warm: [
        `Pre-listening vocabulary presentation with visuals`,
        `Prediction activity based on topic: ${topic}`,
      ],
      main: [
        `First listening for gist (global understanding)`,
        `Second listening for specific information`,
        `Detailed listening with ${complexity.tasks}`,
        `Post-listening discussion connecting to personal experience`,
      ],
      wrap: [
        `Review answers and clarify difficult sections`,
        `Vocabulary consolidation from listening text`,
        `Brief speaking activity using new language`,
      ],
    },
    Reading: {
      warm: [
        `Pre-reading prediction from title and images`,
        `Vocabulary pre-teaching for key terms in ${topic}`,
      ],
      main: [
        `Skimming activity for main idea (timed reading)`,
        `Scanning for specific information`,
        `Intensive reading with comprehension questions`,
        `Critical thinking discussion about text content`,
      ],
      wrap: [
        `Vocabulary review using context clues`,
        `Text reconstruction or summary activity`,
        `Connection to personal opinions or experiences`,
      ],
    },
  };

  const activities = focusActivities[focus];

  const plan: LessonPlan = {
    title: `${topic} - ${focus} Focus (${level})`,
    level,
    duration: `${duration} minutes`,
    focus,
    objectives: [
      `Students will be able to understand and identify ${topic} in context`,
      `Students will practice using ${topic} in ${complexity.tasks}`,
      `Students will demonstrate ${focus.toLowerCase()} skills at ${level} level`,
    ],
    warmUp: {
      title: "Warm-up / Lead-in",
      duration: `${warmUpTime} minutes`,
      activities: activities.warm,
      materials: ["Whiteboard", "Visual prompts / flashcards"],
      teacherNotes: `Monitor student engagement. Adapt complexity based on ${level} student responses.`,
    },
    mainActivity: {
      title: "Main Activity / Presentation & Practice",
      duration: `${mainTime} minutes`,
      activities: activities.main,
      materials: [
        "Handouts with exercises",
        "Audio/visual materials",
        "Worksheet for controlled practice",
      ],
      teacherNotes: `Follow PPP (Presentation-Practice-Production) or Task-Based Learning approach as appropriate. Ensure activities align with ${level} CEFR descriptors.`,
    },
    wrapUp: {
      title: "Wrap-up / Consolidation",
      duration: `${wrapUpTime} minutes`,
      activities: activities.wrap,
      materials: ["Exit ticket template", "Self-assessment form"],
      teacherNotes: "Note common errors for future lesson planning. Provide positive reinforcement.",
    },
    homework: `Complete workbook exercises on ${topic}. Write 5 original sentences/questions using today's language.`,
    assessment: `Formative assessment through monitoring, exit tickets, and participation. ${focus === "Speaking" ? "Use Cambridge speaking assessment criteria." : "Check written work for accuracy."}`,
  };

  return plan;
}

/**
 * In production, this would be the actual OpenAI integration.
 * Keeping this as a reference for future implementation.
 */
export async function generateWithOpenAI(
  params: LessonParameters
): Promise<LessonPlan> {
  const prompt = buildPrompt(params);

  // Simulated delay to mimic API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // For MVP, return simulated response
  // In production, you would:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [{ role: "user", content: prompt }],
  //   response_format: { type: "json_object" },
  // });
  // return JSON.parse(response.choices[0].message.content);

  return simulateAIResponse(params);
}
