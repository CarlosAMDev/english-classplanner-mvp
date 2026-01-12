"use client";

import { useState } from "react";
import { LessonParameters, Level, Duration, Focus } from "@/types";

interface ParameterFormProps {
  onSubmit: (parameters: LessonParameters) => void;
  isLoading: boolean;
}

const LEVELS: { value: Level; label: string; description: string }[] = [
  { value: "A1", label: "A1 - Beginner", description: "Basic phrases and expressions" },
  { value: "A2", label: "A2 - Elementary", description: "Simple everyday situations" },
  { value: "B1", label: "B1 - Intermediate", description: "Main points on familiar matters" },
  { value: "B2", label: "B2 - Upper Intermediate", description: "Complex text main ideas" },
  { value: "C1", label: "C1 - Advanced", description: "Demanding, longer texts" },
];

const DURATIONS: { value: Duration; label: string }[] = [
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
];

const FOCUSES: { value: Focus; label: string; icon: string }[] = [
  { value: "Grammar", label: "Grammar", icon: "📝" },
  { value: "Speaking", label: "Speaking", icon: "🗣️" },
  { value: "Listening", label: "Listening", icon: "👂" },
  { value: "Reading", label: "Reading", icon: "📖" },
];

const SUGGESTED_TOPICS = [
  "Simple Past Tense",
  "Present Perfect",
  "Vocabulary: Food & Cooking",
  "Vocabulary: Travel",
  "Conditionals (First & Second)",
  "Passive Voice",
  "Reported Speech",
  "Vocabulary: Work & Jobs",
  "Comparatives & Superlatives",
  "Modal Verbs",
];

export default function ParameterForm({ onSubmit, isLoading }: ParameterFormProps) {
  const [level, setLevel] = useState<Level>("B1");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState<Duration>("60");
  const [focus, setFocus] = useState<Focus>("Grammar");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a topic for the lesson");
      return;
    }
    onSubmit({ level, topic: topic.trim(), duration, focus });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Level Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          CEFR Level
        </label>
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                level === l.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="block font-bold text-lg">{l.value}</span>
              <span className="block text-xs text-gray-500 mt-1">{l.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Input */}
      <div>
        <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
          Lesson Topic
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Simple Past Tense, Vocabulary: Food..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.slice(0, 5).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Class Duration
        </label>
        <div className="flex gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                duration === d.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Lesson Focus
        </label>
        <div className="grid grid-cols-4 gap-3">
          {FOCUSES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFocus(f.value)}
              className={`py-4 px-3 rounded-lg border-2 transition-all duration-200 ${
                focus === f.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="block text-2xl mb-1">{f.icon}</span>
              <span className="block font-medium text-sm">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          isLoading || !topic.trim()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating Plan...
          </span>
        ) : (
          "Generate Lesson Plan"
        )}
      </button>
    </form>
  );
}
