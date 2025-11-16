// This service is responsible for fetching structured vehicle data from a dedicated API.
// Using a specialized API is more reliable for VIN decoding than a general LLM.

import { VehicleData } from '../types';

// Live implementation using the free NHTSA vPIC API.
export const getVehicleDataByVIN = async (vin: string): Promise<VehicleData> => {
  console.log(`[VehicleDataService] Decoding VIN via NHTSA API: ${vin}`);
  
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    if (!response.ok) {
      throw new Error(`NHTSA API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const results = data.Results;
    
    const getValue = (variable: string): string | null => {
        const item = results.find((i: { Variable: string; Value: string | null; }) => i.Variable === variable);
        return item ? item.Value : null;
    }

    const make = getValue('Make');
    const model = getValue('Model');
    const year = getValue('Model Year');

    if (!make || !model || !year) {
      console.error("NHTSA API response missing key fields:", results);
      throw new Error('VIN decoded, but essential data (Make, Model, Year) was not found.');
    }

    return { make, model, year };

  } catch (error) {
    console.error('[VehicleDataService] Error fetching from NHTSA API:', error);
    // Provide a user-friendly error message.
    throw new Error('Could not decode VIN. The service may be unavailable or the VIN is invalid.');
  }
};
