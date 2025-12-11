import React, { useState } from 'react';
import { CompletedReport, SafetyRecall } from '../types';
import { generatePDF, printReport } from '../services/pdfGenerator';

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generatePDF(report);
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    printReport();
  };

  const handleEmailReport = () => {
    setShowEmailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="bg-dark-card p-4 rounded-lg border border-dark-border flex gap-3 justify-end print:hidden">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
        </button>

        <button
          onClick={handleEmailReport}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Email Report
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print
        </button>
      </div>

      {/* Report Header */}
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

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-light-text mb-4">Email Report</h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              const name = formData.get('name') as string;
              const message = formData.get('message') as string;

              try {
                // Call backend API to send email
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/email`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    reportId: report.id,
                    recipientEmail: email,
                    recipientName: name,
                    message: message,
                    report: report
                  })
                });

                if (response.ok) {
                  alert('Report emailed successfully!');
                  setShowEmailModal(false);
                } else {
                  const error = await response.json();
                  alert(`Failed to send email: ${error.error || 'Unknown error'}`);
                }
              } catch (error) {
                console.error('Email error:', error);
                alert('Failed to send email. Please check your connection.');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-light-text font-semibold mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-2"
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="block text-light-text font-semibold mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-2"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-light-text font-semibold mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-2"
                    placeholder="Add a personal message to the customer..."
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
