import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";

// Download as TXT
export const downloadTXT = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${filename}.txt`);
};

// Download as DOCX
export const downloadDOCX = async (filename: string, content: string) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [new Paragraph({ children: [new TextRun(content)] })],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${filename}.docx`);
};

// Download as PDF
export const downloadPDF = (filename: string, content: string) => {
  const pdf = new jsPDF();
  const lines = pdf.splitTextToSize(content, 180); // wrap text
  pdf.text(lines, 10, 10);
  pdf.save(`${filename}.pdf`);
};
