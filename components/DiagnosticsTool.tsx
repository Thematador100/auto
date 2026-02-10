import React, { useState } from 'react';
import { OBDScanner } from './OBDScanner';
import { OBDScannerPro } from './OBDScannerPro';
import { WiFiOBDScanner } from './WiFiOBDScanner';
import { HeavyDutyScanner } from './HeavyDutyScanner';

export const DiagnosticsTool: React.FC = () => {
    const [scannerMode, setScannerMode] = useState<'bluetooth' | 'wifi' | 'manual' | 'heavyduty'>('bluetooth');

    return (
        <div className="space-y-6">
            <div className="bg-dark-card p-4 rounded-lg border border-dark-border">
                <h2 className="text-2xl font-semibold text-light-text">🔧 Professional Diagnostic Tools</h2>
                <p className="text-medium-text mt-1">
                    Connect your OBDLink MX+ Bluetooth scanner for professional diagnostics with EV battery health monitoring, or use WiFi (iOS) or manual entry. For commercial trucks, use the J1939 Heavy-Duty mode.
                </p>

                {/* Mode Selector */}
                <div className="flex gap-4 mt-4 flex-wrap">
                    <button
                        onClick={() => setScannerMode('bluetooth')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                            scannerMode === 'bluetooth'
                                ? 'bg-gradient-to-r from-primary to-purple-600 text-white'
                                : 'bg-dark-bg text-medium-text hover:text-light-text'
                        }`}
                    >
                        <span>⚡ Pro Bluetooth</span>
                        <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">EV+</span>
                    </button>
                    <button
                        onClick={() => setScannerMode('heavyduty')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                            scannerMode === 'heavyduty'
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                : 'bg-dark-bg text-medium-text hover:text-light-text'
                        }`}
                    >
                        <span>🚛 Heavy-Duty J1939</span>
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">CDL</span>
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

            {scannerMode === 'bluetooth' && <OBDScannerPro />}
            {scannerMode === 'heavyduty' && <HeavyDutyScanner />}
            {scannerMode === 'wifi' && <WiFiOBDScanner />}
            {scannerMode === 'manual' && <OBDScanner />}

        </div>
    );
};
