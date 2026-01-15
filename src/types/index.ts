// Types for English Plan Creator - International ELT Methodology

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export type Duration = "45" | "60" | "90";

export type Focus = "Grammar" | "Speaking" | "Listening" | "Reading" | "Integrated";

export interface LessonParameters {
  level: Level;
  topic: string;
  duration: Duration;
  focus: Focus;
}

/**
 * Lesson stage following PPP (Presentation-Practice-Production) methodology
 * Based on international ELT standards from Cambridge, British Council, and CEFR
 */
export interface LessonStage {
  title: string;
  duration: string;
  activities: string[];
  materials?: string[];
  teacherNotes?: string;
  /** Learning objective for this stage */
  stageObjective?: string;
}

/**
 * Lesson plan following international ELT methodology
 * 
 * Technical references:
 * - Cambridge English: https://www.cambridgeenglish.org
 * - British Council: https://www.britishcouncil.org
 * - Common European Framework of Reference (CEFR)
 * 
 * Methodology: PPP (Presentation-Practice-Production)
 * - Lead-in/Warm-up: Activate prior knowledge and engage students
 * - Presentation: Introduce new language in context
 * - Practice: Controlled and semi-controlled practice activities
 * - Production: Free practice and communicative activities
 */
export interface LessonPlan {
  title: string;
  level: Level;
  duration: string;
  focus: Focus;
  objectives: string[];
  
  /**
   * Lesson Context: Brief description of the communicative context
   * and relevance for the target learners
   */
  lessonContext: string;
  
  /**
   * LEAD-IN / WARM-UP: Engage students and activate prior knowledge
   * Set the context and generate interest in the topic
   */
  leadIn: LessonStage;
  
  /**
   * PRESENTATION: Introduce new language in context
   * Present target language through meaningful context
   */
  presentation: LessonStage;
  
  /**
   * PRACTICE: Controlled and semi-controlled practice
   * Students practice the target language with support
   */
  practice: LessonStage;
  
  /**
   * PRODUCTION: Free practice and communicative activities
   * Students use the language freely in communicative tasks
   */
  production: LessonStage;
  
  /**
   * Wrap-up activity or final task consolidating the lesson
   */
  wrapUp: string;
  
  homework?: string;
  assessment?: string;
}

export interface GenerateRequest {
  parameters: LessonParameters;
}

export interface GenerateResponse {
  success: boolean;
  plan?: LessonPlan;
  error?: string;
}

// ============================================================
// Legacy interfaces for backward compatibility
// ============================================================

export interface LessonSection {
  title: string;
  duration: string;
  activities: string[];
  materials?: string[];
  teacherNotes?: string;
}

// Legacy alias - keeping for backward compatibility
export type DialecticalSection = LessonStage;
