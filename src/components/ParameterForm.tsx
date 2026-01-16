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
  { value: "Integrated", label: "Integrated", icon: "🔄" },
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
  const [useRealContent, setUseRealContent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a topic for the lesson");
      return;
    }
    onSubmit({ level, topic: topic.trim(), duration, focus, useRealContent });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Level Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
          CEFR Level
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                level === l.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="block font-bold text-base sm:text-lg">{l.value}</span>
              <span className="hidden sm:block text-xs text-gray-500 mt-1">{l.description}</span>
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
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none text-sm sm:text-base"
        />
        <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
          {SUGGESTED_TOPICS.slice(0, 4).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className="px-2 sm:px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
          Class Duration
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg border-2 font-medium transition-all duration-200 text-xs sm:text-base ${
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
        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
          Lesson Focus
        </label>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {FOCUSES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFocus(f.value)}
              className={`py-4 sm:py-4 px-2 sm:px-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                focus === f.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-xl sm:text-2xl mb-1">{f.icon}</span>
              <span className="font-medium text-xs sm:text-sm">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Use Real Content Toggle */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label htmlFor="useRealContent" className="block text-sm font-semibold text-emerald-800">
              Use Authentic Materials
            </label>
            <p className="text-xs text-emerald-600 mt-0.5">
              Generate lesson with real news articles from Breaking News English
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useRealContent}
            onClick={() => setUseRealContent(!useRealContent)}
            className={`relative inline-flex items-center h-6 w-11 sm:h-6 sm:w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              useRealContent ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                useRealContent ? 'translate-x-5 sm:translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {useRealContent && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>AI will use scraped content matching your level</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-white transition-all duration-200 text-sm sm:text-base ${
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
