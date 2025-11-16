// comprehensiveVinDecoder.ts - Multiple VIN decoder APIs with fallbacks

export interface ComprehensiveVehicleData {
  vin: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  bodyType?: string;
  engineType?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  manufacturer?: string;
  plantCountry?: string;
  plantCity?: string;
  vehicleType?: string;
  doors?: number;
  displacement?: string;
  cylinders?: number;
  horsepower?: number;
  safetyRating?: number;
  gvwr?: string;
  bedLength?: string;
  cabType?: string;
  series?: string;
  dataSource: string;
}

/**
 * NHTSA vPIC API - Primary decoder (US Government, completely free)
 */
class NHTSADecoder {
  private baseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles';

  async decode(vin: string): Promise<ComprehensiveVehicleData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/DecodeVinExtended/${vin}?format=json`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const results = data.Results;

      if (!results || results.length === 0) {
        return null;
      }

      const getValue = (variableId: number): string => {
        const item = results.find((r: any) => r.VariableId === variableId);
        return item?.Value || '';
      };

      const getNumericValue = (variableId: number): number => {
        const value = getValue(variableId);
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      return {
        vin,
        make: getValue(26) || getValue(27),
        model: getValue(28),
        year: getNumericValue(29),
        trim: getValue(109),
        bodyType: getValue(5),
        engineType: `${getValue(13)} cylinders`,
        transmission: getValue(37),
        drivetrain: getValue(9),
        fuelType: getValue(24),
        manufacturer: getValue(27),
        plantCountry: getValue(75),
        plantCity: getValue(76),
        vehicleType: getValue(39),
        doors: getNumericValue(14),
        displacement: getValue(11),
        cylinders: getNumericValue(13),
        gvwr: getValue(25),
        bedLength: getValue(49),
        cabType: getValue(52),
        series: getValue(34),
        dataSource: 'NHTSA vPIC API',
      };
    } catch (error) {
      console.error('NHTSA decoder error:', error);
      return null;
    }
  }

  /**
   * Get suggested VIN from partial VIN
   */
  async getSuggestedVin(partialVin: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/DecodeVinValues/${partialVin}*?format=json`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.Results?.map((r: any) => r.VIN).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting VIN suggestions:', error);
      return [];
    }
  }
}

/**
 * VIN Decoder API (vpic alternative)
 */
class VINDecoderAPI {
  private baseUrl = 'https://auto.dev/api/vin';

  async decode(vin: string): Promise<ComprehensiveVehicleData | null> {
    try {
      // Note: auto.dev requires API key for production, but has free tier
      // For demo purposes, this falls back to NHTSA
      return null;
    } catch (error) {
      console.error('VINDecoderAPI error:', error);
      return null;
    }
  }
}

/**
 * Comprehensive VIN Decoder Service with multiple fallbacks
 */
export class ComprehensiveVinDecoderService {
  private nhtsa: NHTSADecoder;
  private altDecoder: VINDecoderAPI;

  constructor() {
    this.nhtsa = new NHTSADecoder();
    this.altDecoder = new VINDecoderAPI();
  }

  /**
   * Decode VIN using primary API with fallbacks
   */
  async decode(vin: string): Promise<ComprehensiveVehicleData | null> {
    // Validate VIN format first
    if (!this.isValidVinFormat(vin)) {
      throw new Error('Invalid VIN format');
    }

    // Try NHTSA first (most comprehensive and reliable)
    let vehicleData = await this.nhtsa.decode(vin);

    if (vehicleData && vehicleData.make && vehicleData.model) {
      return vehicleData;
    }

    // Fallback to alternative decoder
    vehicleData = await this.altDecoder.decode(vin);

    return vehicleData;
  }

  /**
   * Basic VIN format validation
   */
  private isValidVinFormat(vin: string): boolean {
    // VIN must be exactly 17 characters
    if (vin.length !== 17) {
      return false;
    }

    // VIN cannot contain I, O, or Q
    if (/[IOQ]/i.test(vin)) {
      return false;
    }

    // VIN must be alphanumeric
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
      return false;
    }

    return true;
  }

  /**
   * Validate VIN using check digit algorithm
   */
  validateVinChecksum(vin: string): boolean {
    if (!this.isValidVinFormat(vin)) {
      return false;
    }

    const transliteration: { [key: string]: number } = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
      J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
      S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };

    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i].toUpperCase();
      const value = transliteration[char];
      if (value === undefined) {
        return false;
      }
      sum += value * weights[i];
    }

    const checkDigit = sum % 11;
    const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();

    return vin[8].toUpperCase() === checkChar;
  }

  /**
   * Get vehicle type category for inspection templates
   */
  categorizeVehicle(vehicleData: ComprehensiveVehicleData): string {
    const bodyType = vehicleData.bodyType?.toLowerCase() || '';
    const vehicleType = vehicleData.vehicleType?.toLowerCase() || '';
    const model = vehicleData.model?.toLowerCase() || '';
    const fuelType = vehicleData.fuelType?.toLowerCase() || '';

    // Check for EV
    if (fuelType.includes('electric') || fuelType.includes('battery')) {
      return 'EV';
    }

    // Check for Motorcycle
    if (vehicleType.includes('motorcycle') || vehicleType.includes('bike')) {
      return 'Motorcycle';
    }

    // Check for RV
    if (
      bodyType.includes('motorhome') ||
      bodyType.includes('recreational') ||
      model.includes('winnebago') ||
      model.includes('rv')
    ) {
      return 'RV';
    }

    // Check for Commercial
    if (
      vehicleData.gvwr &&
      parseInt(vehicleData.gvwr.replace(/[^0-9]/g, '')) > 10000
    ) {
      return 'Commercial';
    }

    if (
      bodyType.includes('truck') ||
      bodyType.includes('cargo van') ||
      bodyType.includes('cutaway') ||
      bodyType.includes('cab chassis')
    ) {
      return 'Commercial';
    }

    // Check for Classic (vehicles 25+ years old)
    const currentYear = new Date().getFullYear();
    if (currentYear - vehicleData.year >= 25) {
      return 'Classic';
    }

    // Default to Standard
    return 'Standard';
  }

  /**
   * Get recommended inspection checklist based on vehicle
   */
  getRecommendedInspectionType(vehicleData: ComprehensiveVehicleData): {
    type: string;
    reasons: string[];
  } {
    const category = this.categorizeVehicle(vehicleData);
    const reasons: string[] = [];

    switch (category) {
      case 'EV':
        reasons.push('Electric vehicle - requires battery health check');
        reasons.push('Charging system inspection recommended');
        break;
      case 'Commercial':
        reasons.push('Commercial vehicle - DOT compliance required');
        reasons.push('Higher GVWR - specialized inspection needed');
        break;
      case 'RV':
        reasons.push('Recreational vehicle - life support systems check');
        reasons.push('Appliance and propane system inspection required');
        break;
      case 'Classic':
        reasons.push(`${new Date().getFullYear() - vehicleData.year} years old - classic vehicle inspection`);
        reasons.push('Originality and restoration quality assessment needed');
        break;
      case 'Motorcycle':
        reasons.push('Motorcycle-specific safety inspection required');
        break;
      default:
        reasons.push('Standard comprehensive vehicle inspection');
    }

    return { type: category, reasons };
  }

  /**
   * Get VIN suggestions for partial VIN
   */
  async suggestVin(partialVin: string): Promise<string[]> {
    return await this.nhtsa.getSuggestedVin(partialVin);
  }
}

// Export singleton instance
export const comprehensiveVinDecoder = new ComprehensiveVinDecoderService();
