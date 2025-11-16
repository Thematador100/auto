import React from 'react';
import { OBDScanner } from './OBDScanner';

export const DiagnosticsTool: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-dark-card p-4 rounded-lg border border-dark-border">
                <h2 className="text-xl font-semibold text-light-text">Diagnostic Tools</h2>
                <p className="text-medium-text mt-1">Use these tools to diagnose issues with your vehicle. Connect to an OBD-II scanner or enter codes manually to read and analyze fault codes.</p>
            </div>
            
            <OBDScanner />

        </div>
    );
};