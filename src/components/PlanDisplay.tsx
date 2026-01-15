"use client";

import { useState, useEffect } from "react";
import { LessonPlan, LessonStage } from "@/types";

interface PlanDisplayProps {
  plan: LessonPlan;
  onPlanUpdate: (plan: LessonPlan) => void;
  onExportPDF: () => void;
}

interface EditableLessonStageProps {
  stage: LessonStage;
  stageKey: "leadIn" | "presentation" | "practice" | "production";
  colorClass: string;
  iconBg: string;
  icon: React.ReactNode;
  stageLabel: string;
  onUpdate: (key: "leadIn" | "presentation" | "practice" | "production", stage: LessonStage) => void;
}

function EditableLessonStage({
  stage,
  stageKey,
  colorClass,
  iconBg,
  icon,
  stageLabel,
  onUpdate,
}: EditableLessonStageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivities, setEditedActivities] = useState(stage.activities.join("\n"));
  const [editedNotes, setEditedNotes] = useState(stage.teacherNotes || "");

  useEffect(() => {
    setEditedActivities(stage.activities.join("\n"));
    setEditedNotes(stage.teacherNotes || "");
  }, [stage]);

  const handleSave = () => {
    onUpdate(stageKey, {
      ...stage,
      activities: editedActivities.split("\n").filter((a) => a.trim()),
      teacherNotes: editedNotes,
    });
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-l-4 ${colorClass} overflow-hidden`}>
      <div className="p-3 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${iconBg} flex-shrink-0`}>{icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${iconBg} ${colorClass.replace('border-', 'text-')}`}>
                  {stageLabel}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">{stage.duration}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{stage.title}</h3>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors self-end sm:self-auto flex-shrink-0 ${
              isEditing
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        {/* Stage Objective */}
        {stage.stageObjective && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border-l-2 border-gray-300">
            <span className="text-xs font-medium text-gray-500">Stage objective: </span>
            <span className="text-xs text-gray-700">{stage.stageObjective}</span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Activities (one per line)
              </label>
              <textarea
                value={editedActivities}
                onChange={(e) => setEditedActivities(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Teacher Notes
              </label>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                rows={2}
                placeholder="Add notes..."
              />
            </div>
          </div>
        ) : (
          <div>
            <ul className="space-y-1.5 sm:space-y-2">
              {stage.activities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                  <span className={`mt-0.5 ${colorClass.replace('border-', 'text-')}`}>•</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
            {stage.materials && stage.materials.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">Materials: </span>
                <span className="text-xs text-gray-600">
                  {stage.materials.join(", ")}
                </span>
              </div>
            )}
            {stage.teacherNotes && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                <span className="text-xs font-medium text-yellow-700">Notes: </span>
                <span className="text-xs text-yellow-800">{stage.teacherNotes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanDisplay({ plan, onPlanUpdate, onExportPDF }: PlanDisplayProps) {
  const handleStageUpdate = (
    key: "leadIn" | "presentation" | "practice" | "production",
    stage: LessonStage
  ) => {
    onPlanUpdate({ ...plan, [key]: stage });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{plan.title}</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full">
                Level: {plan.level}
              </span>
              <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full">
                {plan.duration}
              </span>
              <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full">
                Focus: {plan.focus}
              </span>
            </div>
          </div>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="sm:inline">Export PDF</span>
          </button>
        </div>

        {/* Objectives */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="text-xs sm:text-sm font-semibold mb-2 opacity-90">Learning Objectives</h4>
          <ul className="grid grid-cols-1 gap-2">
            {plan.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                <svg className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lesson Context Card */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lesson Context
        </h4>
        <p className="text-xs sm:text-sm text-slate-700">{plan.lessonContext}</p>
      </div>

      {/* PPP Stages */}
      <div className="grid gap-3 sm:gap-4">
        {/* LEAD-IN */}
        <EditableLessonStage
          stage={plan.leadIn}
          stageKey="leadIn"
          colorClass="border-purple-500"
          iconBg="bg-purple-100"
          stageLabel="LEAD-IN"
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onUpdate={handleStageUpdate}
        />

        {/* PRESENTATION */}
        <EditableLessonStage
          stage={plan.presentation}
          stageKey="presentation"
          colorClass="border-blue-500"
          iconBg="bg-blue-100"
          stageLabel="PRESENTATION"
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          onUpdate={handleStageUpdate}
        />

        {/* PRACTICE */}
        <EditableLessonStage
          stage={plan.practice}
          stageKey="practice"
          colorClass="border-orange-500"
          iconBg="bg-orange-100"
          stageLabel="PRACTICE"
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          onUpdate={handleStageUpdate}
        />

        {/* PRODUCTION */}
        <EditableLessonStage
          stage={plan.production}
          stageKey="production"
          colorClass="border-green-500"
          iconBg="bg-green-100"
          stageLabel="PRODUCTION"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onUpdate={handleStageUpdate}
        />
      </div>

      {/* Wrap-up Activity */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border-2 border-indigo-200">
        <h4 className="font-bold text-indigo-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Wrap-up</span>
        </h4>
        <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed">{plan.wrapUp}</p>
      </div>

      {/* Homework & Assessment */}
      {(plan.homework || plan.assessment) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {plan.homework && (
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-base sm:text-lg">📚</span> Homework
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">{plan.homework}</p>
            </div>
          )}
          {plan.assessment && (
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-base sm:text-lg">📊</span> Assessment
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">{plan.assessment}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        Generated using PPP methodology | 
        References: Cambridge English, British Council, CEFR
      </div>
    </div>
  );
}
