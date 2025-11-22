// GuidedInspection.tsx
import React, { useState, useEffect } from 'react';
import { InspectionState, InspectionPhoto } from '../types';
import { VEHICLE_INSPECTION_TEMPLATES, IMAGE_CATEGORIES } from '../constants';

interface InspectionStep {
  id: string;
  title: string;
  description: string;
  category: string;
  imageCategory?: string;
  tips: string[];
  redFlags: string[];
  photosRequired: number;
  audioOptional: boolean;
}

interface GuidedInspectionProps {
  inspectionState: InspectionState;
  onStepComplete: (stepId: string, data: {
    photos?: InspectionPhoto[];
    notes?: string;
    audio?: any;
  }) => void;
  onComplete: () => void;
}

/**
 * Generate inspection steps based on vehicle type
 */
const generateInspectionSteps = (vehicleType: keyof typeof VEHICLE_INSPECTION_TEMPLATES): InspectionStep[] => {
  const template = VEHICLE_INSPECTION_TEMPLATES[vehicleType];
  const steps: InspectionStep[] = [];

  // Exterior inspection steps
  steps.push({
    id: 'exterior-front',
    title: 'Front Exterior',
    description: 'Take photos of the vehicle from the front at a 45-degree angle',
    category: 'Exterior',
    imageCategory: 'Front View (45° angle)',
    tips: [
      'Stand about 10 feet away from the vehicle',
      'Make sure all headlights and grille are visible',
      'Look for any damage, dents, or scratches',
      'Check alignment of body panels',
    ],
    redFlags: [
      'Mismatched paint colors (could indicate previous repair)',
      'Uneven panel gaps',
      'Cracked or foggy headlights',
      'Rust around wheel wells',
    ],
    photosRequired: 2,
    audioOptional: true,
  });

  steps.push({
    id: 'exterior-sides',
    title: 'Side Panels',
    description: 'Take photos of both sides of the vehicle',
    category: 'Exterior',
    imageCategory: 'Side View',
    tips: [
      'Walk around the vehicle slowly',
      'Take one photo of each side',
      'Look for door dings, scratches, or dents',
      'Check window condition',
    ],
    redFlags: [
      'Misaligned doors',
      'Rust or bubbling paint',
      'Cracked windows',
      'Damaged side mirrors',
    ],
    photosRequired: 2,
    audioOptional: true,
  });

  steps.push({
    id: 'exterior-rear',
    title: 'Rear Exterior',
    description: 'Take photos of the vehicle from the rear',
    category: 'Exterior',
    imageCategory: 'Rear View',
    tips: [
      'Check tail lights for cracks or moisture',
      'Examine bumper for damage',
      'Look at exhaust pipe condition',
      'Check tire tread depth',
    ],
    redFlags: [
      'Excessive rust around exhaust',
      'Damaged tail lights',
      'Uneven tire wear',
      'Leaking fluids near exhaust',
    ],
    photosRequired: 2,
    audioOptional: true,
  });

  // Engine bay
  steps.push({
    id: 'engine-bay',
    title: 'Engine Bay',
    description: 'Open the hood and photograph the engine',
    category: 'Engine',
    imageCategory: 'Engine Bay',
    tips: [
      'Take photo with hood fully open',
      'Look for fluid leaks (oil, coolant)',
      'Check battery condition',
      'Inspect belts and hoses',
      'Look for aftermarket modifications',
    ],
    redFlags: [
      'Oil leaks (dark puddles or residue)',
      'Corroded battery terminals',
      'Cracked or fraying belts',
      'Coolant leaks (usually green, orange, or pink)',
      'Modified or missing emission components',
    ],
    photosRequired: 3,
    audioOptional: true,
  });

  // Interior
  steps.push({
    id: 'interior-front',
    title: 'Interior - Front Seats',
    description: 'Photograph the front interior and dashboard',
    category: 'Interior',
    imageCategory: 'Dashboard & Front Interior',
    tips: [
      'Check dashboard for warning lights',
      'Test all controls (AC, radio, windows)',
      'Inspect seat condition',
      'Check odometer reading',
      'Smell for smoke, mold, or musty odors',
    ],
    redFlags: [
      'Check Engine light is on',
      'Torn or heavily worn seats',
      'Non-functioning controls',
      'Strong odors',
      'Odometer seems unusually low for vehicle age',
    ],
    photosRequired: 2,
    audioOptional: true,
  });

  steps.push({
    id: 'interior-rear',
    title: 'Interior - Rear Seats',
    description: 'Photograph the rear seating area',
    category: 'Interior',
    imageCategory: 'Rear Seats',
    tips: [
      'Check seat condition',
      'Look for water damage or stains',
      'Test rear controls if applicable',
    ],
    redFlags: [
      'Water stains (could indicate leaks or flood damage)',
      'Torn upholstery',
      'Musty smell',
    ],
    photosRequired: 1,
    audioOptional: true,
  });

  // Undercarriage (if accessible)
  steps.push({
    id: 'undercarriage',
    title: 'Undercarriage',
    description: 'If possible, photograph underneath the vehicle',
    category: 'Undercarriage',
    imageCategory: 'Undercarriage',
    tips: [
      'Use a flashlight or phone light',
      'Look for fluid leaks',
      'Check for rust or damage',
      'Inspect exhaust system',
    ],
    redFlags: [
      'Active fluid leaks',
      'Excessive rust',
      'Damaged exhaust',
      'Bent frame components',
    ],
    photosRequired: 2,
    audioOptional: true,
  });

  // Test drive checklist
  steps.push({
    id: 'test-drive',
    title: 'Test Drive',
    description: 'Record your observations during the test drive',
    category: 'Test Drive',
    tips: [
      'Listen for unusual noises',
      'Test brakes (should feel firm)',
      'Check steering response',
      'Test acceleration',
      'Verify all gears shift smoothly',
    ],
    redFlags: [
      'Grinding or squealing brakes',
      'Vibration at high speeds',
      'Pulling to one side',
      'Rough shifting',
      'Engine hesitation',
    ],
    photosRequired: 0,
    audioOptional: true,
  });

  return steps;
};

