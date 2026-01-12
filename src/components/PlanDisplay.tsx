"use client";

import { useState, useEffect } from "react";
import { LessonPlan, LessonSection } from "@/types";

interface PlanDisplayProps {
  plan: LessonPlan;
  onPlanUpdate: (plan: LessonPlan) => void;
  onExportPDF: () => void;
}

interface EditableSectionProps {
  section: LessonSection;
  sectionKey: "warmUp" | "mainActivity" | "wrapUp";
  colorClass: string;
  iconBg: string;
  icon: React.ReactNode;
  onUpdate: (key: "warmUp" | "mainActivity" | "wrapUp", section: LessonSection) => void;
}

function EditableSection({
  section,
  sectionKey,
  colorClass,
  iconBg,
  icon,
  onUpdate,
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivities, setEditedActivities] = useState(section.activities.join("\n"));
  const [editedNotes, setEditedNotes] = useState(section.teacherNotes || "");

  useEffect(() => {
    setEditedActivities(section.activities.join("\n"));
    setEditedNotes(section.teacherNotes || "");
  }, [section]);

  const handleSave = () => {
    onUpdate(sectionKey, {
      ...section,
      activities: editedActivities.split("\n").filter((a) => a.trim()),
      teacherNotes: editedNotes,
    });
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${colorClass} overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
            <div>
              <h3 className="font-bold text-gray-800">{section.title}</h3>
              <span className="text-sm text-gray-500">{section.duration}</span>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Activities (one per line)
              </label>
              <textarea
                value={editedActivities}
                onChange={(e) => setEditedActivities(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
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
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                rows={2}
                placeholder="Add notes for yourself..."
              />
            </div>
          </div>
        ) : (
          <div>
            <ul className="space-y-2">
              {section.activities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
            {section.materials && section.materials.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">Materials: </span>
                <span className="text-xs text-gray-600">
                  {section.materials.join(", ")}
                </span>
              </div>
            )}
            {section.teacherNotes && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                <span className="text-xs font-medium text-yellow-700">Notes: </span>
                <span className="text-xs text-yellow-800">{section.teacherNotes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanDisplay({ plan, onPlanUpdate, onExportPDF }: PlanDisplayProps) {
  const handleSectionUpdate = (
    key: "warmUp" | "mainActivity" | "wrapUp",
    section: LessonSection
  ) => {
    onPlanUpdate({ ...plan, [key]: section });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 bg-white/20 rounded-full">
                Level: {plan.level}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full">
                {plan.duration}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full">
                Focus: {plan.focus}
              </span>
            </div>
          </div>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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
            Export PDF
          </button>
        </div>

        {/* Objectives */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Learning Objectives</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {plan.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Lesson Sections */}
      <div className="grid gap-4">
        {/* Warm-up */}
        <EditableSection
          section={plan.warmUp}
          sectionKey="warmUp"
          colorClass="border-amber-400"
          iconBg="bg-amber-100"
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          onUpdate={handleSectionUpdate}
        />

        {/* Main Activity */}
        <EditableSection
          section={plan.mainActivity}
          sectionKey="mainActivity"
          colorClass="border-primary-500"
          iconBg="bg-primary-100"
          icon={
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          onUpdate={handleSectionUpdate}
        />

        {/* Wrap-up */}
        <EditableSection
          section={plan.wrapUp}
          sectionKey="wrapUp"
          colorClass="border-green-500"
          iconBg="bg-green-100"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onUpdate={handleSectionUpdate}
        />
      </div>

      {/* Additional Info */}
      {(plan.homework || plan.assessment) && (
        <div className="grid md:grid-cols-2 gap-4">
          {plan.homework && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-lg">📚</span> Homework
              </h4>
              <p className="text-sm text-gray-600">{plan.homework}</p>
            </div>
          )}
          {plan.assessment && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-lg">📊</span> Assessment
              </h4>
              <p className="text-sm text-gray-600">{plan.assessment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
