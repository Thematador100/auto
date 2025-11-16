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
import HelpCenter from './HelpCenter';
import NotificationPanel from './NotificationPanel';

type View = 'Dashboard' | 'Inspection' | 'Diagnostics' | 'Assistant' | 'Help' | 'Finalize' | 'Report';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<View>('Dashboard');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [inspectionState, setInspectionState] = useState<InspectionState | null>(null);
  const [completedReport, setCompletedReport] = useState<CompletedReport | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

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
    if (tab === 'Dashboard' || tab === 'Diagnostics' || tab === 'Assistant' || tab === 'Help') {
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
        return <FinalizeScreen inspectionState={inspectionState} onReportComplete={handleReportComplete} user={user} />;
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
      case 'Help':
        return <HelpCenter />;
      default:
        return <CustomerDashboard user={user} onNewInspection={handleNewInspection} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans">
      <Header
        user={user}
        currentTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        onShowNotifications={() => setShowNotifications(true)}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <Footer />
      {showNotifications && (
        <NotificationPanel
          userId={user.id}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};
