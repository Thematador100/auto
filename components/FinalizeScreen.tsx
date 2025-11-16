import React, { useState, useEffect } from 'react';
import { InspectionState, CompletedReport, User } from '../types';
import { getVehicleHistory } from '../services/vehicleHistoryService';
import { getSafetyRecalls, getTheftAndSalvageRecord } from '../services/vehicleExtraDataService';
import { generateReportSummary } from '../services/geminiService';
import { offlineService } from '../services/offlineService';
import { notificationService } from '../services/notificationService';
import { backendService } from '../services/backendService';
import { LoadingSpinner } from './LoadingSpinner';

interface FinalizeScreenProps {
  inspectionState: InspectionState;
  onReportComplete: (report: CompletedReport) => void;
  user: User;
}

const parseSummary = (summaryText: string) => {
    const overallConditionMatch = summaryText.match(/### 1\. Overall Condition Assessment\s*([\s\S]*?)(?=### 2\.|$)/);
    const keyFindingsMatch = summaryText.match(/### 2\. Key Findings\s*([\s\S]*?)(?=### 3\.|$)/);
    const recommendationsMatch = summaryText.match(/### 3\. Recommendations\s*([\s\S]*)/);
    
    const parseList = (text: string | undefined) => text ? text.trim().split('\n').map(s => s.replace(/^- \s*/, '').trim()).filter(Boolean) : [];

    return {
        overallCondition: overallConditionMatch ? overallConditionMatch[1].trim() : "Summary could not be generated.",
        keyFindings: keyFindingsMatch ? parseList(keyFindingsMatch[1]) : [],
        recommendations: recommendationsMatch ? parseList(recommendationsMatch[1]) : []
    };
};

export const FinalizeScreen: React.FC<FinalizeScreenProps> = ({ inspectionState, onReportComplete, user }) => {
  const [status, setStatus] = useState('Starting...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateReport = async () => {
      try {
        setStatus('Fetching vehicle history...');
        const historyPromise = getVehicleHistory(inspectionState.vehicle.vin);

        setStatus('Checking for safety recalls...');
        const recallsPromise = getSafetyRecalls(inspectionState.vehicle.vin);

        setStatus('Checking for theft & salvage records...');
        const theftPromise = getTheftAndSalvageRecord(inspectionState.vehicle.vin);

        setStatus('Generating AI summary...');
        const summaryPromise = generateReportSummary(inspectionState);

        const [history, recalls, theftRecord, summaryText] = await Promise.all([historyPromise, recallsPromise, theftPromise, summaryPromise]);

        setStatus('Compiling final report...');

        const summary = parseSummary(summaryText);

        const now = new Date().toISOString();

        // Create the completed report with all required fields
        const newReport: CompletedReport = {
          id: `rep-${Date.now()}`,
          date: now,
          vehicle: inspectionState.vehicle,
          summary,
          sections: [],
          vehicleHistory: history || undefined,
          safetyRecalls: recalls,
          theftAndSalvage: theftRecord || undefined,
          inspectorId: user.id,
          status: 'completed',
          completedAt: now,
        };

        setStatus('Saving report...');
        await offlineService.saveReport(newReport);

        // Try to save to backend if configured
        setStatus('Syncing with server...');
        await backendService.saveReport(newReport);

        // Send notification about job completion
        if (user.role === 'inspector') {
          notificationService.addNotification(user.id, {
            type: 'job-completed',
            title: 'Inspection Completed',
            message: `Inspection for ${inspectionState.vehicle.year} ${inspectionState.vehicle.make} ${inspectionState.vehicle.model} (${inspectionState.vehicle.vin}) has been completed successfully.`,
            priority: 'medium',
          });
        }

        setStatus('Done!');
        onReportComplete(newReport);
      } catch (err) {
        console.error("Failed to generate report:", err);
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(`Report generation failed: ${message}`);
      }
    };

    generateReport();
  }, [inspectionState, onReportComplete, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center max-w-lg w-full">
            <h1 className="text-2xl font-bold text-light-text mb-4">Generating Your Report</h1>
            <p className="text-medium-text mb-6">Please wait a moment while we compile the data and generate the AI-powered summary.</p>
            
            <div className="flex justify-center items-center h-20">
                <LoadingSpinner />
            </div>
            
            <p className="text-sm text-primary font-semibold">{status}</p>

            {error && (
                <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md text-left">
                    <h3 className="font-bold">An Error Occurred</h3>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            )}
        </div>
    </div>
  );
};
