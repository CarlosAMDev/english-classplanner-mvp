"use client";

import { useState } from "react";
import { LessonPlan, LessonParameters, GenerateResponse, LessonStage } from "@/types";
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
        setError(data.error || "Error generating lesson plan");
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
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Helper: Clean markdown formatting from text
      const cleanMarkdown = (text: string): string => {
        return text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/__(.*?)__/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/_(.*?)_/g, "$1")
          .replace(/~~(.*?)~~/g, "$1")
          .replace(/`(.*?)`/g, "$1")
          .replace(/^#{1,6}\s+/gm, "")
          .replace(/^[\-\*]\s+/gm, "")
          .replace(/^\d+\.\s+/gm, "")
          .replace(/^>\s+/gm, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/\s+/g, " ")
          .trim();
      };

      // Page configuration
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 20;
      const marginRight = 20;
      const marginTop = 25;
      const marginBottom = 25;
      const footerHeight = 15;
      const contentWidth = pageWidth - marginLeft - marginRight;
      const maxY = pageHeight - marginBottom - footerHeight;
      
      let yPosition = marginTop;

      // Helper: Check if we need a new page
      const checkNewPage = (requiredSpace: number = 15) => {
        if (yPosition + requiredSpace > maxY) {
          doc.addPage();
          yPosition = marginTop;
          return true;
        }
        return false;
      };

      // Helper: Get line height
      const getLineHeight = (fontSize: number) => fontSize * 0.4;

      // Helper: Add bullet point
      const addBulletPoint = (text: string, indent: number = 5, bulletColor: [number, number, number] = [59, 130, 246]) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        const cleanedText = cleanMarkdown(text);
        const bulletX = marginLeft + indent;
        const textX = marginLeft + indent + 5;
        const effectiveWidth = contentWidth - indent - 8;
        const lines = doc.splitTextToSize(cleanedText, effectiveWidth);
        const lineHeight = getLineHeight(10);

        checkNewPage(lineHeight * lines.length + 2);
        
        doc.setFillColor(...bulletColor);
        doc.circle(bulletX + 1, yPosition - 1.2, 1, "F");
        
        lines.forEach((line: string, index: number) => {
          doc.text(line, textX, yPosition);
          yPosition += lineHeight + 1;
          if (index < lines.length - 1) {
            checkNewPage(lineHeight + 1);
          }
        });
        
        yPosition += 1;
      };

      // Helper: Add info box
      const addInfoBox = (label: string, content: string, bgColor: [number, number, number], textColor: [number, number, number] = [55, 65, 81]) => {
        checkNewPage(25);
        
        const cleanedContent = cleanMarkdown(content);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(cleanedContent, contentWidth - 16);
        const boxHeight = 8 + (lines.length * 5);
        
        doc.setFillColor(...bgColor);
        doc.roundedRect(marginLeft, yPosition - 4, contentWidth, boxHeight + 6, 2, 2, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        doc.text(label, marginLeft + 5, yPosition + 2);
        
        doc.setFont("helvetica", "normal");
        yPosition += 7;
        lines.forEach((line: string) => {
          doc.text(line, marginLeft + 5, yPosition);
          yPosition += 5;
        });
        
        doc.setTextColor(0, 0, 0);
        yPosition += 6;
      };

      // Helper: Add lesson stage section
      const addLessonStage = (
        stage: LessonStage,
        stageLabel: string,
        accentColor: [number, number, number]
      ) => {
        checkNewPage(35);
        
        // Stage badge
        doc.setFillColor(...accentColor);
        doc.roundedRect(marginLeft, yPosition - 5, contentWidth, 14, 2, 2, "F");
        
        // Stage label
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(marginLeft + 5, yPosition - 3, doc.getTextWidth(stageLabel) + 8, 6, 1, 1, "F");
        doc.setTextColor(...accentColor);
        doc.text(stageLabel, marginLeft + 9, yPosition + 1);
        
        // Title
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(cleanMarkdown(stage.title), marginLeft + doc.getTextWidth(stageLabel) + 20, yPosition + 1);
        
        // Duration
        doc.setFontSize(9);
        const durationText = stage.duration;
        doc.text(durationText, marginLeft + contentWidth - doc.getTextWidth(durationText) - 5, yPosition + 1);
        
        doc.setTextColor(0, 0, 0);
        yPosition += 14;

        // Stage objective
        if (stage.stageObjective) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100, 100, 100);
          const objLines = doc.splitTextToSize(`Objective: ${cleanMarkdown(stage.stageObjective)}`, contentWidth - 10);
          objLines.forEach((line: string) => {
            doc.text(line, marginLeft + 3, yPosition);
            yPosition += 4;
          });
          doc.setTextColor(0, 0, 0);
          yPosition += 2;
        }

        // Activities
        if (stage.activities && stage.activities.length > 0) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(55, 65, 81);
          doc.text("Activities:", marginLeft + 3, yPosition);
          yPosition += 6;
          doc.setTextColor(0, 0, 0);
          
          stage.activities.forEach((activity) => {
            addBulletPoint(activity, 3, accentColor);
          });
        }

        // Materials
        if (stage.materials && stage.materials.length > 0) {
          yPosition += 2;
          checkNewPage(10);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(107, 114, 128);
          doc.text("Materials: ", marginLeft + 3, yPosition);
          const labelWidth = doc.getTextWidth("Materials: ");
          doc.setFont("helvetica", "normal");
          
          const materialsText = stage.materials.map(m => cleanMarkdown(m)).join(", ");
          const materialsLines = doc.splitTextToSize(materialsText, contentWidth - labelWidth - 6);
          doc.text(materialsLines[0], marginLeft + 3 + labelWidth, yPosition);
          yPosition += 4;
          
          for (let i = 1; i < materialsLines.length; i++) {
            checkNewPage(5);
            doc.text(materialsLines[i], marginLeft + 3, yPosition);
            yPosition += 4;
          }
        }

        // Teacher notes
        if (stage.teacherNotes) {
          yPosition += 2;
          checkNewPage(15);
          doc.setFillColor(254, 249, 195);
          const cleanedNotes = cleanMarkdown(stage.teacherNotes);
          const notesLines = doc.splitTextToSize(cleanedNotes, contentWidth - 16);
          const notesHeight = 6 + (notesLines.length * 4);
          doc.roundedRect(marginLeft + 3, yPosition - 2, contentWidth - 6, notesHeight, 1, 1, "F");
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(161, 98, 7);
          doc.text("Teacher Notes:", marginLeft + 6, yPosition + 2);
          yPosition += 5;
          
          doc.setFont("helvetica", "italic");
          doc.setTextColor(113, 63, 18);
          notesLines.forEach((line: string) => {
            doc.text(line, marginLeft + 6, yPosition);
            yPosition += 4;
          });
          
          doc.setTextColor(0, 0, 0);
          yPosition += 4;
        }

        yPosition += 8;
      };

      // ========== BUILD PDF ==========

      // Header - Blue gradient style
      doc.setFillColor(29, 78, 216); // Blue-700
      doc.rect(0, 0, pageWidth, 50, "F");
      
      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const cleanedTitle = cleanMarkdown(plan.title);
      const titleLines = doc.splitTextToSize(cleanedTitle, contentWidth);
      let titleY = 18;
      titleLines.forEach((line: string) => {
        doc.text(line, marginLeft, titleY);
        titleY += 7;
      });

      // Subtitle
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("Lesson Plan - PPP Methodology", marginLeft, titleY + 2);

      // Meta badges
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const badges = [
        `Level: ${plan.level}`,
        plan.duration,
        `Focus: ${plan.focus}`,
      ];
      let badgeX = marginLeft;
      const badgeY = 44;
      
      badges.forEach((badge) => {
        const badgeWidth = doc.getTextWidth(badge) + 10;
        doc.setFillColor(255, 255, 255, 0.2);
        doc.roundedRect(badgeX, badgeY - 5, badgeWidth, 8, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.text(badge, badgeX + 5, badgeY);
        badgeX += badgeWidth + 5;
      });

      doc.setTextColor(0, 0, 0);
      yPosition = 60;

      // Lesson Context
      addInfoBox(
        "Lesson Context",
        plan.lessonContext,
        [241, 245, 249], // Slate-100
        [51, 65, 85] // Slate-700
      );

      // Learning Objectives
      checkNewPage(20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("Learning Objectives", marginLeft, yPosition);
      yPosition += 6;
      doc.setTextColor(0, 0, 0);
      
      plan.objectives.forEach((obj) => {
        addBulletPoint(obj, 3, [30, 64, 175]);
      });
      yPosition += 5;

      // PPP Stages
      addLessonStage(plan.leadIn, "LEAD-IN", [147, 51, 234]); // Purple
      addLessonStage(plan.presentation, "PRESENTATION", [37, 99, 235]); // Blue
      addLessonStage(plan.practice, "PRACTICE", [234, 88, 12]); // Orange
      addLessonStage(plan.production, "PRODUCTION", [22, 163, 74]); // Green

      // Wrap-up
      checkNewPage(30);
      doc.setFillColor(238, 242, 255); // Indigo-50
      doc.setDrawColor(99, 102, 241); // Indigo-500
      doc.setLineWidth(0.5);
      
      const wrapUpContent = cleanMarkdown(plan.wrapUp);
      doc.setFontSize(10);
      const wrapUpLines = doc.splitTextToSize(wrapUpContent, contentWidth - 16);
      const wrapUpBoxHeight = 12 + (wrapUpLines.length * 5);
      
      doc.roundedRect(marginLeft, yPosition - 4, contentWidth, wrapUpBoxHeight, 2, 2, "FD");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(67, 56, 202); // Indigo-700
      doc.text("Wrap-up", marginLeft + 5, yPosition + 3);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(79, 70, 229); // Indigo-600
      wrapUpLines.forEach((line: string) => {
        doc.text(line, marginLeft + 5, yPosition);
        yPosition += 5;
      });
      
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      // Homework
      if (plan.homework) {
        addInfoBox("Homework", plan.homework, [239, 246, 255], [30, 64, 175]);
      }

      // Assessment
      if (plan.assessment) {
        addInfoBox("Assessment", plan.assessment, [240, 253, 244], [22, 101, 52]);
      }

      // ========== FOOTERS ==========
      const totalPages = doc.getNumberOfPages();
      
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, pageHeight - marginBottom, pageWidth - marginRight, pageHeight - marginBottom);
        
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(156, 163, 175);
        doc.text(
          "English Plan Creator | PPP Methodology | Cambridge English & British Council",
          marginLeft,
          pageHeight - marginBottom + 6
        );
        
        doc.setFont("helvetica", "normal");
        const pageText = `Page ${i} of ${totalPages}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(
          pageText,
          pageWidth - marginRight - pageTextWidth,
          pageHeight - marginBottom + 6
        );
      }

      // Save
      const fileName = `lesson-plan-${plan.level}-${plan.focus.toLowerCase()}-${Date.now()}.pdf`;
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
    <main className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            English Plan Creator
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
            Generate structured lesson plans using international ELT methodology,
            based on Cambridge English and British Council standards.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">CEFR</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">PPP Methodology</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">Communicative Approach</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Left Column - Form */}
          <div className="order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <span className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
          <div className="order-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Generated Plan</h2>
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
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500"
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                  No Plan Generated
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Fill in the parameters and click &quot;Generate&quot; 
                  to create your lesson plan.
                </p>

                {/* Feature highlights - PPP Stages */}
                <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-4 text-left">
                  <div className="p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl border border-purple-100">
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
                    <h4 className="font-medium text-gray-800 text-xs sm:text-sm">Lead-in</h4>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      Engage and activate prior knowledge
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100">
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">💡</div>
                    <h4 className="font-medium text-gray-800 text-xs sm:text-sm">Presentation</h4>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      Introduce language in context
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl border border-orange-100">
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🔄</div>
                    <h4 className="font-medium text-gray-800 text-xs sm:text-sm">Practice</h4>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      Controlled and semi-controlled tasks
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl border border-green-100">
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🚀</div>
                    <h4 className="font-medium text-gray-800 text-xs sm:text-sm">Production</h4>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      Free communicative practice
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-10 md:mt-12 text-center text-xs sm:text-sm text-gray-500 px-4">
          <p>
            Based on Cambridge English and British Council methodology.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> | </span>
            PPP Framework | CEFR Standards
          </p>
        </footer>
      </div>
    </main>
  );
}
