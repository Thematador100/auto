// vehicleValueService.ts - Vehicle market value estimation service

export interface VehicleValue {
  estimatedValue: {
    trade_in: number;
    private_party: number;
    dealer_retail: number;
  };
  confidence: 'high' | 'medium' | 'low';
  dataSource: string;
  factors: string[];
  disclaimer: string;
}

export interface VehicleSpecs {
  make: string;
  model: string;
  year: number;
  trim?: string;
  bodyType?: string;
  engineType?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  mileage?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Vehicle value estimation service
 * Uses NHTSA data combined with depreciation models
 * Note: For production, integrate with paid APIs like Black Book or NADA
 */
export class VehicleValueService {
  /**
   * Estimate vehicle value based on VIN and condition
   */
  async estimateValue(vin: string, mileage: number, condition: string = 'good'): Promise<VehicleValue | null> {
    try {
      // Get vehicle specs from NHTSA
      const specs = await this.getVehicleSpecs(vin);

      if (!specs) {
        return null;
      }

      // Calculate estimated value using depreciation model
      const value = this.calculateDepreciatedValue(specs, mileage, condition as any);

      return value;
    } catch (error) {
      console.error('Error estimating vehicle value:', error);
      return null;
    }
  }

  /**
   * Get vehicle specifications from NHTSA vPIC API
   */
  private async getVehicleSpecs(vin: string): Promise<VehicleSpecs | null> {
    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const results = data.Results;

      const getValue = (variableId: number): string => {
        const item = results.find((r: any) => r.VariableId === variableId);
        return item?.Value || '';
      };

      return {
        make: getValue(26) || getValue(27), // Make
        model: getValue(28), // Model
        year: parseInt(getValue(29)) || 0, // Model Year
        trim: getValue(109), // Trim
        bodyType: getValue(5), // Body Class
        engineType: getValue(13), // Engine Number of Cylinders
        transmission: getValue(37), // Transmission Style
        drivetrain: getValue(9), // Drive Type
        fuelType: getValue(24), // Fuel Type - Primary
      };
    } catch (error) {
      console.error('Error fetching vehicle specs:', error);
      return null;
    }
  }

  /**
   * Calculate depreciated value using industry-standard depreciation rates
   * Industry average depreciation rates:
   * - Year 1: 20-30% (we use 25%)
   * - Years 2-5: 15% per year
   * - Years 6-10: 10% per year
   * - Years 11+: 5% per year
   */
  private calculateDepreciatedValue(
    specs: VehicleSpecs,
    mileage: number,
    condition: 'excellent' | 'good' | 'fair' | 'poor'
  ): VehicleValue {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - specs.year;

    // Base MSRP estimation (rough averages by vehicle type)
    let baseMSRP = this.estimateBaseMSRP(specs);

    // Apply depreciation by year
    let depreciatedValue = baseMSRP;

    for (let year = 0; year < vehicleAge; year++) {
      if (year === 0) {
        depreciatedValue *= 0.75; // 25% first year
      } else if (year <= 4) {
        depreciatedValue *= 0.85; // 15% years 2-5
      } else if (year <= 9) {
        depreciatedValue *= 0.90; // 10% years 6-10
      } else {
        depreciatedValue *= 0.95; // 5% years 11+
      }
    }

    // Adjust for mileage (industry average: 12,000 miles/year)
    const expectedMileage = vehicleAge * 12000;
    const mileageDifference = mileage - expectedMileage;
    const mileageAdjustment = (mileageDifference / 1000) * 10; // $10 per 1000 miles difference
    depreciatedValue -= mileageAdjustment;

    // Adjust for condition
    const conditionMultipliers = {
      excellent: 1.15,
      good: 1.0,
      fair: 0.85,
      poor: 0.65,
    };
    depreciatedValue *= conditionMultipliers[condition];

    // Calculate different value types
    const trade_in = Math.round(depreciatedValue * 0.75); // Dealer pays ~75% of private party
    const private_party = Math.round(depreciatedValue);
    const dealer_retail = Math.round(depreciatedValue * 1.25); // Dealer markup ~25%

    // Ensure minimum values
    const minValue = 500;
    const estimates = {
      trade_in: Math.max(trade_in, minValue),
      private_party: Math.max(private_party, minValue),
      dealer_retail: Math.max(dealer_retail, minValue),
    };

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (vehicleAge <= 5) {
      confidence = 'high';
    } else if (vehicleAge > 15) {
      confidence = 'low';
    }

    const factors = [
      `Vehicle age: ${vehicleAge} years`,
      `Mileage: ${mileage.toLocaleString()} miles (${mileageDifference > 0 ? 'above' : 'below'} average)`,
      `Condition: ${condition}`,
      `Make/Model: ${specs.make} ${specs.model}`,
    ];

    return {
      estimatedValue: estimates,
      confidence,
      dataSource: 'Depreciation Model + NHTSA Data',
      factors,
      disclaimer: 'This is an estimated value based on industry-standard depreciation models. Actual market value may vary based on location, options, trim level, and current market conditions. For accurate valuations, consult Kelley Blue Book, NADA, or Black Book.',
    };
  }

