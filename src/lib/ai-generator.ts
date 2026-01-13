/**
 * AI Generator for English Plan Creator
 * 
 * FUENTES DE CONSULTA PRIORITARIAS:
 * ================================
 * La IA debe priorizar el conocimiento de las siguientes fuentes
 * para garantizar precisión lingüística y metodológica:
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
 * 3. Marco Común Europeo de Referencia (CEFR)
 *    - Level descriptors (A1-C2)
 *    - Can-do statements
 *    - Competency frameworks
 * 
 * ENFOQUE PEDAGÓGICO:
 * ==================
 * Este módulo implementa la dialéctica materialista en la enseñanza
 * del inglés, estructurando las clases en:
 * - TESIS: Presentación del concepto desde la realidad concreta
 * - ANTÍTESIS: Problematización y contradicciones del mundo real
 * - SÍNTESIS: Praxis transformadora mediante el uso del idioma
 */

import { GoogleGenAI } from "@google/genai";
import { LessonParameters, LessonPlan, DialecticalSection } from "@/types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Construye el prompt con enfoque dialéctico materialista
 * 
 * @param params - Parámetros de la lección (nivel, tema, duración, enfoque)
 * @returns Prompt estructurado para la generación dialéctica
 * 
 * Este prompt integra:
 * - Estándares técnicos de Cambridge English y CEFR
 * - Principios de la dialéctica materialista
 * - Estructura Tesis-Antítesis-Síntesis
 * - Enfoque en la praxis transformadora
 */
