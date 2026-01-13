"use client";

import { useState, useEffect } from "react";
import { LessonPlan, DialecticalSection } from "@/types";

interface PlanDisplayProps {
  plan: LessonPlan;
  onPlanUpdate: (plan: LessonPlan) => void;
  onExportPDF: () => void;
}

interface EditableDialecticalSectionProps {
  section: DialecticalSection;
  sectionKey: "tesis" | "antitesis" | "sintesis";
  colorClass: string;
  iconBg: string;
  icon: React.ReactNode;
  phaseLabel: string;
  onUpdate: (key: "tesis" | "antitesis" | "sintesis", section: DialecticalSection) => void;
}

function EditableDialecticalSection({
  section,
  sectionKey,
  colorClass,
  iconBg,
  icon,
  phaseLabel,
  onUpdate,
}: EditableDialecticalSectionProps) {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${iconBg} ${colorClass.replace('border-', 'text-')}`}>
                  {phaseLabel}
                </span>
                <span className="text-sm text-gray-500">{section.duration}</span>
              </div>
              <h3 className="font-bold text-gray-800">{section.title}</h3>
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
            {isEditing ? "Guardar" : "Editar"}
          </button>
        </div>

        {/* Dialectical Objective */}
        {section.dialecticalObjective && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border-l-2 border-gray-300">
            <span className="text-xs font-medium text-gray-500">Objetivo dialéctico: </span>
            <span className="text-xs text-gray-700">{section.dialecticalObjective}</span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Actividades (una por línea)
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
                Notas del docente
              </label>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                rows={2}
                placeholder="Añade notas..."
              />
            </div>
          </div>
        ) : (
          <div>
            <ul className="space-y-2">
              {section.activities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className={`mt-1 ${colorClass.replace('border-', 'text-')}`}>•</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
            {section.materials && section.materials.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">Materiales: </span>
                <span className="text-xs text-gray-600">
                  {section.materials.join(", ")}
                </span>
              </div>
            )}
            {section.teacherNotes && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                <span className="text-xs font-medium text-yellow-700">Notas: </span>
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
    key: "tesis" | "antitesis" | "sintesis",
    section: DialecticalSection
  ) => {
    onPlanUpdate({ ...plan, [key]: section });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 bg-white/20 rounded-full">
                Nivel: {plan.level}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full">
                {plan.duration}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full">
                Enfoque: {plan.focus}
              </span>
            </div>
          </div>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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
            Exportar PDF
          </button>
        </div>

        {/* Objectives */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Objetivos de Aprendizaje</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {plan.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Social Context Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Contexto Social
        </h4>
        <p className="text-sm text-amber-900">{plan.contextoSocial}</p>
      </div>

      {/* Dialectical Sections */}
      <div className="grid gap-4">
        {/* TESIS */}
        <EditableDialecticalSection
          section={plan.tesis}
          sectionKey="tesis"
          colorClass="border-blue-500"
          iconBg="bg-blue-100"
          phaseLabel="TESIS"
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          onUpdate={handleSectionUpdate}
        />

        {/* ANTÍTESIS */}
        <EditableDialecticalSection
          section={plan.antitesis}
          sectionKey="antitesis"
          colorClass="border-orange-500"
          iconBg="bg-orange-100"
          phaseLabel="ANTÍTESIS"
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onUpdate={handleSectionUpdate}
        />

        {/* SÍNTESIS */}
        <EditableDialecticalSection
          section={plan.sintesis}
          sectionKey="sintesis"
          colorClass="border-green-500"
          iconBg="bg-green-100"
          phaseLabel="SÍNTESIS"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onUpdate={handleSectionUpdate}
        />
      </div>

      {/* Praxis Activity */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-5 border-2 border-red-200">
        <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          Actividad de Praxis - Acción Transformadora
        </h4>
        <p className="text-sm text-red-900 leading-relaxed">{plan.actividadPraxis}</p>
      </div>

      {/* Homework & Assessment */}
      {(plan.homework || plan.assessment) && (
        <div className="grid md:grid-cols-2 gap-4">
          {plan.homework && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-lg">📚</span> Tarea
              </h4>
              <p className="text-sm text-gray-600">{plan.homework}</p>
            </div>
          )}
          {plan.assessment && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-lg">📊</span> Evaluación
              </h4>
              <p className="text-sm text-gray-600">{plan.assessment}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        Plan generado con enfoque dialéctico materialista | 
        Referencias: Cambridge English, British Council, CEFR
      </div>
    </div>
  );
}
