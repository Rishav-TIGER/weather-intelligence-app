/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  MapPin, 
  RefreshCw, 
  Compass, 
  AlertTriangle, 
  Sun,
  Loader2,
  HelpCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CitySearchResult, WeatherData, SmartRecommendation } from './types';
import SearchBar from './components/SearchBar';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastSection from './components/ForecastSection';
import TemperatureChart from './components/TemperatureChart';
import RecommendationsPanel from './components/RecommendationsPanel';
import { generateRecommendations } from './utils/recommendations';

const DEFAULT_CITIES: CitySearchResult[] = [
  { id: 5128581, name: 'New York', latitude: 40.71427, longitude: -74.00597, country: 'United States', country_code: 'US', admin1: 'New York', timezone: 'America/New_York' },
  { id: 2643743, name: 'London', latitude: 51.50853, longitude: -0.12574, country: 'United Kingdom', country_code: 'GB', admin1: 'England', timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.69171, country: 'Japan', country_code: 'JP', admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 2988507, name: 'Paris', latitude: 48.85341, longitude: 2.3488, country: 'France', country_code: 'FR', admin1: 'Île-de-France', timezone: 'Europe/Paris' },
  { id: 2147714, name: 'Sydney', latitude: -33.86785, longitude: 151.20732, country: 'Australia', country_code: 'AU', admin1: 'New South Wales', timezone: 'Australia/Sydney' },
];

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CitySearchResult>(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data for the selected city
  const fetchWeatherData = async (city: CitySearchResult) => {
    setIsLoading(true);
    setError(null);
    setSelectedDayIndex(0); // Reset to today

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&hourly=relative_humidity_2m,temperature_2m,precipitation_probability&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch weather forecast data from Open-Meteo.');
      }

      const rawData = await res.json();
      
      // Match current hourly humidity & precipitation closer to the current time
      let humidity = 64; // Fallback default
      let precipitation = 0;

      if (rawData.hourly && Array.isArray(rawData.hourly.time)) {
        const currentTime = rawData.current_weather.time;
        // Find closest hour
        const closestIndex = rawData.hourly.time.findIndex((t: string) => t.startsWith(currentTime.substring(0, 13)));
        
        if (closestIndex !== -1) {
          humidity = rawData.hourly.relative_humidity_2m[closestIndex] ?? humidity;
          precipitation = rawData.hourly.precipitation_probability ? (rawData.hourly.precipitation_probability[closestIndex] ?? 0) : 0;
        }
      }

      const weatherObj: WeatherData = {
        city,
        current: {
          temperature: rawData.current_weather.temperature,
          windspeed: rawData.current_weather.windspeed,
          winddirection: rawData.current_weather.winddirection,
          weathercode: rawData.current_weather.weathercode,
          is_day: rawData.current_weather.is_day,
          time: rawData.current_weather.time,
          relative_humidity: humidity,
          precipitation: precipitation,
        },
        daily: {
          time: rawData.daily.time,
          weathercode: rawData.daily.weathercode,
          temperature_2m_max: rawData.daily.temperature_2m_max,
          temperature_2m_min: rawData.daily.temperature_2m_min,
          precipitation_sum: rawData.daily.precipitation_sum,
          windspeed_10m_max: rawData.daily.windspeed_10m_max,
        },
        hourly: rawData.hourly ? {
          time: rawData.hourly.time,
          temperature_2m: rawData.hourly.temperature_2m,
          relative_humidity_2m: rawData.hourly.relative_humidity_2m,
          precipitation_probability: rawData.hourly.precipitation_probability ?? [],
        } : undefined,
      };

      setWeatherData(weatherObj);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while fetching weather details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, [selectedCity]);

  // Handle city selection
  const handleSelectCity = (city: CitySearchResult) => {
    setSelectedCity(city);
  };

  const handleToggleUnit = () => {
    setIsCelsius(!isCelsius);
  };

  // Generate dynamic recommendations based on either the current hour or the focused daily forecast card
  const getSmartRecommendations = (): SmartRecommendation[] => {
    if (!weatherData) return [];

    // If focused on today (index 0), use the hyper-accurate current reading
    if (selectedDayIndex === 0) {
      return generateRecommendations(
        weatherData.current.temperature,
        weatherData.current.weathercode,
        weatherData.current.windspeed,
        weatherData.daily.precipitation_sum[0],
        weatherData.current.relative_humidity ?? 50
      );
    }

    // Otherwise, generate recommendations based on the daily metrics for the selected index
    return generateRecommendations(
      (weatherData.daily.temperature_2m_max[selectedDayIndex] + weatherData.daily.temperature_2m_min[selectedDayIndex]) / 2,
      weatherData.daily.weathercode[selectedDayIndex],
      weatherData.daily.windspeed_10m_max[selectedDayIndex],
      weatherData.daily.precipitation_sum[selectedDayIndex],
      50 // Default standard humidity for future daily planning
    );
  };

  const recommendations = getSmartRecommendations();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-500/10 selection:text-blue-200 antialiased pb-12">
      
      {/* Header Bar */}
      <header className="sticky top-0 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 z-40 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-950/40 flex items-center justify-center">
              <CloudSun className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-2">
                Weather Intelligence
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-950/60 border border-blue-900/40 text-blue-400 rounded-md uppercase tracking-wider">
                  Live
                </span>
              </h1>
              <p className="text-[10.5px] text-slate-500 font-semibold tracking-wide">HYPER-LOCAL FORECASTS & RULES ENGINE</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchWeatherData(selectedCity)}
              disabled={isLoading}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              title="Refresh forecast details"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <a 
              href="https://open-meteo.com" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl shadow-sm"
            >
              <span>Powered by Open-Meteo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 w-full space-y-6">
        
        {/* Search row and popular cities */}
        <section className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              Where are you planning next?
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Search a city worldwide to generate custom alerts, clothing checklists, and activity guidelines.
            </p>
          </div>

          <SearchBar onSelectCity={handleSelectCity} isLoading={isLoading} />

          {/* Popular shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Cities:</span>
            {DEFAULT_CITIES.map((city) => {
              const isSelected = selectedCity.id === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelectCity(city)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-950/60 border border-blue-800 text-blue-400 shadow-md shadow-blue-950/30'
                      : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Global Loading state */}
        {isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin stroke-[1.5]" />
            <p className="text-slate-300 font-semibold mt-4">Retrieving hyper-local weather parameters...</p>
            <p className="text-xs text-slate-500 mt-1">Connecting securely to Open-Meteo API</p>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-950/30 border border-red-900/60 rounded-2xl p-5 flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
            <div className="p-2 bg-red-900/40 text-red-400 border border-red-800/40 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-red-400">Connection Failed</h4>
              <p className="text-xs text-red-300 font-medium leading-relaxed">
                {error} City not found. Please check spelling or check your connection status.
              </p>
              <button
                onClick={() => fetchWeatherData(selectedCity)}
                className="mt-1 text-xs font-bold text-red-400 hover:text-red-200 transition-colors bg-slate-900 border border-slate-800 hover:border-slate-700 py-1.5 px-3 rounded-lg shadow-sm"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Loaded Data Display Dashboard */}
        {weatherData && (
          <div className="space-y-6">
            
            {/* Top row: current card & temperature trend chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Current Card - 5 cols */}
              <div className="lg:col-span-5 h-full">
                <CurrentWeatherCard 
                  data={weatherData} 
                  isCelsius={isCelsius} 
                  onToggleUnit={handleToggleUnit} 
                />
              </div>

              {/* Trend Chart - 7 cols */}
              <div className="lg:col-span-7 h-full">
                <TemperatureChart 
                  daily={weatherData.daily} 
                  isCelsius={isCelsius}
                  selectedDayIndex={selectedDayIndex}
                  onSelectDayIndex={setSelectedDayIndex}
                />
              </div>
            </div>

            {/* Middle Row: 7-day cards */}
            <section className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl">
              <ForecastSection 
                daily={weatherData.daily} 
                isCelsius={isCelsius}
                selectedDayIndex={selectedDayIndex}
                onSelectDayIndex={setSelectedDayIndex}
              />
            </section>

            {/* Focused Daily Card Insight (When a user clicks on a future day in 7-day forecast) */}
            {selectedDayIndex !== 0 && (
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/20 border border-blue-900/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">
                      Viewing Custom Forecast Plan: {new Date(weatherData.daily.time[selectedDayIndex]).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Smart planning guidelines are temporarily locked onto this chosen date to help organize your schedule.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDayIndex(0)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-slate-900 border border-blue-900/40 hover:border-blue-850 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Return to Live Today
                </button>
              </div>
            )}

            {/* Bottom Row: Smart Recommendations Panel */}
            <section>
              <RecommendationsPanel recommendations={recommendations} />
            </section>

          </div>
        )}

      </main>

      {/* Global Footer */}
      <footer className="mt-16 border-t border-slate-900 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <p>© 2026 Weather Intelligence Web App. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online Data Synchronization
            </span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Security & Privacy Guidelines</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
