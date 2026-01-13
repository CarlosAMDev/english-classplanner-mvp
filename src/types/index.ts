// Types for English Plan Creator - Dialectical Materialist Approach

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export type Duration = "45" | "60" | "90";

export type Focus = "Grammar" | "Speaking" | "Listening" | "Reading";

export interface LessonParameters {
  level: Level;
  topic: string;
  duration: Duration;
  focus: Focus;
}

/**
 * Sección dialéctica del plan de clase
 * Basada en la estructura Tesis-Antítesis-Síntesis
 */
export interface DialecticalSection {
  title: string;
  duration: string;
  activities: string[];
  materials?: string[];
  teacherNotes?: string;
  /** Objetivo dialéctico de esta fase */
  dialecticalObjective?: string;
}

/**
 * Plan de clase con enfoque dialéctico materialista
 * 
 * Fuentes de referencia técnica:
 * - Cambridge English: https://www.cambridgeenglish.org
 * - British Council: https://www.britishcouncil.org
 * - Marco Común Europeo de Referencia (CEFR)
 */
export interface LessonPlan {
  title: string;
  level: Level;
  duration: string;
  focus: Focus;
  objectives: string[];
  
  /**
   * Contexto Social: Explicación de por qué este tema es relevante
   * para la vida material y concreta del estudiante
   */
  contextoSocial: string;
  
  /**
   * TESIS: Presentación del concepto
   * Introducción del tema desde la realidad concreta del estudiante
   */
  tesis: DialecticalSection;
  
  /**
   * ANTÍTESIS: Problematización
   * Confrontación del concepto con contradicciones del mundo real
   */
  antitesis: DialecticalSection;
  
  /**
   * SÍNTESIS: Praxis transformadora
   * Aplicación práctica para transformar la realidad usando el idioma
   */
  sintesis: DialecticalSection;
  
  /**
   * Actividad de Praxis: Tarea final donde el alumno usa el inglés
   * para una acción colectiva o social transformadora
   */
  actividadPraxis: string;
  
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
