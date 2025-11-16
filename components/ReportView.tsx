import React, { useState } from 'react';
import { CompletedReport, SafetyRecall } from '../types';
import { exportReportAsPDF, exportReportAsExcel, sendReportEmail } from '../services/exportService';
import toast from 'react-hot-toast';

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
    <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-3 mb-4">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Recall: React.FC<{ recall: SafetyRecall }> = ({ recall }) => (
    <div className="p-4 rounded-md bg-slate-900 border border-slate-700">
        <h4 className="font-bold text-white">{recall.component}</h4>
        <p className="text-sm text-gray-300 mt-1"><strong className="text-white">Summary:</strong> {recall.summary}</p>
        <p className="text-sm text-gray-300 mt-1"><strong className="text-white">Consequence:</strong> {recall.consequence}</p>
        <p className="text-sm text-gray-300 mt-1"><strong className="text-white">Remedy:</strong> {recall.remedy}</p>
    </div>
);


export const ReportView: React.FC<{ report: CompletedReport }> = ({ report }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const handlePDFExport = () => {
    try {
      exportReportAsPDF(report);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleExcelExport = () => {
    try {
      exportReportAsExcel(report);
      toast.success('Excel report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate Excel file');
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      await sendReportEmail(report, emailAddress);
      toast.success(`Report sent to ${emailAddress}`);
      setShowEmailModal(false);
      setEmailAddress('');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Inspection Report</h1>
                <p className="text-gray-300">
                    {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                </p>
                <p className="font-mono text-sm text-blue-400">{report.vehicle.vin}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handlePDFExport}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={handleExcelExport}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Excel
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Report
                </button>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm text-gray-400">
          <span>Report ID: {report.id}</span>
          <span>Date: {new Date(report.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Send Report via Email</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer@example.com"
                onKeyPress={(e) => e.key === 'Enter' && handleSendEmail()}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailAddress('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <SectionCard title="AI-Powered Summary">
        <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Overall Condition Assessment</h3>
            <p className="text-white whitespace-pre-wrap">{report.summary.overallCondition}</p>
        </div>
         <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Key Findings</h3>
            {report.summary.keyFindings.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-white">
                    {report.summary.keyFindings.map((finding, i) => <li key={i}>{finding}</li>)}
                </ul>
            ) : <p className="text-gray-300">No significant issues were found during the inspection.</p>}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Recommendations</h3>
             {report.summary.recommendations.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-white">
                    {report.summary.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
             ) : <p className="text-gray-300">No immediate recommendations.</p>}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <SectionCard title="Vehicle History">
            <div className="flex justify-between">
                <span className="text-gray-300">Previous Owners:</span>
                <span className="font-semibold text-white">{report.vehicleHistory.ownerCount}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-300">Accident Reported:</span>
                <span className={`font-semibold ${report.vehicleHistory.hasAccident ? 'text-red-400' : 'text-green-400'}`}>
                    {report.vehicleHistory.hasAccident ? 'Yes' : 'No'}
                </span>
            </div>
            {report.vehicleHistory.hasAccident && (
                 <p className="text-sm text-gray-300 border-t border-slate-700 pt-2">
                    <strong>Details:</strong> {report.vehicleHistory.accidentDetails}
                 </p>
            )}
             <div className="flex justify-between">
                <span className="text-gray-300">Title Issues:</span>
                <span className={`font-semibold ${report.vehicleHistory.titleIssues ? 'text-red-400' : 'text-green-400'}`}>
                    {report.vehicleHistory.titleIssues || 'Clean'}
                </span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-300">Last Odometer Reading:</span>
                <span className="font-semibold text-white">{report.vehicleHistory.lastOdometerReading}</span>
            </div>
        </SectionCard>

        <SectionCard title="Theft & Salvage Record">
             <div className="flex justify-between">
                <span className="text-gray-300">Stolen Status:</span>
                <span className={`font-semibold ${report.theftAndSalvage.isStolen ? 'text-red-400' : 'text-green-400'}`}>
                    {report.theftAndSalvage.isStolen ? 'Reported Stolen' : 'Not Stolen'}
                </span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-300">Salvage Status:</span>
                <span className={`font-semibold ${report.theftAndSalvage.isSalvage ? 'text-red-400' : 'text-green-400'}`}>
                    {report.theftAndSalvage.isSalvage ? 'Salvage Title Reported' : 'Not Salvage'}
                </span>
            </div>
            <p className="text-sm text-gray-300 border-t border-slate-700 pt-2">
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
            <p className="text-gray-300">No open safety recalls found for this VIN.</p>
        )}
      </SectionCard>

    </div>
  );
};
