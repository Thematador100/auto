import React, { useState } from 'react';

interface FraudDetectionProps {
  claimedMileage: number;
  vin: string;
  onOdometerAnalysis: (result: any) => void;
  onFloodAnalysis: (result: any) => void;
}

export const FraudDetection: React.FC<FraudDetectionProps> = ({
  claimedMileage,
  vin,
  onOdometerAnalysis,
  onFloodAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'odometer' | 'flood'>('odometer');

  // Odometer fraud state
  const [pedalPhoto, setPedalPhoto] = useState<string | null>(null);
  const [steeringPhoto, setSteeringPhoto] = useState<string | null>(null);
  const [seatPhoto, setSeatPhoto] = useState<string | null>(null);
  const [odometerAnalyzing, setOdometerAnalyzing] = useState(false);
  const [odometerResult, setOdometerResult] = useState<any>(null);

  // Flood damage state
  const [mustySmell, setMustySmell] = useState(false);
  const [waterStains, setWaterStains] = useState(false);
  const [waterStainLocations, setWaterStainLocations] = useState<string[]>([]);
  const [rustUnusual, setRustUnusual] = useState(false);
  const [foggyLights, setFoggyLights] = useState(false);
  const [carpetReplaced, setCarpetReplaced] = useState(false);
  const [electricalCorrosion, setElectricalCorrosion] = useState(false);
  const [carpetPhoto, setCarpetPhoto] = useState<string | null>(null);
  const [engineBayPhoto, setEngineBayPhoto] = useState<string | null>(null);
  const [floodAnalyzing, setFloodAnalyzing] = useState(false);
  const [floodResult, setFloodResult] = useState<any>(null);

  const handlePhotoCapture = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (photo: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeOdometerFraud = async () => {
    if (!pedalPhoto) {
      alert('Please upload at least a pedal photo');
      return;
    }

    setOdometerAnalyzing(true);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://auto-production-8579.up.railway.app';

    try {
      const response = await fetch(`${BACKEND_URL}/api/fraud/analyze-odometer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          claimedMileage,
          pedalPhotoBase64: pedalPhoto,
          steeringPhotoBase64: steeringPhoto,
          seatPhotoBase64: seatPhoto
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOdometerResult(result);
        onOdometerAnalysis(result);
      } else {
        const error = await response.json();
        alert(`Analysis failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Odometer analysis error:', error);
      alert('Failed to analyze odometer fraud');
    } finally {
      setOdometerAnalyzing(false);
    }
  };

  const analyzeFloodDamage = async () => {
    setFloodAnalyzing(true);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://auto-production-8579.up.railway.app';

    try {
      const response = await fetch(`${BACKEND_URL}/api/fraud/analyze-flood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vin,
          mustySmell,
          waterStains,
          waterStainLocations,
          rustUnusual,
          foggyLights,
          carpetReplaced,
          electricalCorrosion,
          carpetPhotoBase64: carpetPhoto,
          engineBayPhotoBase64: engineBayPhoto
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFloodResult(result);
        onFloodAnalysis(result);
      } else {
        const error = await response.json();
        alert(`Analysis failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Flood analysis error:', error);
      alert('Failed to analyze flood damage');
    } finally {
      setFloodAnalyzing(false);
    }
  };

  return (
    <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
      <h2 className="text-2xl font-bold text-light-text mb-4">🕵️ Fraud Detection</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('odometer')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'odometer'
              ? 'text-primary border-b-2 border-primary'
              : 'text-medium-text hover:text-light-text'
          }`}
        >
          Odometer Fraud
        </button>
        <button
          onClick={() => setActiveTab('flood')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'flood'
              ? 'text-primary border-b-2 border-primary'
              : 'text-medium-text hover:text-light-text'
          }`}
        >
          Flood Damage
        </button>
      </div>

      {/* Odometer Fraud Tab */}
      {activeTab === 'odometer' && (
        <div className="space-y-4">
          <p className="text-medium-text">
            Upload photos of wear indicators to detect potential odometer tampering.
            Claimed mileage: <strong className="text-light-text">{claimedMileage.toLocaleString()} miles</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pedal Photo */}
            <div className="space-y-2">
              <label className="block text-light-text font-semibold">Pedal Wear (Required)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, setPedalPhoto)}
                className="w-full text-light-text"
              />
              {pedalPhoto && (
                <img src={pedalPhoto} alt="Pedals" className="w-full h-32 object-cover rounded border border-dark-border" />
              )}
            </div>

            {/* Steering Photo */}
            <div className="space-y-2">
              <label className="block text-light-text font-semibold">Steering Wheel (Optional)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, setSteeringPhoto)}
                className="w-full text-light-text"
              />
              {steeringPhoto && (
                <img src={steeringPhoto} alt="Steering" className="w-full h-32 object-cover rounded border border-dark-border" />
              )}
            </div>

            {/* Seat Photo */}
            <div className="space-y-2">
              <label className="block text-light-text font-semibold">Driver's Seat (Optional)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, setSeatPhoto)}
                className="w-full text-light-text"
              />
              {seatPhoto && (
                <img src={seatPhoto} alt="Seat" className="w-full h-32 object-cover rounded border border-dark-border" />
              )}
            </div>
          </div>

          <button
            onClick={analyzeOdometerFraud}
            disabled={!pedalPhoto || odometerAnalyzing}
            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {odometerAnalyzing ? 'Analyzing...' : 'Analyze Odometer Fraud'}
          </button>

          {/* Odometer Results */}
          {odometerResult && (
            <div className={`p-4 rounded-lg border-2 ${
              odometerResult.riskLevel === 'HIGH' ? 'bg-red-900/20 border-red-500' :
              odometerResult.riskLevel === 'MODERATE' ? 'bg-yellow-900/20 border-yellow-500' :
              'bg-green-900/20 border-green-500'
            }`}>
              <h3 className="text-xl font-bold text-light-text mb-2">
                {odometerResult.riskLevel === 'HIGH' ? '🚨 HIGH RISK' :
                 odometerResult.riskLevel === 'MODERATE' ? '⚠️ MODERATE RISK' :
                 '✅ LOW RISK'}
              </h3>
              <div className="space-y-2 text-light-text">
                <p><strong>Fraud Probability:</strong> {(odometerResult.fraudProbability * 100).toFixed(0)}%</p>
                <p><strong>Claimed:</strong> {odometerResult.claimedMileage.toLocaleString()} miles</p>
                <p><strong>Estimated:</strong> {odometerResult.estimatedMileage?.toLocaleString() || 'Unknown'} miles</p>
                <p><strong>Discrepancy:</strong> {odometerResult.mileageDiscrepancy > 0 ? '+' : ''}{odometerResult.mileageDiscrepancy.toLocaleString()} miles</p>
                <pre className="text-sm bg-dark-bg p-3 rounded mt-2 whitespace-pre-wrap">{odometerResult.analysis}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flood Damage Tab */}
      {activeTab === 'flood' && (
        <div className="space-y-4">
          <p className="text-medium-text">
            Check physical indicators and upload photos to detect potential flood damage.
          </p>

          {/* Checklist */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-light-text">Physical Indicators</h3>

            <label className="flex items-center gap-2 text-light-text cursor-pointer">
              <input type="checkbox" checked={mustySmell} onChange={(e) => setMustySmell(e.target.checked)} />
              Musty/mold smell in cabin
            </label>

            <label className="flex items-center gap-2 text-light-text cursor-pointer">
              <input type="checkbox" checked={waterStains} onChange={(e) => setWaterStains(e.target.checked)} />
              Water stains visible
            </label>

            <label className="flex items-center gap-2 text-light-text cursor-pointer">
              <input type="checkbox" checked={rustUnusual} onChange={(e) => setRustUnusual(e.target.checked)} />
              Rust in unusual places
            </label>

            <label className="flex items-center gap-2 text-light-text cursor-pointer">
              <input type="checkbox" checked={foggyLights} onChange={(e) => setFoggyLights(e.target.checked)} />
              Foggy headlights/taillights
            </label>

            <label className="flex items-center gap-2 text-light-text cursor-pointer">
              <input type="checkbox" checked={carpetReplaced} onChange={(e) => setCarpetReplaced(e.target.checked)} />
              Carpet recently replaced
            </label>

            <label className="flex items-center gap-2 text-light-text cursor-pointer">
              <input type="checkbox" checked={electricalCorrosion} onChange={(e) => setElectricalCorrosion(e.target.checked)} />
              Electrical corrosion present
            </label>
          </div>

          {/* Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-light-text font-semibold">Carpet/Interior Photo</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, setCarpetPhoto)}
                className="w-full text-light-text"
              />
              {carpetPhoto && (
                <img src={carpetPhoto} alt="Carpet" className="w-full h-32 object-cover rounded border border-dark-border" />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-light-text font-semibold">Engine Bay Photo</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, setEngineBayPhoto)}
                className="w-full text-light-text"
              />
              {engineBayPhoto && (
                <img src={engineBayPhoto} alt="Engine" className="w-full h-32 object-cover rounded border border-dark-border" />
              )}
            </div>
          </div>

          <button
            onClick={analyzeFloodDamage}
            disabled={floodAnalyzing}
            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {floodAnalyzing ? 'Analyzing...' : 'Analyze Flood Damage'}
          </button>

          {/* Flood Results */}
          {floodResult && (
            <div className={`p-4 rounded-lg border-2 ${
              floodResult.riskLevel === 'HIGH' ? 'bg-red-900/20 border-red-500' :
              floodResult.riskLevel === 'MODERATE' ? 'bg-yellow-900/20 border-yellow-500' :
              'bg-green-900/20 border-green-500'
            }`}>
              <h3 className="text-xl font-bold text-light-text mb-2">
                {floodResult.riskLevel === 'HIGH' ? '🚨 HIGH RISK' :
                 floodResult.riskLevel === 'MODERATE' ? '⚠️ MODERATE RISK' :
                 '✅ LOW RISK'}
              </h3>
              <div className="space-y-2 text-light-text">
                <p><strong>Flood Probability:</strong> {(floodResult.floodProbability * 100).toFixed(0)}%</p>
                <p><strong>Indicators Found:</strong> {floodResult.indicators.length}</p>
                {floodResult.indicators.length > 0 && (
                  <ul className="list-disc list-inside">
                    {floodResult.indicators.map((ind: string, i: number) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                )}
                <pre className="text-sm bg-dark-bg p-3 rounded mt-2 whitespace-pre-wrap">{floodResult.analysis}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