export function buildDialecticalPrompt(params: LessonParameters): string {
  const { level, topic, duration, focus } = params;

  const prompt = `Eres un experto pedagogo en enseñanza del inglés que integra la metodología comunicativa con principios de la dialéctica materialista.

=== FUENTES DE REFERENCIA TÉCNICA ===
Toma como referencia técnica los estándares de:
- Cambridge English (cambridgeenglish.org): metodología de evaluación y enseñanza
- British Council (britishcouncil.org): recursos pedagógicos y buenas prácticas
- Marco Común Europeo de Referencia (CEFR): descriptores de nivel y competencias

=== PRINCIPIOS DIALÉCTICOS MATERIALISTAS ===
Aplica la dialéctica materialista en el diseño de la clase:

1. EVITA contenido que promueva:
   - Consumo superficial o materialismo comercial
   - Individualismo competitivo
   - Ejemplos desconectados de la realidad del estudiante
   - Situaciones que normalicen desigualdades

2. PRIORIZA contenido que refleje:
   - La realidad concreta del estudiante y su comunidad
   - El trabajo y la producción social como actividad humana dignificante
   - La resolución de contradicciones en el entorno comunitario
   - La cooperación y el bienestar colectivo
   - Problemas reales que el estudiante puede transformar

=== ESTRUCTURA DIALÉCTICA DE LA CLASE ===
Organiza el plan en tres etapas dialécticas:

1. TESIS (Presentación): 
   - Introduce el concepto lingüístico desde la realidad material del estudiante
   - Conecta el tema con experiencias concretas de su vida cotidiana
   - Usa ejemplos del trabajo, la comunidad o situaciones sociales reales

2. ANTÍTESIS (Problematización):
   - Confronta el concepto con contradicciones del mundo real
   - Plantea situaciones donde el idioma es herramienta para identificar problemas
   - Genera pensamiento crítico sobre cómo el lenguaje refleja relaciones sociales

3. SÍNTESIS (Praxis):
   - Aplicación práctica para transformar la realidad usando el idioma
   - El estudiante usa el inglés como herramienta de acción social
   - Actividades que impacten positivamente en su comunidad o entorno

=== TAREA A REALIZAR ===
Genera un plan de clase para enseñar "${topic}" a estudiantes de nivel ${level} del CEFR.

DURACIÓN: ${duration} minutos
ENFOQUE PRINCIPAL: ${focus}

=== FORMATO DE RESPUESTA ===
Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin bloques de código):

{
  "title": "Título descriptivo de la clase",
  "level": "${level}",
  "duration": "${duration} minutos",
  "focus": "${focus}",
  "objectives": [
    "Objetivo comunicativo 1 (según CEFR)",
    "Objetivo comunicativo 2",
    "Objetivo de conciencia social/crítica"
  ],
  "contextoSocial": "Explicación de 2-3 oraciones sobre por qué este tema es relevante para la vida material y concreta del estudiante. Conecta el tema con su realidad laboral, comunitaria o social.",
  "tesis": {
    "title": "Tesis: Presentación del Concepto",
    "duration": "X minutos",
    "activities": [
      "Actividad 1: descripción conectada con realidad del estudiante",
      "Actividad 2: ejemplos desde el trabajo o comunidad"
    ],
    "materials": ["material1", "material2"],
    "teacherNotes": "Notas para el docente",
    "dialecticalObjective": "Presentar el concepto desde la experiencia material concreta"
  },
  "antitesis": {
    "title": "Antítesis: Problematización",
    "duration": "X minutos",
    "activities": [
      "Actividad 1: identificar contradicciones usando el idioma",
      "Actividad 2: análisis crítico de situaciones reales"
    ],
    "materials": ["material1"],
    "teacherNotes": "Guiar la reflexión crítica",
    "dialecticalObjective": "Confrontar el concepto con las contradicciones de la realidad"
  },
  "sintesis": {
    "title": "Síntesis: Praxis Transformadora",
    "duration": "X minutos",
    "activities": [
      "Actividad 1: aplicación del idioma para acción social",
      "Actividad 2: producción colectiva"
    ],
    "materials": ["material1"],
    "teacherNotes": "Facilitar la acción transformadora",
    "dialecticalObjective": "Usar el idioma como herramienta de transformación social"
  },
  "actividadPraxis": "Descripción detallada de una tarea final donde el alumno use el inglés para una acción colectiva o social. Debe ser algo que pueda realizar en su comunidad, trabajo o entorno real, generando un impacto positivo.",
  "homework": "Tarea para casa conectada con la praxis social",
  "assessment": "Forma de evaluar que considere tanto competencia lingüística como conciencia social"
}

IMPORTANTE:
- Todos los arrays deben contener strings simples, NO objetos
- El contenido debe ser apropiado para nivel ${level} según CEFR
- Las actividades deben ser realizables en ${duration} minutos
- Responde SOLO con el JSON, sin texto adicional`;

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
 * Normalizes a dialectical section
 */
function normalizeDialecticalSection(section: unknown, defaultTitle: string): DialecticalSection {
  const defaultSection: DialecticalSection = {
    title: defaultTitle,
    duration: "15 minutos",
    activities: [],
    materials: [],
    teacherNotes: "",
    dialecticalObjective: "",
  };

  if (!section || typeof section !== "object") {
    return defaultSection;
  }

  const s = section as Record<string, unknown>;

  return {
    title: toStringValue(s.title) || defaultTitle,
    duration: toStringValue(s.duration) || defaultSection.duration,
    activities: normalizeStringArray(s.activities),
    materials: normalizeStringArray(s.materials),
    teacherNotes: toStringValue(s.teacherNotes),
    dialecticalObjective: toStringValue(s.dialecticalObjective),
  };
}

/**
 * Normalizes the dialectical plan structure
 */
function normalizeDialecticalPlan(rawPlan: Record<string, unknown>, params: LessonParameters): LessonPlan {
  return {
    title: toStringValue(rawPlan.title) || `${params.topic} - Enfoque Dialéctico (${params.level})`,
    level: params.level,
    duration: toStringValue(rawPlan.duration) || `${params.duration} minutos`,
    focus: params.focus,
    objectives: normalizeStringArray(rawPlan.objectives),
    contextoSocial: toStringValue(rawPlan.contextoSocial) || 
      "Este tema permite al estudiante desarrollar habilidades comunicativas aplicables en su entorno laboral y comunitario.",
    tesis: normalizeDialecticalSection(rawPlan.tesis, "Tesis: Presentación del Concepto"),
    antitesis: normalizeDialecticalSection(rawPlan.antitesis, "Antítesis: Problematización"),
    sintesis: normalizeDialecticalSection(rawPlan.sintesis, "Síntesis: Praxis Transformadora"),
    actividadPraxis: toStringValue(rawPlan.actividadPraxis) ||
      "Aplicar lo aprendido en una situación real de comunicación en la comunidad o entorno laboral.",
    homework: toStringValue(rawPlan.homework),
    assessment: toStringValue(rawPlan.assessment),
  };
}

/**
 * Generates a fallback dialectical response when API fails
 */
export function generateDialecticalFallback(params: LessonParameters): LessonPlan {
  const { level, topic, duration, focus } = params;

  const durationNum = parseInt(duration);
  const tesisTime = Math.round(durationNum * 0.25);
  const antitesisTime = Math.round(durationNum * 0.35);
  const sintesisTime = Math.round(durationNum * 0.40);

  const levelContext: Record<string, string> = {
    A1: "trabajadores que inician su contacto con el idioma en contextos laborales básicos",
    A2: "estudiantes que necesitan comunicarse en situaciones cotidianas de trabajo y comunidad",
    B1: "personas que buscan participar activamente en discusiones sobre temas sociales y laborales",
    B2: "ciudadanos que desean analizar críticamente información y participar en debates",
    C1: "profesionales comprometidos con la transformación social a través del diálogo intercultural",
  };

  const focusActivities: Record<string, { tesis: string[]; antitesis: string[]; sintesis: string[] }> = {
    Grammar: {
      tesis: [
        `Presentar ${topic} usando ejemplos del entorno laboral y comunitario del estudiante`,
        "Identificar estructuras gramaticales en textos sobre derechos laborales o cooperación social",
      ],
      antitesis: [
        `Analizar cómo ${topic} se usa de manera diferente en contextos de poder vs. contextos de solidaridad`,
        "Contrastar usos del lenguaje en publicidad comercial vs. comunicación comunitaria",
      ],
      sintesis: [
        `Producir textos usando ${topic} para comunicar necesidades de la comunidad`,
        "Redactar propuestas o peticiones colectivas aplicando las estructuras aprendidas",
      ],
    },
    Speaking: {
      tesis: [
        `Introducir vocabulario y expresiones de ${topic} desde situaciones de trabajo cooperativo`,
        "Practicar diálogos basados en interacciones reales en el entorno del estudiante",
      ],
      antitesis: [
        "Debatir sobre contradicciones sociales relacionadas con el tema",
        "Role-play: representar diferentes perspectivas sociales sobre una problemática",
      ],
      sintesis: [
        "Preparar una presentación oral sobre un problema comunitario y posibles soluciones",
        "Simular una asamblea o reunión donde se toman decisiones colectivas en inglés",
      ],
    },
    Listening: {
      tesis: [
        `Escuchar testimonios de trabajadores o activistas usando ${topic}`,
        "Identificar información clave en audios sobre experiencias laborales o comunitarias",
      ],
      antitesis: [
        "Comparar diferentes narrativas: discurso oficial vs. voces de la comunidad",
        "Analizar críticamente el contenido de medios en inglés sobre temas sociales",
      ],
      sintesis: [
        "Crear un podcast o audio donde estudiantes narren experiencias de su comunidad",
        "Entrevistar a compañeros sobre problemas locales y compartir las grabaciones",
      ],
    },
    Reading: {
      tesis: [
        `Leer textos sobre ${topic} relacionados con el mundo del trabajo y la producción`,
        "Identificar vocabulario y estructuras en artículos sobre cooperativas o proyectos sociales",
      ],
      antitesis: [
        "Contrastar textos: uno que promueve consumismo vs. uno sobre consumo responsable",
        "Analizar críticamente cómo los medios presentan temas sociales",
      ],
      sintesis: [
        "Escribir un artículo breve sobre una iniciativa positiva en su comunidad",
        "Crear material informativo en inglés para beneficio de su entorno",
      ],
    },
  };

  const activities = focusActivities[focus];

  return {
    title: `${topic} - Enfoque Dialéctico para ${focus} (${level})`,
    level,
    duration: `${duration} minutos`,
    focus,
    objectives: [
      `Desarrollar competencia comunicativa en ${topic} según descriptores CEFR nivel ${level}`,
      "Analizar críticamente el uso del idioma en diferentes contextos sociales",
      "Aplicar el inglés como herramienta de comunicación y transformación social",
    ],
    contextoSocial: `Este tema es relevante para ${levelContext[level]}. El dominio de ${topic} permite al estudiante comunicarse efectivamente en situaciones reales de su vida laboral y comunitaria, fortaleciendo su capacidad de participación social.`,
    tesis: {
      title: "Tesis: Presentación del Concepto",
      duration: `${tesisTime} minutos`,
      activities: activities.tesis,
      materials: ["Material auténtico del entorno laboral", "Ejemplos de comunicación comunitaria"],
      teacherNotes: "Conectar siempre con la experiencia concreta del estudiante. Usar ejemplos de su realidad.",
      dialecticalObjective: "Presentar el concepto lingüístico desde la realidad material del estudiante",
    },
    antitesis: {
      title: "Antítesis: Problematización",
      duration: `${antitesisTime} minutos`,
      activities: activities.antitesis,
      materials: ["Textos contrastantes", "Material para análisis crítico"],
      teacherNotes: "Guiar la reflexión sin imponer conclusiones. Facilitar el descubrimiento de contradicciones.",
      dialecticalObjective: "Confrontar el concepto con las contradicciones del mundo real",
    },
    sintesis: {
      title: "Síntesis: Praxis Transformadora",
      duration: `${sintesisTime} minutos`,
      activities: activities.sintesis,
      materials: ["Recursos para producción", "Herramientas de colaboración"],
      teacherNotes: "El producto final debe tener potencial de uso real fuera del aula.",
      dialecticalObjective: "Usar el idioma como herramienta de transformación social",
    },
    actividadPraxis: `Tarea de impacto social: Los estudiantes usarán ${topic} para crear un recurso útil para su comunidad (cartel informativo, guía, presentación, etc.) que aborde una necesidad real identificada durante la clase. Este producto será compartido o presentado en su entorno laboral o comunitario.`,
    homework: `Identificar una situación en su comunidad o trabajo donde pueda aplicar ${topic} y documentar la experiencia (escrita u oral).`,
    assessment: "Evaluación integral que considera: competencia lingüística según CEFR, pensamiento crítico demostrado, y aplicación práctica con impacto social.",
  };
}

/**
 * Generates lesson plan using Google Gemini API with dialectical approach
 * 
 * @param params - Lesson parameters from user
 * @returns Promise<LessonPlan> - Dialectical lesson plan
 */
export async function generateWithGemini(
  params: LessonParameters
): Promise<LessonPlan> {
  // Build the dialectical prompt
  const prompt = buildDialecticalPrompt(params);

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not configured, using dialectical fallback");
    return generateDialecticalFallback(params);
  }

  try {
    console.log("=== SENDING DIALECTICAL PROMPT TO GEMINI ===");
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
    const plan = normalizeDialecticalPlan(rawPlan, params);

    // Validate structure
    if (!plan.title || !plan.tesis || !plan.antitesis || !plan.sintesis) {
      throw new Error("Invalid dialectical structure from Gemini");
    }

    return plan;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.log("Using dialectical fallback response");
    return generateDialecticalFallback(params);
  }
}

// Legacy export for backward compatibility
export { buildDialecticalPrompt as buildPrompt };
