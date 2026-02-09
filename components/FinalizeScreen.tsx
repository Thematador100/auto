import React, { useState, useEffect } from 'react';
import { InspectionState, CompletedReport, ReportSection, ReportSectionItem, InspectionSection } from '../types';
import { getVehicleHistory } from '../services/vehicleHistoryService';
import { getSafetyRecalls, getTheftAndSalvageRecord } from '../services/vehicleExtraDataService';
import { generateReportSummary } from '../services/geminiService';
import { offlineService } from '../services/offlineService';
import { LoadingSpinner } from './LoadingSpinner';

interface FinalizeScreenProps {
  inspectionState: InspectionState;
  onReportComplete: (report: CompletedReport) => void;
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

/**
 * Convert an InspectionSection (checklist categories with items) into structured ReportSections.
 * This transforms the raw checklist data into the report-ready format with pass/fail/concern statuses.
 */
const buildReportSections = (checklist: InspectionSection): ReportSection[] => {
  const sections: ReportSection[] = [];

  for (const [category, items] of Object.entries(checklist)) {
    if (!Array.isArray(items) || items.length === 0) continue;

    const reportItems: ReportSectionItem[] = items.map((item) => {
      let status: 'Pass' | 'Fail' | 'Concern' | 'N/A';
      switch (item.condition) {
        case 'pass': status = 'Pass'; break;
        case 'fail': status = 'Fail'; break;
        case 'concern': status = 'Concern'; break;
        case 'na': status = 'N/A'; break;
        default:
          // Legacy fallback: if condition not set, use checked state
          status = item.checked ? 'Pass' : 'N/A';
      }

      return {
        check: item.item,
        status,
        details: item.notes || '',
        photos: item.photos.map(p => ({
          category: p.category,
          url: `data:${p.mimeType};base64,${p.base64}`,
          notes: p.notes,
        })),
      };
    });

    // Build a section-level note summarizing failures and concerns
    const failCount = reportItems.filter(i => i.status === 'Fail').length;
    const concernCount = reportItems.filter(i => i.status === 'Concern').length;
    const passCount = reportItems.filter(i => i.status === 'Pass').length;
    const parts: string[] = [];
    if (passCount > 0) parts.push(`${passCount} passed`);
    if (failCount > 0) parts.push(`${failCount} failed`);
    if (concernCount > 0) parts.push(`${concernCount} concerns`);

    sections.push({
      title: category,
      notes: parts.length > 0 ? parts.join(', ') : 'Not inspected',
      items: reportItems,
    });
  }

  return sections;
};

export const FinalizeScreen: React.FC<FinalizeScreenProps> = ({ inspectionState, onReportComplete }) => {
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

        // Build structured sections from checklist data
        const sections = buildReportSections(inspectionState.checklist);

        // Build compliance sections (DOT, Habitability, Authenticity) if applicable
        const complianceSections = buildReportSections(inspectionState.complianceChecklist);

        const newReport: CompletedReport = {
          id: `rep-${Date.now()}`,
          date: new Date().toISOString(),
          vehicle: inspectionState.vehicle,
          vehicleType: inspectionState.vehicleType,
          odometer: inspectionState.odometer,
          summary,
          sections,
          complianceSections,
          vehicleHistory: history,
          safetyRecalls: recalls,
          theftAndSalvage: theftRecord,
        };

        setStatus('Saving report...');
        await offlineService.saveReport(newReport);

        setStatus('Done!');
        onReportComplete(newReport);
      } catch (err) {
        console.error("Failed to generate report:", err);
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(`Report generation failed: ${message}`);
      }
    };

    generateReport();
  }, [inspectionState, onReportComplete]);

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
