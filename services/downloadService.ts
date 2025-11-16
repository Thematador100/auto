// downloadService.ts
import { CompletedReport } from '../types';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

export interface DownloadProgress {
  stage: 'preparing' | 'generating' | 'saving' | 'complete';
  message: string;
}

export class DownloadService {
  private progressCallback: ((progress: DownloadProgress) => void) | null = null;

  /**
   * Set a callback to receive download progress updates
   */
  setProgressCallback(callback: (progress: DownloadProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(stage: DownloadProgress['stage'], message: string) {
    if (this.progressCallback) {
      this.progressCallback({ stage, message });
    }
  }

  /**
   * Generate and download PDF report
   */
  async downloadReportAsPDF(report: CompletedReport): Promise<void> {
    try {
      this.updateProgress('preparing', 'Preparing your report...');

      // Check if libraries are loaded
      if (!window.jspdf || !window.html2canvas) {
        throw new Error('PDF generation libraries not loaded');
      }

      const { jsPDF } = window.jspdf;

      this.updateProgress('generating', 'Generating PDF document...');

      // Create PDF document (A4 size)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Helper to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper to add wrapped text
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#333333') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color);
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.4;

        checkPageBreak(lines.length * lineHeight);
        doc.text(lines, margin, yPos);
        yPos += lines.length * lineHeight;
      };

      // Header Section
      doc.setFillColor(26, 32, 44); // Dark background
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor('#FFFFFF');
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Vehicle Inspection Report', margin, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`, margin, 28);
      doc.text(`VIN: ${report.vehicle.vin}`, margin, 35);

      doc.setTextColor('#4FD1C5'); // Accent color
      doc.text(`Report ID: ${report.id}`, pageWidth - margin - 50, 28, { align: 'right' });
      doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`, pageWidth - margin - 50, 35, { align: 'right' });

      yPos = 50;

      // AI-Powered Summary Section
      doc.setFillColor(45, 55, 72);
      doc.rect(margin, yPos, contentWidth, 8, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI-Powered Summary', margin + 2, yPos + 6);
      yPos += 12;

      doc.setTextColor('#4FD1C5');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Condition Assessment', margin, yPos);
      yPos += 5;

      addText(report.summary.overallCondition, 10, false);
      yPos += 5;

      // Key Findings
      checkPageBreak(20);
      doc.setTextColor('#4FD1C5');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Findings', margin, yPos);
      yPos += 5;

      if (report.summary.keyFindings.length > 0) {
        report.summary.keyFindings.forEach((finding) => {
          checkPageBreak(10);
          doc.setTextColor('#333333');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('•', margin + 2, yPos);
          const lines = doc.splitTextToSize(finding, contentWidth - 8);
          doc.text(lines, margin + 6, yPos);
          yPos += lines.length * 4;
        });
      } else {
        addText('No significant issues were found during the inspection.', 10, false, '#666666');
      }
      yPos += 5;

      // Recommendations
      checkPageBreak(20);
      doc.setTextColor('#4FD1C5');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', margin, yPos);
      yPos += 5;

      if (report.summary.recommendations.length > 0) {
        report.summary.recommendations.forEach((rec) => {
          checkPageBreak(10);
          doc.setTextColor('#333333');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('•', margin + 2, yPos);
          const lines = doc.splitTextToSize(rec, contentWidth - 8);
          doc.text(lines, margin + 6, yPos);
          yPos += lines.length * 4;
        });
      } else {
        addText('No immediate recommendations.', 10, false, '#666666');
      }
      yPos += 10;

      // Vehicle History Section
      checkPageBreak(40);
      doc.setFillColor(45, 55, 72);
      doc.rect(margin, yPos, contentWidth / 2 - 2, 8, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Vehicle History', margin + 2, yPos + 6);
      yPos += 12;

      const historyData = [
        ['Previous Owners:', report.vehicleHistory.ownerCount.toString()],
        ['Accident Reported:', report.vehicleHistory.hasAccident ? 'Yes' : 'No'],
        ['Title Issues:', report.vehicleHistory.titleIssues || 'Clean'],
        ['Last Odometer:', report.vehicleHistory.lastOdometerReading]
      ];

      doc.setFontSize(10);
      historyData.forEach(([label, value]) => {
        checkPageBreak(6);
        doc.setTextColor('#666666');
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin + 2, yPos);
        doc.setTextColor('#333333');
        doc.setFont('helvetica', 'bold');
        doc.text(value, margin + 50, yPos);
        yPos += 5;
      });

      if (report.vehicleHistory.hasAccident && report.vehicleHistory.accidentDetails) {
        yPos += 2;
        checkPageBreak(10);
        doc.setTextColor('#666666');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const accidentLines = doc.splitTextToSize(`Details: ${report.vehicleHistory.accidentDetails}`, contentWidth / 2 - 4);
        doc.text(accidentLines, margin + 2, yPos);
        yPos += accidentLines.length * 3.5;
      }

      // Theft & Salvage Section
      const theftYStart = yPos - (historyData.length * 5 + 12);
      let theftYPos = theftYStart + 12;

      doc.setFillColor(45, 55, 72);
      doc.rect(pageWidth / 2 + 2, theftYStart, contentWidth / 2 - 2, 8, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Theft & Salvage Record', pageWidth / 2 + 4, theftYStart + 6);

      const theftData = [
        ['Stolen Status:', report.theftAndSalvage.isStolen ? 'Reported Stolen' : 'Not Stolen'],
        ['Salvage Status:', report.theftAndSalvage.isSalvage ? 'Salvage Title' : 'Not Salvage']
      ];

      doc.setFontSize(10);
      theftData.forEach(([label, value]) => {
        doc.setTextColor('#666666');
        doc.setFont('helvetica', 'normal');
        doc.text(label, pageWidth / 2 + 4, theftYPos);
        doc.setTextColor('#333333');
        doc.setFont('helvetica', 'bold');
        const textWidth = doc.getTextWidth(value);
        doc.text(value, pageWidth - margin - textWidth - 2, theftYPos);
        theftYPos += 5;
      });

      yPos = Math.max(yPos, theftYPos);
      yPos += 5;

      if (report.theftAndSalvage.details) {
        checkPageBreak(10);
        doc.setTextColor('#666666');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const detailLines = doc.splitTextToSize(report.theftAndSalvage.details, contentWidth - 4);
        doc.text(detailLines, margin + 2, yPos);
        yPos += detailLines.length * 3.5 + 5;
      }

      // Safety Recalls Section
      checkPageBreak(20);
      doc.setFillColor(45, 55, 72);
      doc.rect(margin, yPos, contentWidth, 8, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Open Safety Recalls', margin + 2, yPos + 6);
      yPos += 12;

      if (report.safetyRecalls.length > 0) {
        report.safetyRecalls.forEach((recall, index) => {
          checkPageBreak(25);

          doc.setFillColor(240, 240, 240);
          const recallHeight = 20;
          doc.rect(margin, yPos - 2, contentWidth, recallHeight, 'F');

          doc.setTextColor('#333333');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(recall.component, margin + 2, yPos + 2);
          yPos += 6;

          const recallDetails = [
            `Summary: ${recall.summary}`,
            `Consequence: ${recall.consequence}`,
            `Remedy: ${recall.remedy}`
          ];

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          recallDetails.forEach(detail => {
            const lines = doc.splitTextToSize(detail, contentWidth - 4);
            doc.text(lines, margin + 2, yPos);
            yPos += lines.length * 3.5;
          });

          yPos += 5;
        });
      } else {
        doc.setTextColor('#666666');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No open safety recalls found for this VIN.', margin + 2, yPos);
        yPos += 5;
      }

      // Footer on last page
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor('#999999');
      doc.setFont('helvetica', 'italic');
      doc.text('Generated by AI Auto Pro Inspector', pageWidth / 2, footerY, { align: 'center' });

      this.updateProgress('saving', 'Saving to your device...');

      // Generate filename
      const filename = `Inspection_${report.vehicle.year}_${report.vehicle.make}_${report.vehicle.model}_${report.id}.pdf`;

      // For mobile, we need to handle the download differently
      if (this.isMobileDevice()) {
        // On mobile, convert to blob and trigger download
        const blob = doc.output('blob');
        this.downloadBlob(blob, filename);
      } else {
        // Desktop: direct download
        doc.save(filename);
      }

      this.updateProgress('complete', 'Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report. Please try again.');
    }
  }

  /**
   * Share report using Web Share API (mobile-optimized)
   */
  async shareReport(report: CompletedReport): Promise<boolean> {
    try {
      if (!this.canUseWebShare()) {
        throw new Error('Web Share API not supported on this device');
      }

      this.updateProgress('preparing', 'Preparing report for sharing...');

      // Generate PDF as blob
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Reuse the same PDF generation logic (simplified for sharing)
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;

      doc.setFillColor(26, 32, 44);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor('#FFFFFF');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Vehicle Inspection Report', margin, 20);
      doc.setFontSize(12);
      doc.text(`${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`, margin, 30);

      const blob = doc.output('blob');
      const filename = `Inspection_${report.vehicle.year}_${report.vehicle.make}_${report.vehicle.model}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      this.updateProgress('generating', 'Opening share menu...');

      await navigator.share({
        title: 'Vehicle Inspection Report',
        text: `Inspection report for ${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`,
        files: [file]
      });

      this.updateProgress('complete', 'Report shared successfully!');
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled share, not an error
        console.log('Share cancelled by user');
        return false;
      }
      console.error('Error sharing report:', error);
      throw error;
    }
  }

  /**
   * Check if Web Share API is available and supports file sharing
   */
  canUseWebShare(): boolean {
    return !!(navigator.share && navigator.canShare);
  }

  /**
   * Detect if running on mobile device
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Download blob file (mobile-friendly)
   */
  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Export singleton instance
export const downloadService = new DownloadService();
