import { 
  Wind, 
  Droplets, 
  CloudRain, 
  MapPin, 
  Calendar, 
  Navigation, 
  Thermometer, 
  Clock 
} from 'lucide-react';
import { WeatherData } from '../types';
import { getWeatherCodeInfo } from '../utils/weatherCodes';

interface CurrentWeatherCardProps {
  data: WeatherData;
  isCelsius: boolean;
  onToggleUnit: () => void;
}

export default function CurrentWeatherCard({ data, isCelsius, onToggleUnit }: CurrentWeatherCardProps) {
  const { city, current, daily } = data;
  
  const weatherInfo = getWeatherCodeInfo(current.weathercode, current.is_day === 1);
  const Icon = weatherInfo.icon;

  // Format temperature
  const formatTemp = (celsius: number) => {
    if (isCelsius) {
      return `${Math.round(celsius)}°C`;
    } else {
      const fahrenheit = (celsius * 1.8) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
  };

  // Min and max for today
  const todayMax = daily.temperature_2m_max[0] ?? current.temperature;
  const todayMin = daily.temperature_2m_min[0] ?? current.temperature;

  // Wind direction compass degree helper
  const getWindDirectionText = (degree: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degree % 360) / 45)) % 8;
    return directions[index];
  };

  // Format last updated time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      id="current-weather-card"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300"
    >
      {/* Background Subtle Gradient overlay matching the weather type */}
      <div className={`absolute inset-0 bg-gradient-to-br ${weatherInfo.gradientClass} pointer-events-none opacity-20`} />

      <div className="relative z-10">
        {/* Card Header: Location & Time */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-slate-950 border border-slate-800 text-blue-500 rounded-lg shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="city-name" className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                {city.name}
                {city.country_code && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                    {city.country_code}
                  </span>
                )}
              </h2>
              <p id="city-region" className="text-sm text-slate-400 font-medium mt-0.5">
                {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded-full">
                <Clock className="w-3 h-3 text-blue-500" />
                {formatTime(current.time)}
              </span>
            </div>
            
            {/* C/F Toggle Switch */}
            <button
              id="temp-toggle-button"
              onClick={onToggleUnit}
              className="flex items-center bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg p-0.5 transition-all cursor-pointer shadow-inner text-xs font-bold"
              aria-label="Toggle unit"
            >
              <span className={`px-2.5 py-1 rounded-md transition-all ${isCelsius ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500'}`}>
                °C
              </span>
              <span className={`px-2.5 py-1 rounded-md transition-all ${!isCelsius ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500'}`}>
                °F
              </span>
            </button>
          </div>
        </div>

        {/* Temperature & Condition Main Display */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 my-4 py-2 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-sm`}>
              <Icon className={`w-14 h-14 md:w-16 md:h-16 ${weatherInfo.colorClass} stroke-[1.5]`} />
            </div>
            <div>
              <div id="current-temp" className="text-5xl md:text-6xl font-black text-slate-100 tracking-tight leading-none">
                {formatTemp(current.temperature)}
              </div>
              <div id="current-weather-label" className="text-lg md:text-xl font-bold text-slate-200 mt-2 flex items-center gap-1.5">
                {weatherInfo.label}
              </div>
            </div>
          </div>

          {/* High / Low for Today */}
          <div className="flex md:flex-col gap-4 md:gap-2 text-sm bg-slate-950 border border-slate-800 rounded-xl p-3 px-4 w-full md:w-auto">
            <div className="flex-1 md:flex-initial flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Today's High</p>
                <p id="today-high" className="font-bold text-slate-200">{formatTemp(todayMax)}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800 md:hidden" />
            <div className="flex-1 md:flex-initial flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-sky-500" />
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Today's Low</p>
                <p id="today-low" className="font-bold text-slate-200">{formatTemp(todayMin)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Secondary Weather Parameters Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 rounded-xl p-3 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Wind className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold">Wind</span>
            </div>
            <p id="wind-speed" className="text-base font-bold text-slate-200">
              {current.windspeed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <Navigation 
                className="w-2.5 h-2.5 inline text-blue-500" 
                style={{ transform: `rotate(${current.winddirection}deg)` }} 
              />
              {getWindDirectionText(current.winddirection)} ({current.winddirection}°)
            </p>
          </div>

          <div className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 rounded-xl p-3 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-semibold">Humidity</span>
            </div>
            <p id="humidity-value" className="text-base font-bold text-slate-200">
              {current.relative_humidity ?? 64}<span className="text-xs font-normal text-slate-400">%</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {current.relative_humidity && current.relative_humidity > 70 ? 'Humid air' : current.relative_humidity && current.relative_humidity < 35 ? 'Dry air' : 'Comfortable'}
            </p>
          </div>

          <div className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 rounded-xl p-3 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <CloudRain className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-semibold">Precip.</span>
            </div>
            <p id="precipitation-value" className="text-base font-bold text-slate-200">
              {daily.precipitation_sum[0] ?? 0} <span className="text-xs font-normal text-slate-400">mm</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {(daily.precipitation_sum[0] ?? 0) > 2 ? 'Expected rain' : 'Dry day'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
