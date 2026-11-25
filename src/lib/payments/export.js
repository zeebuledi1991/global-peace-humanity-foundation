import { jsPDF } from "jspdf";
import { downloadCsv } from "@/lib/csv";

export function exportRowsCsv(filename, rows, columns) {
  downloadCsv(filename, rows, columns);
}

export function exportRowsPdf({ filename, title, subtitle, columns, rows }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 32;
  const usable = pageWidth - margin * 2;
  const columnWidth = usable / columns.length;

  const header = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Global Peace & Humanity Foundation", margin, 36);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(title, margin, 52);
    if (subtitle) doc.text(subtitle, margin, 66);
    doc.setDrawColor(23, 77, 56);
    doc.line(margin, 74, pageWidth - margin, 74);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    columns.forEach((column, index) => {
      doc.text(String(column.header).toUpperCase(), margin + index * columnWidth, 88);
    });
  };

  header();
  let y = 104;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  rows.forEach((row) => {
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      header();
      y = 104;
    }
    columns.forEach((column, index) => {
      const text = String(column.value(row) ?? "").slice(0, 40);
      doc.text(text, margin + index * columnWidth, y);
    });
    y += 14;
  });

  doc.save(filename);
}