export const GuidedInspection: React.FC<GuidedInspectionProps> = ({
  inspectionState,
  onStepComplete,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<InspectionStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showTips, setShowTips] = useState(true);
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const generatedSteps = generateInspectionSteps(inspectionState.vehicleType);
    setSteps(generatedSteps);
  }, [inspectionState.vehicleType]);

  const currentStep = steps[currentStepIndex];
  const progress = (completedSteps.size / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep) {
      // Validate step completion
      if (photos.length < currentStep.photosRequired) {
        alert(`Please take at least ${currentStep.photosRequired} photo(s) for this step`);
        return;
      }

      // Mark step as complete
      onStepComplete(currentStep.id, { photos, notes });
      setCompletedSteps(prev => new Set(prev).add(currentStep.id));

      // Reset for next step
      setPhotos([]);
      setNotes('');

      // Move to next step or complete
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        onComplete();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handlePhotoCapture = (photo: InspectionPhoto) => {
    setPhotos([...photos, photo]);
  };

  if (!currentStep) {
    return <div className="p-4">Loading inspection steps...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Guided Inspection</h2>
          <span className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">{Math.round(progress)}% Complete</p>
      </div>

      {/* Current Step */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
        <p className="text-gray-700 mb-4">{currentStep.description}</p>

        {/* Photos Required */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-medium">
            📸 Photos required: {currentStep.photosRequired}
            {currentStep.audioOptional && ' • 🎤 Audio notes optional'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Photos taken: {photos.length}/{currentStep.photosRequired}
          </p>
        </div>

        {/* Tips Toggle */}
        <button
          onClick={() => setShowTips(!showTips)}
          className="mb-3 text-blue-600 hover:text-blue-800 font-medium"
        >
          {showTips ? '▼' : '▶'} {showTips ? 'Hide' : 'Show'} Tips & Red Flags
        </button>

        {/* Tips and Red Flags */}
        {showTips && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Tips */}
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-900 mb-2">💡 Tips</h4>
              <ul className="space-y-1">
                {currentStep.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-green-800">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Flags */}
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-900 mb-2">🚩 Red Flags</h4>
              <ul className="space-y-1">
                {currentStep.redFlags.map((flag, idx) => (
                  <li key={idx} className="text-sm text-red-800">
                    • {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Photo Capture Area */}
        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded text-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const photo: InspectionPhoto = {
                    id: `photo_${Date.now()}`,
                    category: currentStep.imageCategory || currentStep.category,
                    base64: reader.result as string,
                    mimeType: file.type,
                    notes: '',
                  };
                  handlePhotoCapture(photo);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
            id="photo-input"
          />
          <label
            htmlFor="photo-input"
            className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📷 Take Photo
          </label>
          {photos.length > 0 && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {photos.length} photo(s) captured
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any observations or concerns..."
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={handleNextStep}
          disabled={photos.length < currentStep.photosRequired}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStepIndex === steps.length - 1 ? 'Complete ✓' : 'Next →'}
        </button>
      </div>
    </div>
  );
};
