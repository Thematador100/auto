// services/vehicleExtraDataService.ts
import { SafetyRecall, TheftRecord } from '../types';

/**
 * Fetches open safety recalls for a given VIN from the NHTSA API.
 */
export const getSafetyRecalls = async (vin: string): Promise<SafetyRecall[]> => {
    console.log(`[VehicleExtraDataService] Fetching recalls for VIN: ${vin}`);
    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?vin=${vin}`);
        if (!response.ok) {
            throw new Error(`NHTSA Recalls API responded with status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results.map((recall: any) => ({
                component: recall.Component,
                summary: recall.Summary,
                consequence: recall.Conequence, // Typo is in the API
                remedy: recall.Remedy,
            }));
        }
        return [];
    } catch (error) {
        console.error('[VehicleExtraDataService] Error fetching recalls:', error);
        // Return empty array on failure so it doesn't block the report.
        return [];
    }
};

/**
 * Checks for theft and salvage records via NICB VINCheck or similar service.
 * NOTE: This requires integration with a theft/salvage database API.
 * @param vin The Vehicle Identification Number.
 * @returns A promise that resolves to a TheftRecord or null if not available.
 */
export const getTheftAndSalvageRecord = async (vin: string): Promise<TheftRecord | null> => {
    console.log(`[VehicleExtraDataService] Checking theft/salvage for VIN: ${vin}`);

    // TODO: Integrate with actual theft/salvage API (NICB VINCheck, etc.)
    // Example integration:
    // const response = await fetch(`https://api.nicb.org/vincheck/${vin}`, {
    //   headers: { 'Authorization': `Bearer ${API_KEY}` }
    // });
    // return await response.json();

    console.warn('[VehicleExtraDataService] Theft/salvage API not configured. Returning null.');
    return null;
};
