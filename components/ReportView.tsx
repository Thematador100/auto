import React, { useState } from 'react';
import { CompletedReport, SafetyRecall } from '../types';

declare const html2canvas: any;
declare const jspdf: any;

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
    <h2 className="text-xl font-semibold text-light-text border-b border-dark-border pb-3 mb-4">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Recall: React.FC<{ recall: SafetyRecall }> = ({ recall }) => (
    <div className="p-4 rounded-md bg-dark-bg border border-dark-border">
        <h4 className="font-bold text-light-text">{recall.component}</h4>
        <p className="text-sm text-medium-text mt-1"><strong className="text-light-text">Summary:</strong> {recall.summary}</p>
        <p className="text-sm text-medium-text mt-1"><strong className="text-light-text">Consequence:</strong> {recall.consequence}</p>
        <p className="text-sm text-medium-text mt-1"><strong className="text-light-text">Remedy:</strong> {recall.remedy}</p>
    </div>
);


export const ReportView: React.FC<{ report: CompletedReport }> = ({ report }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#121212',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`inspection-report-${report.vehicle.vin}-${report.id}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Inspection Report - ${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`,
      text: `Vehicle Inspection Report\nVIN: ${report.vehicle.vin}\nDate: ${new Date(report.date).toLocaleDateString()}\n\nOverall Condition: ${report.summary.overallCondition}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to mailto if Web Share API not available
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-light-text">Inspection Report</h1>
                <p className="text-medium-text">
                    {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                </p>
                <p className="font-mono text-sm text-primary">{report.vehicle.vin}</p>
            </div>
            <div className="text-right">
                <p className="text-medium-text">Report ID: {report.id}</p>
                <p className="text-medium-text">Date: {new Date(report.date).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            className="bg-dark-bg hover:bg-dark-border text-light-text font-semibold py-2 px-4 rounded-lg border border-dark-border transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      <div id="report-content">

      <SectionCard title="AI-Powered Summary">
        <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Overall Condition Assessment</h3>
            <p className="text-light-text whitespace-pre-wrap">{report.summary.overallCondition}</p>
        </div>
         <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Key Findings</h3>
            {report.summary.keyFindings.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-light-text">
                    {report.summary.keyFindings.map((finding, i) => <li key={i}>{finding}</li>)}
                </ul>
            ) : <p className="text-medium-text">No significant issues were found during the inspection.</p>}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Recommendations</h3>
             {report.summary.recommendations.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-light-text">
                    {report.summary.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
             ) : <p className="text-medium-text">No immediate recommendations.</p>}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <SectionCard title="Vehicle History">
            <div className="flex justify-between">
                <span className="text-medium-text">Previous Owners:</span>
                <span className="font-semibold text-light-text">{report.vehicleHistory.ownerCount}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-medium-text">Accident Reported:</span>
                <span className={`font-semibold ${report.vehicleHistory.hasAccident ? 'text-red-400' : 'text-green-400'}`}>
                    {report.vehicleHistory.hasAccident ? 'Yes' : 'No'}
                </span>
            </div>
            {report.vehicleHistory.hasAccident && (
                 <p className="text-sm text-medium-text border-t border-dark-border pt-2">
                    <strong>Details:</strong> {report.vehicleHistory.accidentDetails}
                 </p>
            )}
             <div className="flex justify-between">
                <span className="text-medium-text">Title Issues:</span>
                <span className={`font-semibold ${report.vehicleHistory.titleIssues ? 'text-red-400' : 'text-green-400'}`}>
                    {report.vehicleHistory.titleIssues || 'Clean'}
                </span>
            </div>
             <div className="flex justify-between">
                <span className="text-medium-text">Last Odometer Reading:</span>
                <span className="font-semibold text-light-text">{report.vehicleHistory.lastOdometerReading}</span>
            </div>
        </SectionCard>

        <SectionCard title="Theft & Salvage Record">
             <div className="flex justify-between">
                <span className="text-medium-text">Stolen Status:</span>
                <span className={`font-semibold ${report.theftAndSalvage.isStolen ? 'text-red-400' : 'text-green-400'}`}>
                    {report.theftAndSalvage.isStolen ? 'Reported Stolen' : 'Not Stolen'}
                </span>
            </div>
             <div className="flex justify-between">
                <span className="text-medium-text">Salvage Status:</span>
                <span className={`font-semibold ${report.theftAndSalvage.isSalvage ? 'text-red-400' : 'text-green-400'}`}>
                    {report.theftAndSalvage.isSalvage ? 'Salvage Title Reported' : 'Not Salvage'}
                </span>
            </div>
            <p className="text-sm text-medium-text border-t border-dark-border pt-2">
                {report.theftAndSalvage.details}
            </p>
        </SectionCard>
      </div>
      
      <SectionCard title="Open Safety Recalls">
        {report.safetyRecalls.length > 0 ? (
            <div className="space-y-4">
                {report.safetyRecalls.map((recall, i) => <Recall key={i} recall={recall} />)}
            </div>
        ) : (
            <p className="text-medium-text">No open safety recalls found for this VIN.</p>
        )}
      </SectionCard>
      </div>

    </div>
  );
};
