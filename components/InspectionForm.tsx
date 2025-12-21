import React, { useState, useRef } from 'react';
import { InspectionState, InspectionPhoto } from '../types';
import { useInspectionState, VehicleType } from '../hooks/useInspectionState';
import { VINScanner } from './VINScanner';
import { VEHICLE_INSPECTION_TEMPLATES } from '../constants';
import { resizeAndCompressImage } from '../services/imageOptimizer';
import { AudioRecorder } from './AudioRecorder';
import { LoadingSpinner } from './LoadingSpinner';

interface InspectionFormProps {
  onFinalize: (state: InspectionState) => void;
}

const vehicleTypes = Object.keys(VEHICLE_INSPECTION_TEMPLATES) as VehicleType[];

export const InspectionForm: React.FC<InspectionFormProps> = ({ onFinalize }) => {
  const {
    inspectionState,
    initializeState,
    updateChecklistItem,
    setOdometer,
    setOverallNotes,
    addPhotoToChecklistItem,
    removePhotoFromChecklistItem,
    addAudioToChecklistItem,
  } = useInspectionState();
  
  const [vin, setVin] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('Standard');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentPhotoContext = useRef<{ category: string; itemIndex: number } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !currentPhotoContext.current) {
      return;
    }
    const file = event.target.files[0];
    const { category, itemIndex } = currentPhotoContext.current;
    const uploadKey = `${category}-${itemIndex}`;
    
    setIsUploading(prev => ({ ...prev, [uploadKey]: true }));
    try {
      const { base64, mimeType } = await resizeAndCompressImage(file);
      const photo: InspectionPhoto = {
        id: `${Date.now()}-${Math.random()}`,
        category: category,
        base64,
        mimeType,
        notes: ''
      };
      addPhotoToChecklistItem(category, itemIndex, photo);
    } catch (err) {
      console.error("Error processing image:", err);
      alert("Failed to process image. Please try a different file.");
    } finally {
      setIsUploading(prev => ({ ...prev, [uploadKey]: false }));
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileUpload = (category: string, itemIndex: number) => {
    currentPhotoContext.current = { category, itemIndex };
    fileInputRef.current?.click();
  };

  if (!inspectionState) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <VINScanner
          onVinDecoded={(vehicle) => initializeState(vehicle, selectedVehicleType)}
          vin={vin}
          setVin={setVin}
        />
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold text-light-text mb-3">Select Vehicle Type</h2>
          <p className="text-medium-text mb-4">Choose the template that best matches the vehicle you're inspecting.</p>
          <select
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value as VehicleType)}
            className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text"
          >
            {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>
    );
  }

  const handleFinalizeClick = () => {
    if (!inspectionState.odometer.trim() || !/^\d+$/.test(inspectionState.odometer)) {
        setError("Please enter a valid odometer reading (numbers only).");
        return;
    }
    setError(null);
    onFinalize(inspectionState);
  }

  return (
    <div className="space-y-6">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
        <h1 className="text-2xl font-bold text-light-text">Inspection for {inspectionState.vehicle.year} {inspectionState.vehicle.make} {inspectionState.vehicle.model}</h1>
        <p className="font-mono text-medium-text">{inspectionState.vehicle.vin}</p>
      </div>

      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold text-light-text mb-3">Odometer Reading</h2>
          <input 
            type="text"
            placeholder="e.g., 75300"
            value={inspectionState.odometer}
            onChange={(e) => setOdometer(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text font-mono"
            />
      </div>

      {Object.entries(inspectionState.checklist).map(([category, items]) => (
        <div key={category} className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold text-light-text mb-4">{category}</h2>
          <div className="space-y-6">
            {Array.isArray(items) && items.map((item, index) => (
              <div key={index} className="border-t border-dark-border pt-4">
                <div className="flex justify-between items-start">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => updateChecklistItem(category, index, { checked: e.target.checked })}
                      className="h-5 w-5 rounded bg-dark-bg border-dark-border text-primary focus:ring-primary"
                    />
                    <span className="text-light-text">{item.item}</span>
                  </label>
                </div>
                <div className="pl-8 mt-2 space-y-3">
                    <textarea
                        placeholder="Add notes..."
                        value={item.notes}
                        onChange={(e) => updateChecklistItem(category, index, { notes: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text text-sm"
                        rows={2}
                    />
                    <div className="flex items-center gap-4">
                       <button
                          onClick={() => triggerFileUpload(category, index)}
                          disabled={isUploading[`${category}-${index}`]}
                          className="text-xs font-semibold py-1 px-3 rounded-md transition-colors bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 disabled:bg-gray-500"
                        >
                          {isUploading[`${category}-${index}`] ? <LoadingSpinner /> : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                              Add Photo
                            </>
                          )}
                        </button>
                        <AudioRecorder 
                            onAudioReady={(audio) => addAudioToChecklistItem(category, index, audio)} 
                            hasAudio={!!item.audio}
                        />
                    </div>
                     {item.photos.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {item.photos.map(photo => (
                                <div key={photo.id} className="relative group">
                                    <img src={`data:${photo.mimeType};base64,${photo.base64}`} alt="Inspection" className="rounded-md object-cover w-full h-20"/>
                                    <button onClick={() => removePhotoFromChecklistItem(category, index, photo.id)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 m-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold text-light-text mb-3">Overall Notes</h2>
          <textarea
            placeholder="Add any final thoughts or summary notes about the vehicle..."
            value={inspectionState.overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text"
            rows={4}
          />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex justify-end p-4">
          <button 
            onClick={handleFinalizeClick}
            className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
              Finalize & Generate Report
          </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};
