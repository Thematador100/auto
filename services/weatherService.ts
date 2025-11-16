// weatherService.ts - Free weather APIs for inspection scheduling

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  isGoodForInspection: boolean;
  warnings: string[];
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  precipitation: number;
  isGoodForInspection: boolean;
}

/**
 * OpenWeatherMap API (Free tier: 1000 calls/day)
 * Note: Requires API key from https://openweathermap.org/api
 */
export class OpenWeatherMapService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(apiKey: string = '') {
    this.apiKey = apiKey || 'DEMO_KEY'; // In production, use environment variable
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
      );

      if (!response.ok) {
        console.error('OpenWeatherMap API error:', response.status);
        return null;
      }

      const data = await response.json();

      return this.parseWeatherData(data);
    } catch (error) {
      console.error('Error fetching OpenWeatherMap data:', error);
      return null;
    }
  }

  async get5DayForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
      );

      if (!response.ok) {
        console.error('OpenWeatherMap forecast API error:', response.status);
        return [];
      }

      const data = await response.json();
      return this.parseForecastData(data);
    } catch (error) {
      console.error('Error fetching OpenWeatherMap forecast:', error);
      return [];
    }
  }

  private parseWeatherData(data: any): WeatherData {
    const temp = data.main.temp;
    const condition = data.weather[0].main;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const precipitation = data.rain?.['1h'] || data.snow?.['1h'] || 0;

    const warnings: string[] = [];
    let isGoodForInspection = true;

    // Determine if weather is suitable for vehicle inspection
    if (temp < 32) {
      warnings.push('Temperature below freezing - may affect inspection accuracy');
      isGoodForInspection = false;
    }
    if (temp > 95) {
      warnings.push('Extreme heat - inspector comfort may be affected');
    }
    if (precipitation > 0.1) {
      warnings.push('Rain/snow expected - may delay outdoor inspection');
      isGoodForInspection = false;
    }
    if (windSpeed > 25) {
      warnings.push('High winds - may affect safety');
      isGoodForInspection = false;
    }
    if (condition === 'Thunderstorm' || condition === 'Tornado') {
      warnings.push('Severe weather - reschedule recommended');
      isGoodForInspection = false;
    }

    return {
      temperature: temp,
      condition,
      description,
      humidity,
      windSpeed,
      precipitation,
      isGoodForInspection,
      warnings,
    };
  }

  private parseForecastData(data: any): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const dailyData: { [date: string]: any[] } = {};

    // Group forecasts by date
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Process each day
    Object.entries(dailyData).forEach(([date, items]) => {
      const temps = items.map(item => item.main.temp);
      const precipitation = items.reduce((sum, item) =>
        sum + (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0), 0
      );
      const condition = items[0].weather[0].main;

      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const isGoodForInspection =
        avgTemp > 32 &&
        avgTemp < 95 &&
        precipitation < 0.2 &&
        condition !== 'Thunderstorm';

      forecasts.push({
        date,
        temperature: {
          min: Math.min(...temps),
          max: Math.max(...temps),
        },
        condition,
        precipitation,
        isGoodForInspection,
      });
    });

    return forecasts.slice(0, 5);
  }
}

/**
 * Open-Meteo API (Completely free, no API key required!)
 * Documentation: https://open-meteo.com/
 */
