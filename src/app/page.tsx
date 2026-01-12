"use client";

import { useState } from "react";
import { LessonPlan, LessonParameters, GenerateResponse } from "@/types";
import ParameterForm from "@/components/ParameterForm";
import PlanDisplay from "@/components/PlanDisplay";

export default function Home() {
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (parameters: LessonParameters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parameters }),
      });

      const data: GenerateResponse = await response.json();

      if (data.success && data.plan) {
        setPlan(data.plan);
      } else {
        setError(data.error || "Failed to generate lesson plan");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanUpdate = (updatedPlan: LessonPlan) => {
    setPlan(updatedPlan);
  };

  const handleExportPDF = async () => {
    if (!plan) return;

    try {
      // Dynamic import of jsPDF to avoid SSR issues
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * (fontSize * 0.4);
      };

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(plan.title, margin, yPosition);
      yPosition += 12;

      // Meta info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Level: ${plan.level} | Duration: ${plan.duration} | Focus: ${plan.focus}`, margin, yPosition);
      yPosition += 10;

      // Objectives
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Learning Objectives:", margin, yPosition);
      yPosition += 6;
      doc.setFont("helvetica", "normal");
      plan.objectives.forEach((obj) => {
        yPosition = addWrappedText(`• ${obj}`, margin + 5, yPosition, contentWidth - 10);
        yPosition += 2;
      });
      yPosition += 5;

      // Helper to add section
      const addSection = (section: typeof plan.warmUp, title: string) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${title} (${section.duration})`, margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        section.activities.forEach((activity) => {
          yPosition = addWrappedText(`• ${activity}`, margin + 5, yPosition, contentWidth - 10);
          yPosition += 3;
        });

        if (section.materials && section.materials.length > 0) {
          yPosition += 2;
          doc.setFont("helvetica", "italic");
          yPosition = addWrappedText(`Materials: ${section.materials.join(", ")}`, margin + 5, yPosition, contentWidth - 10, 9);
        }

        if (section.teacherNotes) {
          yPosition += 2;
          doc.setFont("helvetica", "italic");
          yPosition = addWrappedText(`Notes: ${section.teacherNotes}`, margin + 5, yPosition, contentWidth - 10, 9);
        }

        yPosition += 8;
      };

      // Add sections
      addSection(plan.warmUp, "Warm-up");
      addSection(plan.mainActivity, "Main Activity");
      addSection(plan.wrapUp, "Wrap-up");

      // Homework
      if (plan.homework) {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Homework:", margin, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        yPosition = addWrappedText(plan.homework, margin + 5, yPosition, contentWidth - 10);
        yPosition += 5;
      }

      // Assessment
      if (plan.assessment) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Assessment:", margin, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        addWrappedText(plan.assessment, margin + 5, yPosition, contentWidth - 10);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(
          `Generated by English Plan Creator | British Council & Cambridge English Methodologies`,
          margin,
          doc.internal.pageSize.getHeight() - 10
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      // Save the PDF
      const fileName = `lesson-plan-${plan.level}-${plan.focus.toLowerCase()}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleReset = () => {
    setPlan(null);
    setError(null);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            English Plan Creator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate structured lesson plans based on British Council and Cambridge English
            methodologies. Select your parameters and let AI create a comprehensive plan.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="p-2 bg-primary-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </span>
                Lesson Parameters
              </h2>
              <ParameterForm onSubmit={handleGenerate} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {plan ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Generated Plan</h2>
                  <button
                    onClick={handleReset}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    New Plan
                  </button>
                </div>
                <PlanDisplay
                  plan={plan}
                  onPlanUpdate={handlePlanUpdate}
                  onExportPDF={handleExportPDF}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Plan Generated Yet
                </h3>
                <p className="text-gray-500 text-sm">
                  Fill in the parameters on the left and click &quot;Generate&quot; to create
                  your lesson plan.
                </p>

                {/* Feature highlights */}
                <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-medium text-gray-800 text-sm">CEFR Aligned</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Plans follow Common European Framework standards
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">📚</div>
                    <h4 className="font-medium text-gray-800 text-sm">British Council</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on proven teaching methodologies
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">✏️</div>
                    <h4 className="font-medium text-gray-800 text-sm">Editable</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Customize sections to fit your needs
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">📄</div>
                    <h4 className="font-medium text-gray-800 text-sm">Export PDF</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Download and print your lesson plans
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by British Council and Cambridge English teaching methodologies.
            <br />
            All plans follow CEFR (Common European Framework of Reference) guidelines.
          </p>
        </footer>
      </div>
    </main>
  );
}
