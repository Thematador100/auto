// @ts-ignore - jsPDF loaded from CDN
declare const jsPDF: any;
// @ts-ignore - html2canvas loaded from CDN
declare const html2canvas: any;
import { CompletedReport } from '../types';

/**
 * Generates a professional PDF from a completed inspection report
 * @param report The completed report data
 * @param elementId Optional - ID of HTML element to convert (for styled reports)
 */
export const generatePDF = async (report: CompletedReport, elementId?: string): Promise<void> => {
  try {
    if (elementId) {
      // Method 1: Convert HTML element to PDF (preserves styling)
      await generatePDFFromHTML(report, elementId);
    } else {
      // Method 2: Generate PDF programmatically (more control)
      await generatePDFProgrammatic(report);
    }
  } catch (error) {
    console.error('[PDFGenerator] Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Generate PDF by converting HTML element (preserves visual styling)
 */
const generatePDFFromHTML = async (report: CompletedReport, elementId: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: '#1a1a1a' // Match dark theme
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 0;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

  // Download the PDF
  const filename = `Inspection_Report_${report.vehicle.year}_${report.vehicle.make}_${report.vehicle.model}_${report.id}.pdf`;
  pdf.save(filename);
};

/**
 * Generate PDF programmatically with custom formatting
 */
const generatePDFProgrammatic = async (report: CompletedReport): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * (fontSize * 0.35); // Return height of text block
  };

  // Header
  pdf.setFillColor(41, 128, 185); // Blue header
  pdf.rect(0, 0, pageWidth, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('Vehicle Inspection Report', pageWidth / 2, 20, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text(`${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`, pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;
  pdf.setTextColor(0, 0, 0);

  // Vehicle Information Section
  pdf.setFillColor(240, 240, 240);
  pdf.rect(10, yPosition, pageWidth - 20, 30, 'F');

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Vehicle Information', 15, yPosition + 7);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`VIN: ${report.vehicle.vin}`, 15, yPosition + 14);
  pdf.text(`Make: ${report.vehicle.make}`, 15, yPosition + 20);
  pdf.text(`Model: ${report.vehicle.model}`, 70, yPosition + 20);
  pdf.text(`Year: ${report.vehicle.year}`, 130, yPosition + 20);
  pdf.text(`Report ID: ${report.id}`, 15, yPosition + 26);
  pdf.text(`Date: ${new Date(report.date).toLocaleDateString()}`, 130, yPosition + 26);

  yPosition += 40;

  // AI Summary Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI-Powered Summary', 15, yPosition);
  yPosition += 7;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Condition:', 15, yPosition);
  yPosition += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const conditionHeight = addText(report.summary.overallCondition, 15, yPosition, pageWidth - 30);
  yPosition += conditionHeight + 5;

  // Key Findings
  if (report.summary.keyFindings.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Findings:', 15, yPosition);
    yPosition += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    report.summary.keyFindings.forEach((finding, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      const height = addText(`• ${finding}`, 20, yPosition, pageWidth - 35);
      yPosition += height + 3;
    });
  }

  yPosition += 5;

  // Recommendations
  if (report.summary.recommendations.length > 0) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations:', 15, yPosition);
    yPosition += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    report.summary.recommendations.forEach((rec, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      const height = addText(`• ${rec}`, 20, yPosition, pageWidth - 35);
      yPosition += height + 3;
    });
  }

  yPosition += 10;

  // Safety Recalls Section
  if (report.safetyRecalls.length > 0) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFillColor(255, 200, 200); // Light red background
    pdf.rect(10, yPosition - 5, pageWidth - 20, 10, 'F');

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(200, 0, 0);
    pdf.text('⚠ Open Safety Recalls', 15, yPosition + 2);
    pdf.setTextColor(0, 0, 0);
    yPosition += 12;

    report.safetyRecalls.forEach((recall, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${recall.component}`, 15, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      const summaryHeight = addText(`Summary: ${recall.summary}`, 20, yPosition, pageWidth - 35, 9);
      yPosition += summaryHeight + 3;

      const consequenceHeight = addText(`Consequence: ${recall.consequence}`, 20, yPosition, pageWidth - 35, 9);
      yPosition += consequenceHeight + 3;

      const remedyHeight = addText(`Remedy: ${recall.remedy}`, 20, yPosition, pageWidth - 35, 9);
      yPosition += remedyHeight + 8;
    });
  }

  yPosition += 5;

  // Vehicle History Section
  if (yPosition > pageHeight - 40) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Vehicle History', 15, yPosition);
  yPosition += 7;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Previous Owners: ${report.vehicleHistory.ownerCount}`, 15, yPosition);
  yPosition += 6;
  pdf.text(`Accident Reported: ${report.vehicleHistory.hasAccident ? 'Yes' : 'No'}`, 15, yPosition);
  yPosition += 6;

  if (report.vehicleHistory.hasAccident) {
    const height = addText(`Details: ${report.vehicleHistory.accidentDetails}`, 20, yPosition, pageWidth - 35);
    yPosition += height + 3;
  }

  pdf.text(`Title Issues: ${report.vehicleHistory.titleIssues || 'Clean'}`, 15, yPosition);
  yPosition += 6;
  pdf.text(`Last Odometer: ${report.vehicleHistory.lastOdometerReading}`, 15, yPosition);
  yPosition += 10;

  // Theft & Salvage Section
  if (yPosition > pageHeight - 30) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Theft & Salvage Record', 15, yPosition);
  yPosition += 7;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Stolen Status: ${report.theftAndSalvage.isStolen ? 'Reported Stolen' : 'Not Stolen'}`, 15, yPosition);
  yPosition += 6;
  pdf.text(`Salvage Status: ${report.theftAndSalvage.isSalvage ? 'Salvage Title' : 'Not Salvage'}`, 15, yPosition);
  yPosition += 6;
  const detailsHeight = addText(report.theftAndSalvage.details, 15, yPosition, pageWidth - 30);
  yPosition += detailsHeight + 10;

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('This report was generated by AI Auto Pro', pageWidth / 2, footerY, { align: 'center' });
  pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 4, { align: 'center' });

  // Save the PDF
  const filename = `Inspection_Report_${report.vehicle.year}_${report.vehicle.make}_${report.vehicle.model}_${report.id}.pdf`;
  pdf.save(filename);
};

/**
 * Print the current report
 */
export const printReport = () => {
  window.print();
};
