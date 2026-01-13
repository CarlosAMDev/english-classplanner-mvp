"use client";

import { useState } from "react";
import { LessonPlan, LessonParameters, GenerateResponse, DialecticalSection } from "@/types";
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
        setError(data.error || "Error al generar el plan de clase");
      }
    } catch (err) {
      setError("Error de red. Por favor, intente de nuevo.");
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

      // Helper: Add dialectical section
      const addDialecticalSection = (
        section: DialecticalSection,
        phaseLabel: string,
        accentColor: [number, number, number]
      ) => {
        checkNewPage(35);
        
        // Phase badge
        doc.setFillColor(...accentColor);
        doc.roundedRect(marginLeft, yPosition - 5, contentWidth, 14, 2, 2, "F");
        
        // Phase label
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(marginLeft + 5, yPosition - 3, doc.getTextWidth(phaseLabel) + 8, 6, 1, 1, "F");
        doc.setTextColor(...accentColor);
        doc.text(phaseLabel, marginLeft + 9, yPosition + 1);
        
        // Title
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(cleanMarkdown(section.title), marginLeft + doc.getTextWidth(phaseLabel) + 20, yPosition + 1);
        
        // Duration
        doc.setFontSize(9);
        const durationText = section.duration;
        doc.text(durationText, marginLeft + contentWidth - doc.getTextWidth(durationText) - 5, yPosition + 1);
        
        doc.setTextColor(0, 0, 0);
        yPosition += 14;

        // Dialectical objective
        if (section.dialecticalObjective) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100, 100, 100);
          const objLines = doc.splitTextToSize(`Objetivo: ${cleanMarkdown(section.dialecticalObjective)}`, contentWidth - 10);
          objLines.forEach((line: string) => {
            doc.text(line, marginLeft + 3, yPosition);
            yPosition += 4;
          });
          doc.setTextColor(0, 0, 0);
          yPosition += 2;
        }

        // Activities
        if (section.activities && section.activities.length > 0) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(55, 65, 81);
          doc.text("Actividades:", marginLeft + 3, yPosition);
          yPosition += 6;
          doc.setTextColor(0, 0, 0);
          
          section.activities.forEach((activity) => {
            addBulletPoint(activity, 3, accentColor);
          });
        }

        // Materials
        if (section.materials && section.materials.length > 0) {
          yPosition += 2;
          checkNewPage(10);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(107, 114, 128);
          doc.text("Materiales: ", marginLeft + 3, yPosition);
          const labelWidth = doc.getTextWidth("Materiales: ");
          doc.setFont("helvetica", "normal");
          
          const materialsText = section.materials.map(m => cleanMarkdown(m)).join(", ");
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
        if (section.teacherNotes) {
          yPosition += 2;
          checkNewPage(15);
          doc.setFillColor(254, 249, 195);
          const cleanedNotes = cleanMarkdown(section.teacherNotes);
          const notesLines = doc.splitTextToSize(cleanedNotes, contentWidth - 16);
          const notesHeight = 6 + (notesLines.length * 4);
          doc.roundedRect(marginLeft + 3, yPosition - 2, contentWidth - 6, notesHeight, 1, 1, "F");
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(161, 98, 7);
          doc.text("Notas del docente:", marginLeft + 6, yPosition + 2);
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

      // Header - Red gradient style
      doc.setFillColor(185, 28, 28); // Red-700
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
      doc.text("Plan de clase con enfoque dialéctico materialista", marginLeft, titleY + 2);

      // Meta badges
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const badges = [
        `Nivel: ${plan.level}`,
        plan.duration,
        `Enfoque: ${plan.focus}`,
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

      // Social Context
      addInfoBox(
        "Contexto Social",
        plan.contextoSocial,
        [255, 251, 235], // Amber-50
        [146, 64, 14] // Amber-800
      );

      // Learning Objectives
      checkNewPage(20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("Objetivos de Aprendizaje", marginLeft, yPosition);
      yPosition += 6;
      doc.setTextColor(0, 0, 0);
      
      plan.objectives.forEach((obj) => {
        addBulletPoint(obj, 3, [30, 64, 175]);
      });
      yPosition += 5;

      // Dialectical Sections
      addDialecticalSection(plan.tesis, "TESIS", [37, 99, 235]); // Blue
      addDialecticalSection(plan.antitesis, "ANTÍTESIS", [234, 88, 12]); // Orange
      addDialecticalSection(plan.sintesis, "SÍNTESIS", [22, 163, 74]); // Green

      // Praxis Activity
      checkNewPage(30);
      doc.setFillColor(254, 226, 226); // Red-100
      doc.setDrawColor(185, 28, 28); // Red-700
      doc.setLineWidth(0.5);
      
      const praxisContent = cleanMarkdown(plan.actividadPraxis);
      doc.setFontSize(10);
      const praxisLines = doc.splitTextToSize(praxisContent, contentWidth - 16);
      const praxisBoxHeight = 12 + (praxisLines.length * 5);
      
      doc.roundedRect(marginLeft, yPosition - 4, contentWidth, praxisBoxHeight, 2, 2, "FD");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(127, 29, 29); // Red-900
      doc.text("Actividad de Praxis - Acción Transformadora", marginLeft + 5, yPosition + 3);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(153, 27, 27); // Red-800
      praxisLines.forEach((line: string) => {
        doc.text(line, marginLeft + 5, yPosition);
        yPosition += 5;
      });
      
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      // Homework
      if (plan.homework) {
        addInfoBox("Tarea", plan.homework, [239, 246, 255], [30, 64, 175]);
      }

      // Assessment
      if (plan.assessment) {
        addInfoBox("Evaluación", plan.assessment, [240, 253, 244], [22, 101, 52]);
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
          "English Plan Creator | Enfoque Dialéctico Materialista | Cambridge English & British Council",
          marginLeft,
          pageHeight - marginBottom + 6
        );
        
        doc.setFont("helvetica", "normal");
        const pageText = `Página ${i} de ${totalPages}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(
          pageText,
          pageWidth - marginRight - pageTextWidth,
          pageHeight - marginBottom + 6
        );
      }

      // Save
      const fileName = `plan-dialectico-${plan.level}-${plan.focus.toLowerCase()}-${Date.now()}.pdf`;
      doc.save(fileName);
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error al generar el PDF. Por favor, intente de nuevo.");
    }
  };

  const handleReset = () => {
    setPlan(null);
    setError(null);
  };

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            English Plan Creator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Genera planes de clase estructurados con enfoque dialéctico materialista,
            basados en estándares de Cambridge English y British Council.
          </p>
          <div className="mt-3 flex justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">CEFR</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">Dialéctica Materialista</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">Praxis Social</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-red-600"
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
                Parámetros de la Clase
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
                  <h2 className="text-xl font-bold text-gray-800">Plan Generado</h2>
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
                    Nuevo Plan
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
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-500"
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
                  Sin Plan Generado
                </h3>
                <p className="text-gray-500 text-sm">
                  Completa los parámetros a la izquierda y haz clic en &quot;Generar&quot; 
                  para crear tu plan de clase dialéctico.
                </p>

                {/* Feature highlights */}
                <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-2xl mb-2">📘</div>
                    <h4 className="font-medium text-gray-800 text-sm">Tesis</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Presentación desde la realidad concreta
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="text-2xl mb-2">🔍</div>
                    <h4 className="font-medium text-gray-800 text-sm">Antítesis</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Problematización y contradicciones
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-medium text-gray-800 text-sm">Síntesis</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Praxis transformadora
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="text-2xl mb-2">🤝</div>
                    <h4 className="font-medium text-gray-800 text-sm">Acción Social</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Impacto en la comunidad
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
            Metodología basada en Cambridge English y British Council.
            <br />
            Enfoque pedagógico: Dialéctica Materialista | Marco CEFR
          </p>
        </footer>
      </div>
    </main>
  );
}
