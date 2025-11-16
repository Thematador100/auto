import React from 'react';
import { OBDScanner } from './OBDScanner';
import { RepairResources } from './RepairResources';

export const DiagnosticsTool: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-dark-card p-4 rounded-lg border border-dark-border">
                <h2 className="text-xl font-semibold text-light-text">Diagnostic & Repair Tools</h2>
                <p className="text-medium-text mt-1">
                    Diagnose issues with your vehicle and get comprehensive repair guidance.
                    Enter fault codes to receive detailed DIY repair instructions, parts lists, cost estimates, and links to repair resources.
                </p>
            </div>

            <OBDScanner />

            <RepairResources />
        </div>
    );
};