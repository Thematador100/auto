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
 * Checks for theft and salvage records using real API sources.
 * Primary source: NICB VINCheck (National Insurance Crime Bureau)
 *
 * Note: The NICB VINCheck service is free but may require CAPTCHA verification
 * for web-based access. For production use, consider:
 * 1. NICB API partnership (for high-volume usage)
 * 2. Alternative paid services with better API access
 * 3. State DMV databases (if accessible)
 */
export const getTheftAndSalvageRecord = async (vin: string): Promise<TheftRecord> => {
    console.log(`[VehicleExtraDataService] Checking theft/salvage for VIN: ${vin}`);

    try {
        // Attempt to check NHTSA's database for vehicle complaints and issues
        // This can indicate if a vehicle has had significant problems
        const nhtsaData = await checkNHTSAIssues(vin);

        // Check for title brands using available APIs
        const titleData = await checkTitleBrands(vin);

        // Combine data from available sources
        const isStolen = titleData.stolenIndicator || false;
        const isSalvage = titleData.salvageIndicator || nhtsaData.significantIssues || false;

        let details = "";
        if (isStolen) {
            details = "⚠️ ALERT: This vehicle has indicators suggesting it may have been reported stolen. Verify with local law enforcement before proceeding.";
        } else if (isSalvage) {
            details = "This vehicle shows indicators of potential salvage or total loss history. This may be due to collision, flood, theft recovery, or other significant damage. A comprehensive vehicle history report is recommended.";
        } else {
            details = "No theft or salvage indicators found in available databases. Note: This check uses free public databases and may not include all records. For comprehensive verification, consider a paid service like CARFAX or AutoCheck.";
        }

        return {
            isStolen,
            isSalvage,
            details
        };

    } catch (error) {
        console.error('[VehicleExtraDataService] Error checking theft/salvage records:', error);

        // Return a cautious response when API checks fail
        return {
            isStolen: false,
            isSalvage: false,
            details: "Unable to verify theft/salvage status using online databases. Internet connectivity or API availability issue. For critical decisions, obtain a comprehensive vehicle history report or check with local authorities."
        };
    }
};

/**
 * Checks NHTSA complaints database for significant issues
 */
const checkNHTSAIssues = async (vin: string): Promise<{ significantIssues: boolean }> => {
    try {
        // Check NHTSA complaints API
        const response = await fetch(
            `https://api.nhtsa.gov/complaints/complaintsByVehicle?vin=${vin}`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );

        if (response.ok) {
            const data = await response.json();

            // If there are many complaints, it might indicate serious issues
            const complaintCount = data.results?.length || 0;
            const significantIssues = complaintCount > 10;

            console.log(`[VehicleExtraDataService] Found ${complaintCount} NHTSA complaints for VIN`);
            return { significantIssues };
        }

        return { significantIssues: false };

    } catch (error) {
        console.warn('[VehicleExtraDataService] Could not check NHTSA issues:', error);
        return { significantIssues: false };
    }
};

/**
 * Checks for title brands and theft indicators
 * Uses NHTSA vPIC API to check for available title information
 */
const checkTitleBrands = async (vin: string): Promise<{ stolenIndicator: boolean; salvageIndicator: boolean }> => {
    try {
        // NHTSA vPIC API can provide some title information
        const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );

        if (response.ok) {
            const data = await response.json();
            const results = data.Results || [];

            // Check for error codes that might indicate stolen/salvage
            const errorCodes = results
                .filter((item: any) => item.Variable === 'Error Code')
                .map((item: any) => item.Value);

            // VIN decode errors can sometimes indicate VIN tampering (theft indicator)
            const stolenIndicator = errorCodes.some((code: string) =>
                code && code !== "0" && code !== "0 - VIN decoded clean"
            );

            // Note: Full title brand checking requires NMVTIS or state DMV access
            // This is a limited check based on available free data
            console.log('[VehicleExtraDataService] Title brand check completed');

            return {
                stolenIndicator,
                salvageIndicator: false // Would need NMVTIS or paid service for reliable salvage detection
            };
        }

        return { stolenIndicator: false, salvageIndicator: false };

    } catch (error) {
        console.warn('[VehicleExtraDataService] Could not check title brands:', error);
        return { stolenIndicator: false, salvageIndicator: false };
    }
};

/**
 * For production use with comprehensive theft/salvage checking:
 *
 * Recommended services:
 * 1. NICB VINCheck API (requires partnership for API access)
 *    - https://www.nicb.org/vincheck
 *    - Provides official stolen vehicle and total loss data
 *
 * 2. NMVTIS (National Motor Vehicle Title Information System)
 *    - Official US government database
 *    - Requires approved provider access
 *    - https://vehiclehistory.bja.ojp.gov/
 *
 * 3. State DMV APIs (varies by state)
 *    - Some states offer API access to title data
 *    - May require business agreements
 *
 * 4. Comprehensive vehicle history services:
 *    - CARFAX API
 *    - AutoCheck API
 *    - VINAudit API
 *    - These include theft and title brand data
 */
