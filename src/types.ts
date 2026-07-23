export interface CitySearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code?: string;
  admin1?: string; // State / Region
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
  relative_humidity?: number; // Fetched from hourly closest to current time
  precipitation?: number; // Fetched from daily or hourly
}

export interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  windspeed_10m_max: number[];
}

export interface WeatherData {
  city: CitySearchResult;
  current: CurrentWeather;
  daily: DailyForecast;
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
  };
}

export interface SmartRecommendation {
  id: string;
  category: 'clothing' | 'activity' | 'health' | 'alert';
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}
