// exportService.ts - Export reports to PDF and Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CompletedReport } from '../types';

// Export report as PDF
export const exportReportAsPDF = (report: CompletedReport): void => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Vehicle Inspection Report', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Report ID: ${report.id}`, 105, 30, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  let yPos = 50;

  // Vehicle Information
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Vehicle Information', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  const vehicleData = [
    ['VIN', report.vehicle.vin],
    ['Make', report.vehicle.make],
    ['Model', report.vehicle.model],
    ['Year', report.vehicle.year],
    ['Inspection Date', new Date(report.date).toLocaleDateString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: vehicleData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // AI Summary
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('AI Analysis Summary', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Overall Condition: ${report.summary.overallCondition}`, 14, yPos);
  yPos += 10;

  // Key Findings
  if (report.summary.keyFindings && report.summary.keyFindings.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.text('Key Findings:', 14, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');

    report.summary.keyFindings.forEach((finding, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`${index + 1}. ${finding}`, 180);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 7;
    });
    yPos += 5;
  }

  // Recommendations
  if (report.summary.recommendations && report.summary.recommendations.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont(undefined, 'bold');
    doc.text('Recommendations:', 14, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');

    report.summary.recommendations.forEach((rec, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 180);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 7;
    });
    yPos += 10;
  }

  // Inspection Details
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Detailed Inspection Results', 14, yPos);
  yPos += 10;

  report.sections.forEach((section) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(section.title, 14, yPos);
    yPos += 8;

    if (section.notes) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      const noteLines = doc.splitTextToSize(`Notes: ${section.notes}`, 180);
      doc.text(noteLines, 14, yPos);
      yPos += noteLines.length * 5 + 3;
    }

    // Items table
    const tableData = section.items.map(item => [
      item.check,
      item.status,
      item.details || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Check Item', 'Status', 'Details']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 'auto' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  });

  // Vehicle History
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Vehicle History Report', 14, yPos);
  yPos += 10;

  const historyData = [
    ['Previous Owners', report.vehicleHistory.ownerCount.toString()],
    ['Accident History', report.vehicleHistory.hasAccident ? 'Yes' : 'No'],
    ['Last Odometer', report.vehicleHistory.lastOdometerReading],
    ['Title Issues', report.vehicleHistory.titleIssues || 'None'],
  ];

  if (report.vehicleHistory.accidentDetails) {
    historyData.push(['Accident Details', report.vehicleHistory.accidentDetails]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: historyData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Safety Recalls
  if (report.safetyRecalls && report.safetyRecalls.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Safety Recalls', 14, yPos);
    yPos += 8;

    const recallsData = report.safetyRecalls.map(recall => [
      recall.component,
      recall.summary,
      recall.remedy,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Component', 'Issue', 'Remedy']],
      body: recallsData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] },
    });
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString()}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`inspection-report-${report.vehicle.vin}-${report.id}.pdf`);
};

// Export report as Excel
export const exportReportAsExcel = (report: CompletedReport): void => {
  const wb = XLSX.utils.book_new();

  // Vehicle Info Sheet
  const vehicleData = [
    ['Vehicle Inspection Report'],
    [],
    ['Report ID', report.id],
    ['Date', new Date(report.date).toLocaleDateString()],
    [],
    ['Vehicle Information'],
    ['VIN', report.vehicle.vin],
    ['Make', report.vehicle.make],
    ['Model', report.vehicle.model],
    ['Year', report.vehicle.year],
  ];

  const vehicleWs = XLSX.utils.aoa_to_sheet(vehicleData);
  XLSX.utils.book_append_sheet(wb, vehicleWs, 'Vehicle Info');

  // Summary Sheet
  const summaryData = [
    ['AI Analysis Summary'],
    [],
    ['Overall Condition', report.summary.overallCondition],
    [],
    ['Key Findings'],
    ...report.summary.keyFindings.map((f, i) => [`${i + 1}`, f]),
    [],
    ['Recommendations'],
    ...report.summary.recommendations.map((r, i) => [`${i + 1}`, r]),
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Inspection Details Sheet
  const inspectionData: any[] = [
    ['Section', 'Check Item', 'Status', 'Details', 'Photos'],
  ];

  report.sections.forEach(section => {
    section.items.forEach(item => {
      inspectionData.push([
        section.title,
        item.check,
        item.status,
        item.details || '',
        item.photos.length > 0 ? `${item.photos.length} photos` : 'None',
      ]);
    });
  });

  const inspectionWs = XLSX.utils.aoa_to_sheet(inspectionData);
  XLSX.utils.book_append_sheet(wb, inspectionWs, 'Inspection Details');

  // Vehicle History Sheet
  const historyData = [
    ['Vehicle History Report'],
    [],
    ['Previous Owners', report.vehicleHistory.ownerCount],
    ['Accident History', report.vehicleHistory.hasAccident ? 'Yes' : 'No'],
    ['Accident Details', report.vehicleHistory.accidentDetails || 'None'],
    ['Last Odometer Reading', report.vehicleHistory.lastOdometerReading],
    ['Title Issues', report.vehicleHistory.titleIssues || 'None'],
  ];

  const historyWs = XLSX.utils.aoa_to_sheet(historyData);
  XLSX.utils.book_append_sheet(wb, historyWs, 'Vehicle History');

  // Safety Recalls Sheet
  if (report.safetyRecalls && report.safetyRecalls.length > 0) {
    const recallsData = [
      ['Component', 'Summary', 'Consequence', 'Remedy'],
      ...report.safetyRecalls.map(recall => [
        recall.component,
        recall.summary,
        recall.consequence,
        recall.remedy,
      ]),
    ];

    const recallsWs = XLSX.utils.aoa_to_sheet(recallsData);
    XLSX.utils.book_append_sheet(wb, recallsWs, 'Safety Recalls');
  }

  // Save the Excel file
  XLSX.writeFile(wb, `inspection-report-${report.vehicle.vin}-${report.id}.xlsx`);
};

// Send report via email (placeholder - would need backend)
export const sendReportEmail = async (
  report: CompletedReport,
  recipientEmail: string
): Promise<void> => {
  // In production, this would call your backend API to send the email
  console.log(`Sending report ${report.id} to ${recipientEmail}`);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real implementation, the backend would:
  // 1. Generate the PDF
  // 2. Send email with the PDF attachment
  // 3. Return success/failure status
};
