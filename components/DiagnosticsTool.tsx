import React, { useState } from 'react';
import { OBDScanner } from './OBDScanner';
import { BluetoothOBDScanner } from './BluetoothOBDScanner';
import { WiFiOBDScanner } from './WiFiOBDScanner';

export const DiagnosticsTool: React.FC = () => {
    const [scannerMode, setScannerMode] = useState<'bluetooth' | 'wifi' | 'manual'>('bluetooth');

    return (
        <div className="space-y-6">
            <div className="bg-dark-card p-4 rounded-lg border border-dark-border">
                <h2 className="text-xl font-semibold text-light-text">Diagnostic Tools</h2>
                <p className="text-medium-text mt-1">
                    Scan your vehicle for diagnostic trouble codes (DTCs) using Bluetooth, WiFi OBD2 adapters (works on iPhone!), or enter codes manually.
                </p>

                {/* Mode Selector */}
                <div className="flex gap-4 mt-4 flex-wrap">
                    <button
                        onClick={() => setScannerMode('bluetooth')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            scannerMode === 'bluetooth'
                                ? 'bg-primary text-white'
                                : 'bg-dark-bg text-medium-text hover:text-light-text'
                        }`}
                    >
                        📱 Bluetooth Scanner
                    </button>
                    <button
                        onClick={() => setScannerMode('wifi')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            scannerMode === 'wifi'
                                ? 'bg-primary text-white'
                                : 'bg-dark-bg text-medium-text hover:text-light-text'
                        }`}
                    >
                        📡 WiFi Scanner (iOS)
                    </button>
                    <button
                        onClick={() => setScannerMode('manual')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            scannerMode === 'manual'
                                ? 'bg-primary text-white'
                                : 'bg-dark-bg text-medium-text hover:text-light-text'
                        }`}
                    >
                        ⌨️ Manual Entry
                    </button>
                </div>
            </div>

            {scannerMode === 'bluetooth' && <BluetoothOBDScanner />}
            {scannerMode === 'wifi' && <WiFiOBDScanner />}
            {scannerMode === 'manual' && <OBDScanner />}

        </div>
    );
};