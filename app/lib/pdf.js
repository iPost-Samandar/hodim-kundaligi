"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmtSom = (n) => new Intl.NumberFormat("ru-RU").format(Math.round(n || 0)) + " so'm";

export function generateMonthlyReport({ operators, reports, kpiRules, calcDailyAmount, monthYM }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 36;
  let y = margin;

  // Sarlavha
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Hodim Kundaligi", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.setTextColor(100);
  doc.text(`Oylik hisobot — ${monthYM}`, margin, y);
  doc.setTextColor(0);
  y += 22;

  // KPI qoidalari
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KPI qoidalari:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`Stavka ${fmtSom(kpiRules.taskRate)} | Sifat koef. ${kpiRules.qualityCoef} | Jarima ${fmtSom(kpiRules.lateFine)}/daq`, margin + 90, y);
  y += 16;

  // Har operator uchun jamlash
  const monthReports = (reports || []).filter((r) => (r.date || "").startsWith(monthYM));
  const rows = (operators || [])
    .filter((o) => o.role !== "admin")
    .map((op) => {
      const opReports = monthReports.filter((r) => r.user_id === op.id);
      const days = opReports.length;
      const tasks = opReports.reduce((s, r) => s + (r.tasks_completed || 0), 0);
      const late = opReports.reduce((s, r) => s + (r.late_minutes || 0), 0);
      const avgQ = days ? Math.round(opReports.reduce((s, r) => s + (r.quality_score || 0), 0) / days) : 0;
      const total = opReports.reduce((s, r) => s + calcDailyAmount(r), 0);
      return [op.full_name, String(days), String(tasks), `${avgQ}%`, String(late), fmtSom(total)];
    });

  autoTable(doc, {
    startY: y + 6,
    head: [["Operator", "Kun", "Ish", "Sifat", "Kech (daq)", "Summa"]],
    body: rows,
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" },
      4: { halign: "right" }, 5: { halign: "right" },
    },
    didDrawPage: (data) => {
      const pageNo = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Sahifa ${pageNo} | Yaratildi: ${new Date().toLocaleString("ru-RU")}`,
        pageW - margin, doc.internal.pageSize.getHeight() - 16, { align: "right" }
      );
    },
  });

  // Jami qatori
  const finalY = doc.lastAutoTable?.finalY || y + 40;
  const totalSum = rows.reduce((s, r) => {
    const num = Number(String(r[5]).replace(/\D/g, ""));
    return s + (Number.isFinite(num) ? num : 0);
  }, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Umumiy summa: ${fmtSom(totalSum)}`, margin, finalY + 24);

  doc.save(`hodim-kundaligi-${monthYM}.pdf`);
}