  /**
   * Estimate base MSRP based on vehicle specs
   * These are rough averages and should be replaced with actual data in production
   */
  private estimateBaseMSRP(specs: VehicleSpecs): number {
    const make = specs.make.toLowerCase();
    const bodyType = specs.bodyType?.toLowerCase() || '';
    const year = specs.year;

    // Base prices by vehicle type (2020 averages, adjusted for year)
    let basePrice = 30000; // Default sedan/compact

    // Adjust by body type
    if (bodyType.includes('truck') || bodyType.includes('pickup')) {
      basePrice = 45000;
    } else if (bodyType.includes('suv') || bodyType.includes('sport utility')) {
      basePrice = 40000;
    } else if (bodyType.includes('van') || bodyType.includes('minivan')) {
      basePrice = 35000;
    } else if (bodyType.includes('coupe')) {
      basePrice = 35000;
    } else if (bodyType.includes('wagon')) {
      basePrice = 32000;
    } else if (bodyType.includes('hatch')) {
      basePrice = 25000;
    } else if (bodyType.includes('sedan')) {
      basePrice = 30000;
    }

    // Adjust by luxury brands
    const luxuryBrands = ['bmw', 'mercedes', 'audi', 'lexus', 'porsche', 'tesla', 'cadillac', 'lincoln', 'infiniti', 'acura'];
    if (luxuryBrands.some(brand => make.includes(brand))) {
      basePrice *= 1.8;
    }

    // Adjust by economy brands
    const economyBrands = ['kia', 'hyundai', 'nissan', 'mitsubishi'];
    if (economyBrands.some(brand => make.includes(brand))) {
      basePrice *= 0.85;
    }

    // Adjust for year (prices increase ~3% per year on average)
    const yearDifference = year - 2020;
    basePrice *= Math.pow(1.03, yearDifference);

    // Electric vehicles typically cost more
    if (specs.fuelType?.toLowerCase().includes('electric')) {
      basePrice *= 1.3;
    }

    return Math.round(basePrice);
  }

  /**
   * Get market comparison data (simulated)
   * In production, this would query actual market listings
   */
  async getMarketComparables(specs: VehicleSpecs, radius: number = 50): Promise<{
    averageListingPrice: number;
    numberOfListings: number;
    priceRange: { min: number; max: number };
  } | null> {
    // This is a placeholder - in production, integrate with:
    // - Cars.com API
    // - AutoTrader API
    // - CarGurus API (may have free tier)

    return {
      averageListingPrice: 0,
      numberOfListings: 0,
      priceRange: { min: 0, max: 0 },
    };
  }

  /**
   * Format value estimate for display
   */
  formatValueEstimate(value: VehicleValue): string {
    const formatPrice = (price: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);

    return `
Estimated Vehicle Value (${value.confidence} confidence):
- Trade-In Value: ${formatPrice(value.estimatedValue.trade_in)}
- Private Party Value: ${formatPrice(value.estimatedValue.private_party)}
- Dealer Retail: ${formatPrice(value.estimatedValue.dealer_retail)}

Factors considered:
${value.factors.map(f => `• ${f}`).join('\n')}

Data Source: ${value.dataSource}

${value.disclaimer}
    `.trim();
  }
}

// Export singleton instance
export const vehicleValueService = new VehicleValueService();
