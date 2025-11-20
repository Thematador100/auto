// components/VINScanner.tsx
import React, { useState, useCallback } from 'react';
import { validateVIN } from '../services/vinValidator';
import { getVehicleDataByVIN } from '../services/vehicleDataService';
import { Vehicle } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface VINScannerProps {
  onVinDecoded: (vehicle: Vehicle) => void;
  vin: string;
  setVin: (vin: string) => void;
}

export const VINScanner: React.FC<VINScannerProps> = ({ onVinDecoded, vin, setVin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDecode = useCallback(async () => {
    setError(null);
    const validation = validateVIN(vin);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    
    setIsLoading(true);
    try {
      const vehicleData = await getVehicleDataByVIN(vin);
      onVinDecoded({ ...vehicleData, vin });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [vin, onVinDecoded]);

  return (
    <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
      <h2 className="text-xl font-semibold text-light-text mb-3">VIN Lookup</h2>
      <p className="text-medium-text mb-4">Enter the 17-digit Vehicle Identification Number (VIN) to automatically populate vehicle details.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Enter VIN..."
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          className="flex-grow bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text font-mono tracking-widest"
          maxLength={17}
        />
        <button
          onClick={handleDecode}
          disabled={isLoading || vin.length !== 17}
          className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <LoadingSpinner /> : "Decode VIN"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
