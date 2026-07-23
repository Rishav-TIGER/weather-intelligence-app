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
  Sparkles,
  WifiOff
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

function WeatherDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top row: current card & temperature trend chart skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Current Card Skeleton */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-850 rounded-2xl p-6 h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-slate-800 rounded-lg" />
              <div className="h-8 w-14 bg-slate-800 rounded-full" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-4 w-20 bg-slate-800 rounded" />
              <div className="h-14 w-28 bg-slate-800 rounded-xl" />
              <div className="h-4 w-16 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/60">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-2">
                <div className="h-3 w-10 bg-slate-800 rounded mx-auto" />
                <div className="h-4 w-14 bg-slate-800 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-850 rounded-2xl p-6 h-[380px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-800 rounded-lg" />
            <div className="h-3.5 w-64 bg-slate-800 rounded" />
          </div>
          <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-800 rounded-t-lg" style={{ height: `${20 + i * 10}%` }} />
                <div className="h-3 w-8 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
          <div className="h-10 w-full bg-slate-800/40 rounded-xl" />
        </div>
      </div>

      {/* Middle Row: 7-day cards skeleton */}
      <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl space-y-4">
        <div className="h-6 w-36 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-3 flex flex-col items-center">
              <div className="h-3.5 w-12 bg-slate-800 rounded" />
              <div className="h-7 w-7 bg-slate-800 rounded-full" />
              <div className="h-4 w-10 bg-slate-800 rounded" />
              <div className="h-3 w-14 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Smart Recommendations Panel skeleton */}
      <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl space-y-4">
        <div className="h-6 w-44 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-slate-900 p-4 rounded-xl flex gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-slate-800 rounded" />
                <div className="h-3 w-full bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CitySearchResult>(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Load cached weather on mount
  useEffect(() => {
    const cached = localStorage.getItem('last_weather_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setWeatherData(parsed);
        if (parsed.city) {
          setSelectedCity(parsed.city);
        }
      } catch (e) {
        console.error('Error loading cached weather data', e);
      }
    }
  }, []);

  // Fetch weather data for the selected city
  const fetchWeatherData = async (city: CitySearchResult) => {
    if (!navigator.onLine) {
      setIsOffline(true);
      setError('You are currently offline. Check your internet connection.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedDayIndex(0); // Reset to today

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&hourly=relative_humidity_2m,temperature_2m,precipitation_probability&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch weather forecast data from Open-Meteo.');
      }

      const rawData = await res.json();
      
      // Match current hourly humidity, precipitation, and precipitation probability closer to the current time
      let humidity = rawData.current?.relative_humidity_2m ?? 64; // Fallback default
      let precipitation = rawData.current?.precipitation ?? 0;
      let apparentTemp = rawData.current?.apparent_temperature ?? rawData.current_weather?.temperature;
      let precipProb = 0;

      if (rawData.hourly && Array.isArray(rawData.hourly.time)) {
        const currentTime = rawData.current?.time ?? rawData.current_weather?.time;
        if (currentTime) {
          const closestIndex = rawData.hourly.time.findIndex((t: string) => t.startsWith(currentTime.substring(0, 13)));
          if (closestIndex !== -1) {
            if (!rawData.current) {
              humidity = rawData.hourly.relative_humidity_2m[closestIndex] ?? humidity;
            }
            precipProb = rawData.hourly.precipitation_probability ? (rawData.hourly.precipitation_probability[closestIndex] ?? 0) : 0;
          }
        }
      }

      const weatherObj: WeatherData = {
        city,
        current: {
          temperature: rawData.current?.temperature_2m ?? rawData.current_weather.temperature,
          windspeed: rawData.current?.wind_speed_10m ?? rawData.current_weather.windspeed,
          winddirection: rawData.current?.wind_direction_10m ?? rawData.current_weather.winddirection,
          weathercode: rawData.current?.weather_code ?? rawData.current_weather.weathercode,
          is_day: rawData.current?.is_day ?? rawData.current_weather.is_day,
          time: rawData.current?.time ?? rawData.current_weather.time,
          relative_humidity: humidity,
          precipitation: precipitation,
          apparent_temperature: apparentTemp,
          precipitation_probability: precipProb,
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
      setIsOffline(false);
      localStorage.setItem('last_weather_data', JSON.stringify(weatherObj));
    } catch (err: any) {
      console.error(err);
      if (!navigator.onLine) {
        setIsOffline(true);
      }
      setError(err.message || 'An unexpected error occurred while fetching weather details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, [selectedCity]);

  // Sync internet connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchWeatherData(selectedCity);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedCity]);

  // Handle city selection
  const handleSelectCity = (city: CitySearchResult) => {
    setSelectedCity(city);
  };

  const handleToggleUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const handleRetryConnection = () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      setError('You are still offline. Please check your internet connection and try again.');
      return;
    }
    setIsOffline(false);
    setError(null);
    fetchWeatherData(selectedCity);
  };

  // Generate dynamic recommendations based on either the current hour or the focused daily forecast card
  const getSmartRecommendations = (): SmartRecommendation[] => {
    if (!weatherData) return [];

    const getDailyMaxPrecipProb = (dayIndex: number): number => {
      if (!weatherData.hourly || !weatherData.hourly.precipitation_probability) return 0;
      const start = dayIndex * 24;
      const end = start + 24;
      const dayProbabilities = weatherData.hourly.precipitation_probability.slice(start, end);
      if (dayProbabilities.length === 0) return 0;
      return Math.max(...dayProbabilities);
    };

    // If focused on today (index 0), use the hyper-accurate current reading
    if (selectedDayIndex === 0) {
      return generateRecommendations(
        weatherData.current.temperature,
        weatherData.current.weathercode,
        weatherData.current.windspeed,
        weatherData.daily.precipitation_sum[0],
        weatherData.current.relative_humidity ?? 50,
        weatherData.current.precipitation_probability ?? 0
      );
    }

    // Otherwise, generate recommendations based on the daily metrics for the selected index
    return generateRecommendations(
      (weatherData.daily.temperature_2m_max[selectedDayIndex] + weatherData.daily.temperature_2m_min[selectedDayIndex]) / 2,
      weatherData.daily.weathercode[selectedDayIndex],
      weatherData.daily.windspeed_10m_max[selectedDayIndex],
      weatherData.daily.precipitation_sum[selectedDayIndex],
      50, // Default standard humidity for future daily planning
      getDailyMaxPrecipProb(selectedDayIndex)
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

        {/* Offline & Connection Error Fallback State */}
        {(isOffline || error) && !weatherData && (
          <div className="max-w-xl mx-auto py-12 px-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-full text-blue-500 shadow-inner">
              {isOffline ? (
                <WifiOff className="w-10 h-10 animate-pulse text-amber-500" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-100 tracking-tight">
                {isOffline ? 'You Are Currently Offline' : 'Weather Service Unreachable'}
              </h3>
              <p className="text-sm text-slate-400 font-medium max-w-sm leading-relaxed mx-auto">
                {isOffline 
                  ? "We can't establish a live connection to update weather parameters. Please check your internet connection or router."
                  : error || "The Open-Meteo weather forecasting server failed to respond or returned an invalid response. Please try again in a moment."
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs pt-2">
              <button
                onClick={handleRetryConnection}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-950/50 hover:shadow-blue-500/20 hover:scale-[1.01] transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
              {DEFAULT_CITIES.length > 0 && (
                <button
                  onClick={() => {
                    setIsOffline(false);
                    setError(null);
                    fetchWeatherData(DEFAULT_CITIES[0]);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Load Default City
                </button>
              )}
            </div>
          </div>
        )}

        {/* Global Loading Skeleton state */}
        {isLoading && !weatherData && (
          <WeatherDashboardSkeleton />
        )}

        {/* Loaded Data Display Dashboard */}
        {weatherData && (
          <div className="space-y-6">
            {isOffline && (
              <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-3 flex items-center gap-3 max-w-xl mx-auto shadow-sm animate-in slide-in-from-top-2 duration-300">
                <WifiOff className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-[11px] text-amber-200 font-bold leading-none">
                    Offline Mode: Displaying last saved weather data for {weatherData.city.name}.
                  </span>
                  <button 
                    onClick={handleRetryConnection}
                    className="text-[10px] font-black text-amber-400 hover:text-amber-200 uppercase tracking-wider hover:underline transition-all shrink-0 text-left cursor-pointer"
                  >
                    Reconnect Now
                  </button>
                </div>
              </div>
            )}
            
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
