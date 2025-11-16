import React, { useState } from 'react';
import { CompletedReport, SafetyRecall } from '../types';
import { downloadService, DownloadProgress } from '../services/downloadService';

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
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canShare = downloadService.canUseWebShare();

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    downloadService.setProgressCallback((progress) => {
      setDownloadProgress(progress);
    });

    try {
      await downloadService.downloadReportAsPDF(report);
      setTimeout(() => {
        setDownloadProgress(null);
        setIsDownloading(false);
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setDownloadProgress(null);
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsDownloading(true);
    setError(null);

    downloadService.setProgressCallback((progress) => {
      setDownloadProgress(progress);
    });

    try {
      await downloadService.shareReport(report);
      setTimeout(() => {
        setDownloadProgress(null);
        setIsDownloading(false);
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setDownloadProgress(null);
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold text-light-text">Inspection Report</h1>
                <p className="text-medium-text">
                    {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                </p>
                <p className="font-mono text-sm text-primary">{report.vehicle.vin}</p>
            </div>
            <div className="text-left lg:text-right">
                <p className="text-medium-text">Report ID: {report.id}</p>
                <p className="text-medium-text">Date: {new Date(report.date).toLocaleDateString()}</p>
            </div>
        </div>

        {/* Download and Share Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isDownloading ? 'Processing...' : 'Download PDF'}
          </button>

          {canShare && (
            <button
              onClick={handleShare}
              disabled={isDownloading}
              className="flex-1 sm:flex-none px-6 py-3 bg-dark-border text-light-text font-semibold rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Report
            </button>
          )}
        </div>

        {/* Progress Feedback */}
        {downloadProgress && (
          <div className="mt-4 p-4 bg-dark-bg border border-primary rounded-lg">
            <div className="flex items-center gap-3">
              {downloadProgress.stage !== 'complete' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              ) : (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <p className="text-light-text font-medium">{downloadProgress.message}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-400 font-medium">Download Failed</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
  );
};
