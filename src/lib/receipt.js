import { jsPDF } from "jspdf";
import { formatCurrency, formatDate } from "@/lib/format";

/**
 * Builds the official GPHF donation receipt as a PDF and downloads it.
 * Only verified donations have a receipt number; anything else is refused.
 */
export function downloadReceipt(donation) {
  if (!donation || donation.status !== "completed") return false;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(23, 77, 56);
  doc.rect(0, 0, width, 96, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(19);
  doc.text("Global Peace & Humanity Foundation", 48, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("TOGETHER FOR PEACE. TOGETHER FOR HUMANITY.", 48, 64);
  doc.text("Registered humanitarian organization · Pakistan", 48, 78);

  doc.setTextColor(23, 52, 81);
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text("Official Donation Receipt", 48, 148);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(78, 92, 106);
  doc.text(`Receipt number: ${donation.receipt_number || "—"}`, 48, 172);
  doc.text(`Issued: ${formatDate(donation.verified_date || donation.created_date)}`, 48, 188);
  doc.text(`Reference: ${donation.reference || "—"}`, 48, 204);

  const rows = [
    ["Donor", donation.is_anonymous ? "Anonymous donor" : donation.donor_name || "—"],
    ["Email", donation.donor_email || "—"],
    ["Country", donation.country || "—"],
    ["Project", donation.project_title || "General foundation fund"],
    ["Donation amount", formatCurrency(donation.amount, donation.currency)],
    ["Frequency", donation.frequency === "monthly" ? "Monthly" : "One-time"],
    ["Payment method", donation.payment_method === "card" ? "Card" : "Bank transfer"],
    ["Payment status", "Verified"],
  ];

  let y = 236;
  rows.forEach(([label, value], index) => {
    if (index % 2 === 0) {
      doc.setFillColor(247, 249, 247);
      doc.rect(48, y - 14, width - 96, 26, "F");
    }
    doc.setFontSize(9);
    doc.setTextColor(78, 92, 106);
    doc.text(String(label).toUpperCase(), 60, y);
    doc.setFontSize(11);
    doc.setTextColor(23, 52, 81);
    doc.text(String(value), width - 60, y, { align: "right" });
    y += 26;
  });

  doc.setDrawColor(229, 231, 235);
  doc.line(48, y + 8, width - 48, y + 8);
  doc.setFontSize(9);
  doc.setTextColor(78, 92, 106);
  doc.text(
    "This receipt confirms a donation verified by the Global Peace & Humanity Foundation finance team.",
    48,
    y + 32
  );
  doc.text("For questions, contact support@gphf.pk · gphf.pk", 48, y + 48);

  doc.save(`GPHF-Receipt-${donation.receipt_number || donation.reference || "donation"}.pdf`);
  return true;
}