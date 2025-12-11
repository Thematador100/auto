import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeImage } from '../config/aiProviders.js';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/fraud/analyze-odometer
 * Analyze photos for odometer fraud detection
 * Compares wear patterns against claimed mileage
 */
router.post('/analyze-odometer', authenticateToken, async (req, res) => {
  try {
    const {
      inspectionId,
      claimedMileage,
      pedalPhotoBase64,
      steeringPhotoBase64,
      seatPhotoBase64,
      carfaxLastMileage,
      carfaxLastDate
    } = req.body;

    if (!claimedMileage || !pedalPhotoBase64) {
      return res.status(400).json({ error: 'Claimed mileage and pedal photo are required' });
    }

    console.log(`[Fraud] Analyzing odometer fraud for inspection ${inspectionId}`);

    // Analyze pedal wear
    const pedalAnalysis = await analyzeImage(
      pedalPhotoBase64,
      `Analyze the wear on these vehicle pedals. Rate the wear severity as 'light', 'moderate', 'severe', or 'extreme'.
      Based on the wear pattern, estimate how many miles this vehicle likely has. Consider:
      - Rubber wear depth
      - Surface smoothness
      - Pattern visibility
      - Edge condition

      Provide: 1) Wear severity 2) Estimated mileage range 3) Brief explanation.
      Format: WEAR: [severity] | ESTIMATED_MILES: [range] | REASON: [explanation]`
    );

    // Analyze steering wheel wear if provided
    let steeringAnalysis = null;
    if (steeringPhotoBase64) {
      steeringAnalysis = await analyzeImage(
        steeringPhotoBase64,
        `Analyze steering wheel wear. Rate as 'light', 'moderate', 'severe', or 'extreme'.
        Estimate mileage based on:
        - Leather/material wear
        - Grip area smoothness
        - Discoloration
        - Shine/patina

        Format: WEAR: [severity] | ESTIMATED_MILES: [range] | REASON: [explanation]`
      );
    }

    // Analyze seat wear if provided
    let seatAnalysis = null;
    if (seatPhotoBase64) {
      seatAnalysis = await analyzeImage(
        seatPhotoBase64,
        `Analyze driver's seat wear. Rate as 'light', 'moderate', 'severe', or 'extreme'.
        Estimate mileage based on:
        - Bolster wear
        - Seat cushion compression
        - Material condition
        - Wrinkles/creases

        Format: WEAR: [severity] | ESTIMATED_MILES: [range] | REASON: [explanation]`
      );
    }

    // Parse AI responses
    const parsePedalWear = (text) => {
      const wearMatch = text.match(/WEAR:\s*(\w+)/i);
      const milesMatch = text.match(/ESTIMATED_MILES:\s*([\d,\-k\s]+)/i);
      const reasonMatch = text.match(/REASON:\s*(.+)/i);

      return {
        severity: wearMatch ? wearMatch[1].toLowerCase() : 'unknown',
        estimatedMiles: milesMatch ? milesMatch[1].trim() : 'unknown',
        reason: reasonMatch ? reasonMatch[1].trim() : text
      };
    };

    const pedalData = parsePedalWear(pedalAnalysis);
    const steeringData = steeringAnalysis ? parsePedalWear(steeringAnalysis) : null;
    const seatData = seatAnalysis ? parsePedalWear(seatAnalysis) : null;

    // Calculate estimated mileage (extract number from range)
    const extractMileage = (str) => {
      if (!str || str === 'unknown') return null;
      const match = str.match(/(\d+)/);
      return match ? parseInt(match[1]) * (str.includes('k') ? 1000 : 1) : null;
    };

    const pedalEstimate = extractMileage(pedalData.estimatedMiles);
    const steeringEstimate = steeringData ? extractMileage(steeringData.estimatedMiles) : null;
    const seatEstimate = seatData ? extractMileage(seatData.estimatedMiles) : null;

    // Average estimates
    const estimates = [pedalEstimate, steeringEstimate, seatEstimate].filter(e => e !== null);
    const avgEstimate = estimates.length > 0
      ? Math.round(estimates.reduce((a, b) => a + b, 0) / estimates.length)
      : null;

    // Calculate discrepancy
    const mileageDiscrepancy = avgEstimate ? avgEstimate - claimedMileage : 0;

    // Calculate fraud probability
    let fraudProbability = 0;
    if (mileageDiscrepancy > 100000) fraudProbability = 0.95;
    else if (mileageDiscrepancy > 75000) fraudProbability = 0.85;
    else if (mileageDiscrepancy > 50000) fraudProbability = 0.70;
    else if (mileageDiscrepancy > 30000) fraudProbability = 0.50;
    else if (mileageDiscrepancy > 15000) fraudProbability = 0.30;
    else fraudProbability = 0.10;

    // Check Carfax discrepancy
    if (carfaxLastMileage && claimedMileage < carfaxLastMileage) {
      fraudProbability = Math.max(fraudProbability, 0.95); // Odometer rollback confirmed
    }

    // Compile full analysis
    const fullAnalysis = `
ODOMETER FRAUD ANALYSIS

Claimed Mileage: ${claimedMileage.toLocaleString()} miles
Estimated Mileage: ${avgEstimate ? avgEstimate.toLocaleString() : 'Unknown'} miles
Discrepancy: ${mileageDiscrepancy > 0 ? '+' : ''}${mileageDiscrepancy.toLocaleString()} miles

PEDAL WEAR:
- Severity: ${pedalData.severity}
- ${pedalData.reason}

${steeringData ? `STEERING WHEEL WEAR:
- Severity: ${steeringData.severity}
- ${steeringData.reason}
` : ''}

${seatData ? `SEAT WEAR:
- Severity: ${seatData.severity}
- ${seatData.reason}
` : ''}

${carfaxLastMileage ? `CARFAX DATA:
- Last reported: ${carfaxLastMileage.toLocaleString()} miles on ${carfaxLastDate || 'unknown date'}
- Current claim: ${claimedMileage.toLocaleString()} miles
${claimedMileage < carfaxLastMileage ? '⚠️ WARNING: Odometer shows LESS than previous report (ROLLBACK)' : ''}
` : ''}

FRAUD PROBABILITY: ${(fraudProbability * 100).toFixed(0)}%

${fraudProbability > 0.7 ? '🚨 HIGH RISK: Strong indicators of odometer tampering' :
  fraudProbability > 0.4 ? '⚠️ MODERATE RISK: Some indicators present, further inspection recommended' :
  '✅ LOW RISK: Wear patterns generally consistent with claimed mileage'}
    `.trim();

    // Save to database if inspectionId provided
    if (inspectionId) {
      await query(
        `INSERT INTO odometer_fraud_indicators (
          inspection_id, claimed_mileage, pedal_wear_severity,
          steering_wear_severity, seat_wear_severity,
          carfax_last_mileage, carfax_last_date,
          mileage_discrepancy, fraud_probability, ai_analysis
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          inspectionId,
          claimedMileage,
          pedalData.severity,
          steeringData?.severity || null,
          seatData?.severity || null,
          carfaxLastMileage || null,
          carfaxLastDate || null,
          mileageDiscrepancy,
          fraudProbability,
          fullAnalysis
        ]
      );
    }

    res.json({
      fraudProbability,
      mileageDiscrepancy,
      estimatedMileage: avgEstimate,
      claimedMileage,
      pedalWear: pedalData,
      steeringWear: steeringData,
      seatWear: seatData,
      analysis: fullAnalysis,
      riskLevel: fraudProbability > 0.7 ? 'HIGH' : fraudProbability > 0.4 ? 'MODERATE' : 'LOW'
    });

  } catch (error) {
    console.error('[Fraud] Odometer analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze odometer fraud', details: error.message });
  }
});

/**
 * POST /api/fraud/analyze-flood
 * Analyze for flood damage indicators
 */
router.post('/analyze-flood', authenticateToken, async (req, res) => {
  try {
    const {
      inspectionId,
      vin,
      mustySmell,
      waterStains,
      waterStainLocations,
      rustUnusual,
      foggyLights,
      carpetReplaced,
      electricalCorrosion,
      carpetPhotoBase64,
      engineBayPhotoBase64
    } = req.body;

    console.log(`[Fraud] Analyzing flood damage for VIN ${vin}`);

    let floodProbability = 0;
    const indicators = [];

    // Physical indicators
    if (mustySmell) { floodProbability += 0.25; indicators.push('Musty smell detected'); }
    if (waterStains) { floodProbability += 0.30; indicators.push('Water stains found'); }
    if (rustUnusual) { floodProbability += 0.20; indicators.push('Rust in unusual places'); }
    if (foggyLights) { floodProbability += 0.15; indicators.push('Foggy headlights/taillights'); }
    if (carpetReplaced) { floodProbability += 0.20; indicators.push('Carpet recently replaced'); }
    if (electricalCorrosion) { floodProbability += 0.30; indicators.push('Electrical corrosion present'); }

    // AI photo analysis
    let carpetAnalysis = null;
    if (carpetPhotoBase64) {
      carpetAnalysis = await analyzeImage(
        carpetPhotoBase64,
        `Analyze this vehicle carpet/interior for flood damage signs:
        - Water stains or discoloration
        - Mold or mildew
        - Silt or mud residue
        - New carpet installation
        - Moisture damage

        Respond: FLOOD_SIGNS: [yes/no] | CONFIDENCE: [low/medium/high] | DETAILS: [explanation]`
      );

      if (carpetAnalysis.toLowerCase().includes('flood_signs: yes')) {
        floodProbability += 0.25;
        indicators.push('AI detected flood signs in carpet');
      }
    }

    let engineBayAnalysis = null;
    if (engineBayPhotoBase64) {
      engineBayAnalysis = await analyzeImage(
        engineBayPhotoBase64,
        `Analyze engine bay for flood damage:
        - Water lines or staining
        - Mud/silt in crevices
        - Corrosion on electrical connectors
        - Rust on metal components

        Respond: FLOOD_SIGNS: [yes/no] | CONFIDENCE: [low/medium/high] | DETAILS: [explanation]`
      );

      if (engineBayAnalysis.toLowerCase().includes('flood_signs: yes')) {
        floodProbability += 0.20;
        indicators.push('AI detected flood signs in engine bay');
      }
    }

    // Cap at 1.0
    floodProbability = Math.min(floodProbability, 1.0);

    // TODO: Check NICB flood database (requires API key)
    const nicbFloodRecord = false;

    const fullAnalysis = `
FLOOD DAMAGE ANALYSIS

VIN: ${vin}

PHYSICAL INDICATORS (${indicators.length}):
${indicators.map(i => `- ${i}`).join('\n') || '- None detected'}

${carpetAnalysis ? `CARPET/INTERIOR ANALYSIS:
${carpetAnalysis}
` : ''}

${engineBayAnalysis ? `ENGINE BAY ANALYSIS:
${engineBayAnalysis}
` : ''}

FLOOD PROBABILITY: ${(floodProbability * 100).toFixed(0)}%

${floodProbability > 0.6 ? '🚨 HIGH RISK: Multiple flood damage indicators present' :
  floodProbability > 0.3 ? '⚠️ MODERATE RISK: Some flood damage signs detected' :
  '✅ LOW RISK: No significant flood damage indicators'}

${waterStainLocations && waterStainLocations.length > 0 ? `
Water Stain Locations:
${waterStainLocations.map(l => `- ${l}`).join('\n')}
` : ''}
    `.trim();

    // Save to database
    if (inspectionId) {
      await query(
        `INSERT INTO flood_damage_indicators (
          inspection_id, musty_smell_detected, water_stains_found,
          water_stain_locations, rust_in_unusual_places, foggy_lights,
          carpet_replaced, electrical_corrosion, nicb_flood_record,
          flood_probability, ai_analysis
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          inspectionId,
          mustySmell || false,
          waterStains || false,
          waterStainLocations || [],
          rustUnusual || false,
          foggyLights || false,
          carpetReplaced || false,
          electricalCorrosion || false,
          nicbFloodRecord,
          floodProbability,
          fullAnalysis
        ]
      );
    }

    res.json({
      floodProbability,
      indicators,
      nicbFloodRecord,
      carpetAnalysis,
      engineBayAnalysis,
      analysis: fullAnalysis,
      riskLevel: floodProbability > 0.6 ? 'HIGH' : floodProbability > 0.3 ? 'MODERATE' : 'LOW'
    });

  } catch (error) {
    console.error('[Fraud] Flood analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze flood damage', details: error.message });
  }
});

/**
 * GET /api/fraud/inspection/:inspectionId
 * Get all fraud indicators for an inspection
 */
router.get('/inspection/:inspectionId', authenticateToken, async (req, res) => {
  try {
    const { inspectionId } = req.params;

    // Verify user owns this inspection
    const inspectionCheck = await query(
      'SELECT id, user_id FROM inspections WHERE id = $1',
      [inspectionId]
    );

    if (inspectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    if (inspectionCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all fraud indicators
    const odometer = await query(
      'SELECT * FROM odometer_fraud_indicators WHERE inspection_id = $1',
      [inspectionId]
    );

    const flood = await query(
      'SELECT * FROM flood_damage_indicators WHERE inspection_id = $1',
      [inspectionId]
    );

    const accident = await query(
      'SELECT * FROM accident_concealment_indicators WHERE inspection_id = $1',
      [inspectionId]
    );

    res.json({
      odometerFraud: odometer.rows[0] || null,
      floodDamage: flood.rows[0] || null,
      accidentConcealment: accident.rows[0] || null
    });

  } catch (error) {
    console.error('[Fraud] Get indicators error:', error);
    res.status(500).json({ error: 'Failed to retrieve fraud indicators' });
  }
});

export default router;
