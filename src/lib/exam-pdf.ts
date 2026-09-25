/**
 * Exam PDF generation utility
 * Creates a formatted PDF of exam questions with answers (admin view)
 */
import type { Exam, Question } from "./schema";

export async function generateExamPdf(
  exam: Exam,
  questions: Question[],
  fileName: string,
): Promise<void> {
  // Import jsPDF dynamically
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper to add text with wrapping
  const addWrappedText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont(undefined, "bold");
    else doc.setFont(undefined, "normal");

    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      if (yPosition + 10 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 7;
    });
  };

  // Header
  addWrappedText("OROMIA ACADEMY — EXAM PAPER", 16, true);
  yPosition += 5;

  // Exam Details
  addWrappedText(`Title: ${exam.title}`, 11, true);
  addWrappedText(`Topic: ${exam.topic || "—"}`, 11);
  addWrappedText(`Duration: ${exam.durationMin} minutes`, 11);
  addWrappedText(`Pass Mark: ${exam.passMark}%`, 11);
  addWrappedText(`Language: ${exam.language === "om" ? "Afaan Oromoo" : exam.language === "en" ? "English" : "Both"}`, 11);
  addWrappedText(`Total Questions: ${questions.length}`, 11);
  yPosition += 5;

  // Instructions
  if (exam.instructions) {
    addWrappedText("INSTRUCTIONS", 12, true);
    addWrappedText(exam.instructions, 10);
    yPosition += 5;
  }

  // Questions
  addWrappedText("QUESTIONS WITH ANSWERS", 12, true);
  yPosition += 5;

  questions.forEach((q, idx) => {
    // Check if page is getting full
    if (yPosition + 30 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Question number and text
    addWrappedText(`Q${idx + 1}. ${q.textOm}${q.textEn ? ` / ${q.textEn}` : ""}`, 11, true);

    // Question type
    const typeLabel =
      q.type === "mcq"
        ? "Multiple Choice"
        : q.type === "truefalse"
          ? "True/False"
          : q.type === "short"
            ? "Short Answer"
            : "Essay";
    addWrappedText(`Type: ${typeLabel} | Points: ${q.points}`, 10);

    // Options (for MCQ)
    if (q.type === "mcq" && q.options) {
      q.options.forEach((opt) => {
        const isCorrect = opt.id === q.correctOptionId;
        const prefix = isCorrect ? "✓ " : "  ";
        addWrappedText(
          `${prefix}${opt.textOm}${opt.textEn ? ` / ${opt.textEn}` : ""}`,
          10,
          isCorrect,
        );
      });
    }

    // Correct answer
    if (q.type === "truefalse") {
      const answer = q.correctBool ? "True" : "False";
      addWrappedText(`Correct Answer: ${answer}`, 10, true);
    } else if (q.type === "mcq" && q.correctOptionId) {
      const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
      addWrappedText(`Correct Answer: ${correctOpt?.textOm || "—"}`, 10, true);
    } else if (q.expectedAnswer) {
      addWrappedText(`Expected Answer: ${q.expectedAnswer}`, 10, true);
    }

    // Rubric (for essay/short)
    if (q.rubric) {
      addWrappedText(`Rubric: ${q.rubric}`, 10);
    }

    yPosition += 8;
  });

  // Footer
  yPosition += 10;
  addWrappedText(`Generated: ${new Date().toLocaleString()}`, 9);
  addWrappedText("Admin Only — Do Not Share", 9, true);

  // Save
  doc.save(fileName);
}
