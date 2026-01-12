// Types for English Plan Creator

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export type Duration = "45" | "60" | "90";

export type Focus = "Grammar" | "Speaking" | "Listening" | "Reading";

export interface LessonParameters {
  level: Level;
  topic: string;
  duration: Duration;
  focus: Focus;
}

export interface LessonSection {
  title: string;
  duration: string;
  activities: string[];
  materials?: string[];
  teacherNotes?: string;
}

export interface LessonPlan {
  title: string;
  level: Level;
  duration: string;
  focus: Focus;
  objectives: string[];
  warmUp: LessonSection;
  mainActivity: LessonSection;
  wrapUp: LessonSection;
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
