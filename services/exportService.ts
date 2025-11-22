import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompletedReport } from '../types';

export const exportService = {
  // Export report to PDF
  async exportToPDF(report: CompletedReport): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(53, 122, 189); // #357ABD
    doc.text('AutoPro Inspector Report', 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Generated: ${new Date(report.date).toLocaleDateString()}`, 105, yPosition, { align: 'center' });

    yPosition += 15;

    // Vehicle Information
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Vehicle Information', 14, yPosition);
    yPosition += 8;

    const vehicleData = [
      ['VIN', report.vehicle.vin],
      ['Make', report.vehicle.make],
      ['Model', report.vehicle.model],
      ['Year', report.vehicle.year]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: vehicleData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Overall Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Overall Assessment', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const summaryText = doc.splitTextToSize(report.summary.overallCondition, 180);
    doc.text(summaryText, 14, yPosition);
    yPosition += summaryText.length * 5 + 10;

    // Key Findings
    if (report.summary.keyFindings.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Key Findings', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      report.summary.keyFindings.forEach((finding, idx) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const findingText = doc.splitTextToSize(`${idx + 1}. ${finding}`, 175);
        doc.text(findingText, 14, yPosition);
        yPosition += findingText.length * 5 + 3;
      });

      yPosition += 5;
    }

    // Recommendations
    if (report.summary.recommendations.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Recommendations', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      report.summary.recommendations.forEach((rec, idx) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const recText = doc.splitTextToSize(`${idx + 1}. ${rec}`, 175);
        doc.text(recText, 14, yPosition);
        yPosition += recText.length * 5 + 3;
      });

      yPosition += 10;
    }

    // Inspection Details
    if (report.sections.length > 0) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Detailed Inspection Results', 14, yPosition);
      yPosition += 10;

      report.sections.forEach((section) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(53, 122, 189);
        doc.text(section.title, 14, yPosition);
        yPosition += 7;

        if (section.notes) {
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          const notesText = doc.splitTextToSize(section.notes, 180);
          doc.text(notesText, 14, yPosition);
          yPosition += notesText.length * 4 + 5;
        }

        if (section.items.length > 0) {
          const tableData = section.items.map(item => [
            item.check,
            item.status,
            item.details || '-'
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Item', 'Status', 'Notes']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [53, 122, 189], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 25, halign: 'center' },
              2: { cellWidth: 'auto' }
            }
          });

          yPosition = (doc as any).lastAutoTable.finalY + 10;
        }
      });
    }

    // Vehicle History
    if (report.vehicleHistory) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Vehicle History Report', 14, yPosition);
      yPosition += 10;

      const historyData = [
        ['Previous Owners', report.vehicleHistory.ownerCount.toString()],
        ['Accident History', report.vehicleHistory.hasAccident ? 'Yes' : 'No'],
        ['Accident Details', report.vehicleHistory.accidentDetails || 'None reported'],
        ['Last Odometer Reading', report.vehicleHistory.lastOdometerReading],
        ['Title Issues', report.vehicleHistory.titleIssues || 'None reported']
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: historyData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Safety Recalls
    if (report.safetyRecalls && report.safetyRecalls.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38); // Red color for recalls
      doc.text('Safety Recalls', 14, yPosition);
      yPosition += 10;

      const recallData = report.safetyRecalls.map(recall => [
        recall.component,
        recall.summary,
        recall.remedy
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Component', 'Issue', 'Remedy']],
        body: recallData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Theft & Salvage
    if (report.theftAndSalvage) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Theft & Salvage Check', 14, yPosition);
      yPosition += 8;

      const statusColor = report.theftAndSalvage.isStolen || report.theftAndSalvage.isSalvage
        ? [220, 38, 38] // Red
        : [34, 197, 94]; // Green

      const theftData = [
        ['Stolen Status', report.theftAndSalvage.isStolen ? '⚠️ STOLEN' : '✓ Clean'],
        ['Salvage Title', report.theftAndSalvage.isSalvage ? '⚠️ SALVAGE' : '✓ Clean'],
        ['Details', report.theftAndSalvage.details]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: theftData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount} | AutoPro Inspector Report | ${report.vehicle.vin}`,
        105,
        290,
        { align: 'center' }
      );
    }

    // Generate filename
    const filename = `AutoPro_${report.vehicle.vin}_${report.vehicle.year}_${report.vehicle.make}_${report.vehicle.model}.pdf`
      .replace(/\s+/g, '_');

    // Save PDF
    doc.save(filename);
  },

  // Export report to JSON
  exportToJSON(report: CompletedReport): void {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoPro_${report.vehicle.vin}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Export multiple reports to CSV summary
  exportToCSV(reports: CompletedReport[]): void {
    const headers = ['Date', 'VIN', 'Year', 'Make', 'Model', 'Overall Condition', 'Key Findings Count'];
    const rows = reports.map(report => [
      new Date(report.date).toLocaleDateString(),
      report.vehicle.vin,
      report.vehicle.year,
      report.vehicle.make,
      report.vehicle.model,
      report.summary.overallCondition.substring(0, 50) + '...',
      report.summary.keyFindings.length.toString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoPro_Reports_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
