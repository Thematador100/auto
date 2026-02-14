import React, { useState } from 'react';

interface FraudDetectionProps {
  claimedMileage: number;
  vin: string;
  vehicleType?: string;
  onOdometerAnalysis?: (result: any) => void;
  onFloodAnalysis?: (result: any) => void;
  onDamageAnalysis?: (result: any) => void;
}

export const FraudDetection: React.FC<FraudDetectionProps> = ({
  claimedMileage,
  vin,
  vehicleType,
  onOdometerAnalysis,
  onFloodAnalysis,
  onDamageAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'odometer' | 'flood' | 'damage'>('odometer');

  // Odometer fraud state
  const [pedalPhoto, setPedalPhoto] = useState<string | null>(null);
  const [steeringPhoto, setSteeringPhoto] = useState<string | null>(null);
  const [seatPhoto, setSeatPhoto] = useState<string | null>(null);
  const [odometerAnalyzing, setOdometerAnalyzing] = useState(false);
  const [odometerResult, setOdometerResult] = useState<any>(null);

  // Body damage state
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  const [damageAnalyzing, setDamageAnalyzing] = useState(false);
  const [damageResult, setDamageResult] = useState<any>(null);

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
        onOdometerAnalysis?.(result);
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
        onFloodAnalysis?.(result);
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

  const handleDamagePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDamagePhotos(prev => [...prev.slice(0, 7), reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removeDamagePhoto = (index: number) => {
    setDamagePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeDamage = async () => {
    if (damagePhotos.length === 0) {
      alert('Please upload at least one exterior photo');
      return;
    }
    setDamageAnalyzing(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://auto-production-8579.up.railway.app';
    try {
      const response = await fetch(`${BACKEND_URL}/api/fraud/analyze-damage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          photos: damagePhotos.map(p => ({ base64: p.replace(/^data:[^;]+;base64,/, '') })),
          vehicleType: vehicleType || 'Standard',
          vin,
        })
      });
      if (response.ok) {
        const result = await response.json();
        setDamageResult(result);
        onDamageAnalysis?.(result);
      } else {
        const error = await response.json();
        alert(`Analysis failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Damage analysis error:', error);
      alert('Failed to analyze body damage');
    } finally {
      setDamageAnalyzing(false);
    }
  };

  return (
    <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
      <h2 className="text-2xl font-bold text-light-text mb-4">Fraud & Damage Detection</h2>

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
        <button
          onClick={() => setActiveTab('damage')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'damage'
              ? 'text-primary border-b-2 border-primary'
              : 'text-medium-text hover:text-light-text'
          }`}
        >
          Body Damage AI
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

      {/* Body Damage AI Tab */}
      {activeTab === 'damage' && (
        <div className="space-y-4">
          <p className="text-medium-text">
            Upload exterior photos from all angles. Our AI uses rental-car-grade scanning technology
            to detect dents, paint mismatches, panel gap issues, hidden repairs, and accident evidence.
          </p>

          <div className="bg-dark-bg border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-blue-400 mb-2">Photo Guide</h3>
            <p className="text-xs text-medium-text">
              For best results, take photos of: front, rear, both sides, all 4 corners (3/4 views),
              close-ups of any suspicious areas. Up to 8 photos will be analyzed.
            </p>
          </div>

          <div>
            <label className="block text-light-text font-semibold mb-2">
              Exterior Photos ({damagePhotos.length}/8)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleDamagePhotoCapture}
              disabled={damagePhotos.length >= 8}
              className="w-full text-light-text mb-3"
            />
            {damagePhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {damagePhotos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img src={photo} alt={`Exterior ${i + 1}`} className="w-full h-24 object-cover rounded border border-dark-border" />
                    <button
                      onClick={() => removeDamagePhoto(i)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 m-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={analyzeDamage}
            disabled={damagePhotos.length === 0 || damageAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {damageAnalyzing ? 'AI Scanning for Damage...' : `Scan ${damagePhotos.length} Photo${damagePhotos.length !== 1 ? 's' : ''} for Damage`}
          </button>

          {/* Damage Results */}
          {damageResult && (
            <div className={`p-4 rounded-lg border-2 ${
              damageResult.overallSeverity === 'Severe' ? 'bg-red-900/20 border-red-500' :
              damageResult.overallSeverity === 'Moderate' ? 'bg-yellow-900/20 border-yellow-500' :
              damageResult.overallSeverity === 'Minor' ? 'bg-orange-900/20 border-orange-500' :
              'bg-green-900/20 border-green-500'
            }`}>
              <h3 className="text-xl font-bold text-light-text mb-3">
                {damageResult.overallSeverity === 'Severe' ? 'Severe Damage Detected' :
                 damageResult.overallSeverity === 'Moderate' ? 'Moderate Damage Detected' :
                 damageResult.overallSeverity === 'Minor' ? 'Minor Damage Detected' :
                 'No Significant Damage'}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-dark-bg rounded p-2 text-center">
                  <p className="text-xs text-medium-text">Severity</p>
                  <p className="font-bold text-light-text">{damageResult.overallSeverity}</p>
                </div>
                <div className="bg-dark-bg rounded p-2 text-center">
                  <p className="text-xs text-medium-text">Accident</p>
                  <p className={`font-bold ${damageResult.accidentLikelihood === 'Likely' ? 'text-red-400' : damageResult.accidentLikelihood === 'Possible' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {damageResult.accidentLikelihood}
                  </p>
                </div>
                <div className="bg-dark-bg rounded p-2 text-center">
                  <p className="text-xs text-medium-text">Repaint</p>
                  <p className={`font-bold ${damageResult.repaintDetected ? 'text-yellow-400' : 'text-green-400'}`}>
                    {damageResult.repaintDetected ? 'Detected' : 'Not Detected'}
                  </p>
                </div>
                <div className="bg-dark-bg rounded p-2 text-center">
                  <p className="text-xs text-medium-text">Panel Gaps</p>
                  <p className={`font-bold ${damageResult.panelGapIssues ? 'text-yellow-400' : 'text-green-400'}`}>
                    {damageResult.panelGapIssues ? 'Issues Found' : 'Normal'}
                  </p>
                </div>
              </div>

              {damageResult.findings && damageResult.findings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-light-text">Findings ({damageResult.findings.length})</h4>
                  {damageResult.findings.map((f: any, i: number) => (
                    <div key={i} className="bg-dark-bg rounded p-3 flex items-start gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                        f.severity === 'Severe' ? 'bg-red-600 text-white' :
                        f.severity === 'Moderate' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>{f.severity}</span>
                      <div>
                        <p className="text-sm font-semibold text-light-text">{f.area}</p>
                        <p className="text-xs text-medium-text">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {damageResult.findings && damageResult.findings.length === 0 && (
                <p className="text-green-400 font-semibold">No body damage or accident evidence detected in the analyzed photos.</p>
              )}

              <p className="text-xs text-medium-text mt-3">{damageResult.photosAnalyzed} photo(s) analyzed</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
