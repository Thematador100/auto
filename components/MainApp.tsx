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
          // Fallback if state is lost - redirect to dashboard
          setTimeout(() => {
            setView('Dashboard');
            setActiveTab('Dashboard');
          }, 0);
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-medium-text">Redirecting to dashboard...</p>
            </div>
          );
        }
        return <FinalizeScreen inspectionState={inspectionState} onReportComplete={handleReportComplete} />;
      case 'Report':
        if (!completedReport) {
          // Fallback if state is lost - redirect to dashboard
          setTimeout(() => {
            setView('Dashboard');
            setActiveTab('Dashboard');
          }, 0);
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-medium-text">Redirecting to dashboard...</p>
            </div>
          );
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
    </div>
  );
};