export class OpenMeteoService {
  private baseUrl = 'https://api.open-meteo.com/v1';

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
      );

      if (!response.ok) {
        console.error('Open-Meteo API error:', response.status);
        return null;
      }

      const data = await response.json();
      return this.parseCurrentWeather(data);
    } catch (error) {
      console.error('Error fetching Open-Meteo data:', error);
      return null;
    }
  }

  async get7DayForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`
      );

      if (!response.ok) {
        console.error('Open-Meteo forecast API error:', response.status);
        return [];
      }

      const data = await response.json();
      return this.parseForecastData(data);
    } catch (error) {
      console.error('Error fetching Open-Meteo forecast:', error);
      return [];
    }
  }

  private parseCurrentWeather(data: any): WeatherData {
    const current = data.current;
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const windSpeed = current.wind_speed_10m;
    const precipitation = current.precipitation;
    const weatherCode = current.weather_code;

    const { condition, description } = this.getWeatherDescription(weatherCode);

    const warnings: string[] = [];
    let isGoodForInspection = true;

    if (temp < 32) {
      warnings.push('Temperature below freezing - may affect inspection accuracy');
      isGoodForInspection = false;
    }
    if (temp > 95) {
      warnings.push('Extreme heat - inspector comfort may be affected');
    }
    if (precipitation > 0.04) {
      warnings.push('Rain/snow expected - may delay outdoor inspection');
      isGoodForInspection = false;
    }
    if (windSpeed > 25) {
      warnings.push('High winds - may affect safety');
      isGoodForInspection = false;
    }
    if (weatherCode >= 95) {
      warnings.push('Severe weather - reschedule recommended');
      isGoodForInspection = false;
    }

    return {
      temperature: temp,
      condition,
      description,
      humidity,
      windSpeed,
      precipitation,
      isGoodForInspection,
      warnings,
    };
  }

  private parseForecastData(data: any): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const daily = data.daily;

    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const weatherCode = daily.weather_code[i];
      const { condition } = this.getWeatherDescription(weatherCode);
      const precipitation = daily.precipitation_sum[i];
      const minTemp = daily.temperature_2m_min[i];
      const maxTemp = daily.temperature_2m_max[i];
      const avgTemp = (minTemp + maxTemp) / 2;

      const isGoodForInspection =
        avgTemp > 32 &&
        avgTemp < 95 &&
        precipitation < 0.1 &&
        weatherCode < 80;

      forecasts.push({
        date: daily.time[i],
        temperature: {
          min: minTemp,
          max: maxTemp,
        },
        condition,
        precipitation,
        isGoodForInspection,
      });
    }

    return forecasts;
  }

  private getWeatherDescription(code: number): { condition: string; description: string } {
    // WMO Weather interpretation codes
    const weatherCodes: { [key: number]: { condition: string; description: string } } = {
      0: { condition: 'Clear', description: 'Clear sky' },
      1: { condition: 'Mainly Clear', description: 'Mainly clear' },
      2: { condition: 'Partly Cloudy', description: 'Partly cloudy' },
      3: { condition: 'Overcast', description: 'Overcast' },
      45: { condition: 'Fog', description: 'Foggy' },
      48: { condition: 'Fog', description: 'Depositing rime fog' },
      51: { condition: 'Drizzle', description: 'Light drizzle' },
      53: { condition: 'Drizzle', description: 'Moderate drizzle' },
      55: { condition: 'Drizzle', description: 'Dense drizzle' },
      61: { condition: 'Rain', description: 'Slight rain' },
      63: { condition: 'Rain', description: 'Moderate rain' },
      65: { condition: 'Rain', description: 'Heavy rain' },
      71: { condition: 'Snow', description: 'Slight snow fall' },
      73: { condition: 'Snow', description: 'Moderate snow fall' },
      75: { condition: 'Snow', description: 'Heavy snow fall' },
      77: { condition: 'Snow', description: 'Snow grains' },
      80: { condition: 'Rain Showers', description: 'Slight rain showers' },
      81: { condition: 'Rain Showers', description: 'Moderate rain showers' },
      82: { condition: 'Rain Showers', description: 'Violent rain showers' },
      85: { condition: 'Snow Showers', description: 'Slight snow showers' },
      86: { condition: 'Snow Showers', description: 'Heavy snow showers' },
      95: { condition: 'Thunderstorm', description: 'Thunderstorm' },
      96: { condition: 'Thunderstorm', description: 'Thunderstorm with slight hail' },
      99: { condition: 'Thunderstorm', description: 'Thunderstorm with heavy hail' },
    };

    return weatherCodes[code] || { condition: 'Unknown', description: 'Unknown weather' };
  }
}

/**
 * Main weather service that uses Open-Meteo as primary (free, no key)
 * Falls back to OpenWeatherMap if needed
 */
export class WeatherService {
  private openMeteo: OpenMeteoService;
  private openWeather: OpenWeatherMapService;

  constructor(openWeatherApiKey?: string) {
    this.openMeteo = new OpenMeteoService();
    this.openWeather = new OpenWeatherMapService(openWeatherApiKey);
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
    // Try Open-Meteo first (free, no key required)
    let weather = await this.openMeteo.getCurrentWeather(lat, lon);

    // Fallback to OpenWeatherMap if Open-Meteo fails
    if (!weather) {
      console.log('Falling back to OpenWeatherMap...');
      weather = await this.openWeather.getCurrentWeather(lat, lon);
    }

    return weather;
  }

  async getForecast(lat: number, lon: number, days: number = 5): Promise<WeatherForecast[]> {
    // Try Open-Meteo first (supports up to 7 days)
    let forecast = await this.openMeteo.get7DayForecast(lat, lon);

    // Fallback to OpenWeatherMap if Open-Meteo fails
    if (!forecast || forecast.length === 0) {
      console.log('Falling back to OpenWeatherMap for forecast...');
      forecast = await this.openWeather.get5DayForecast(lat, lon);
    }

    return forecast.slice(0, days);
  }

  /**
   * Get coordinates from location name using Open-Meteo's geocoding API (free!)
   */
  async getCoordinates(location: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return {
          lat: data.results[0].latitude,
          lon: data.results[0].longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  }

  /**
   * Get weather forecast for a location by name
   */
  async getWeatherByLocation(location: string): Promise<{
    current: WeatherData | null;
    forecast: WeatherForecast[];
  }> {
    const coords = await this.getCoordinates(location);

    if (!coords) {
      return { current: null, forecast: [] };
    }

    const [current, forecast] = await Promise.all([
      this.getCurrentWeather(coords.lat, coords.lon),
      this.getForecast(coords.lat, coords.lon),
    ]);

    return { current, forecast };
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
