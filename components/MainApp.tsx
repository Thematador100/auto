import React, { useState } from 'react';
import { User, InspectionState, CompletedReport } from '../types';
import { Header } from './Header';
import { Footer } from './Footer';
import { CustomerDashboard } from './CustomerDashboard';
import { InspectionForm } from './InspectionForm';
import { DiagnosticsTool } from './DiagnosticsTool';
import { ChatBot } from './ChatBot';
import { FinalizeScreen } from './FinalizeScreen';
import { ReportView } from './ReportView';
import { SupportAgent } from './SupportAgent';

type View = 'Dashboard' | 'Inspection' | 'Diagnostics' | 'Assistant' | 'Finalize' | 'Report';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<View>('Dashboard');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [inspectionState, setInspectionState] = useState<InspectionState | null>(null);
  const [completedReport, setCompletedReport] = useState<CompletedReport | null>(null);
  const [showSupport, setShowSupport] = useState(false);

  const handleNewInspection = () => {
    setInspectionState(null);
    setCompletedReport(null);
    setView('Inspection');
    setActiveTab('Inspection');
  };

  const handleFinalize = (state: InspectionState) => {
    setInspectionState(state);
    setView('Finalize');
  };

  const handleReportComplete = (report: CompletedReport) => {
    setCompletedReport(report);
    setView('Report');
  };

  const handleTabChange = (tab: View | string) => {
    setActiveTab(tab);
    
    // Reset transient states when navigating away
    if (tab === 'Dashboard' || tab === 'Diagnostics' || tab === 'Assistant') {
      setInspectionState(null);
      setCompletedReport(null);
      setView(tab as View);
    } else if (tab === 'Inspection') {
        handleNewInspection();
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'Dashboard':
        return <CustomerDashboard user={user} onNewInspection={handleNewInspection} />;
      case 'Inspection':
        return <InspectionForm onFinalize={handleFinalize} />;
      case 'Finalize':
        if (!inspectionState) {
          // Fallback if state is lost
          setView('Dashboard');
          setActiveTab('Dashboard');
          return null;
        }
        return <FinalizeScreen inspectionState={inspectionState} onReportComplete={handleReportComplete} />;
      case 'Report':
        if (!completedReport) {
          // Fallback if state is lost
          setView('Dashboard');
          setActiveTab('Dashboard');
          return null;
        }
        return <ReportView report={completedReport} />;
      case 'Diagnostics':
        return <DiagnosticsTool />;
      case 'Assistant':
        return <ChatBot />;
      default:
        return <CustomerDashboard user={user} onNewInspection={handleNewInspection} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans">
      <Header user={user} currentTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <Footer />

      {/* Floating Support Button - Always visible */}
      {!showSupport && (
        <button
          onClick={() => setShowSupport(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary-light text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-40 group"
          aria-label="Get Help"
          title="Need help? Chat with our support agent"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Need help? Click to chat with Alex 💬
          </span>
        </button>
      )}

      {/* Support Agent Chat Window */}
      {showSupport && (
        <SupportAgent
          onClose={() => setShowSupport(false)}
          initialContext={activeTab}
        />
      )}
    </div>
  );
};
