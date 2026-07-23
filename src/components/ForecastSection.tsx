import { Calendar, CloudRain, Wind } from 'lucide-react';
import { DailyForecast } from '../types';
import { getWeatherCodeInfo } from '../utils/weatherCodes';

interface ForecastSectionProps {
  daily: DailyForecast;
  isCelsius: boolean;
  selectedDayIndex: number;
  onSelectDayIndex: (index: number) => void;
}

export default function ForecastSection({
  daily,
  isCelsius,
  selectedDayIndex,
  onSelectDayIndex,
}: ForecastSectionProps) {
  
  // Format temperatures
  const formatTemp = (celsius: number) => {
    if (isCelsius) {
      return `${Math.round(celsius)}°`;
    } else {
      const fahrenheit = (celsius * 1.8) + 32;
      return `${Math.round(fahrenheit)}°`;
    }
  };

  // Format date helper (e.g. "Mon, Jul 24" or "Today", "Tomorrow")
  const formatDateLabel = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDayName = (dateStr: string, index: number) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="forecast-section" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          7-Day Forecast
        </h3>
        <span className="text-xs text-slate-500 font-medium">Click a card to focus details and charts</span>
      </div>

      {/* Grid containing cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {daily.time.map((timeStr, index) => {
          const code = daily.weathercode[index];
          const maxTemp = daily.temperature_2m_max[index];
          const minTemp = daily.temperature_2m_min[index];
          const precipitation = daily.precipitation_sum[index];
          const maxWind = daily.windspeed_10m_max[index];
          
          const weatherInfo = getWeatherCodeInfo(code, true);
          const Icon = weatherInfo.icon;
          const isSelected = index === selectedDayIndex;

          return (
            <button
              key={timeStr}
              onClick={() => onSelectDayIndex(index)}
              className={`flex flex-col items-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-950/40 scale-[1.03]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 shadow-sm'
              }`}
            >
              <span className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {formatDateLabel(timeStr, index)}
              </span>
              
              <span className={`text-[10px] mb-2 font-medium ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                {getDayName(timeStr, index)}
              </span>

              <div className={`p-2.5 rounded-lg my-1.5 transition-colors ${
                isSelected ? 'bg-blue-500/25 text-white' : 'bg-slate-900 ' + weatherInfo.colorClass
              }`}>
                <Icon className="w-6 h-6 stroke-[1.8]" />
              </div>

              <span className={`text-[11px] font-semibold truncate max-w-full ${isSelected ? 'text-white' : 'text-slate-300'}`} title={weatherInfo.label}>
                {weatherInfo.label}
              </span>

              {/* Min/Max Temperature */}
              <div className="flex items-center gap-1.5 mt-2 text-sm font-semibold">
                <span className={isSelected ? 'text-white' : 'text-slate-200'}>
                  {formatTemp(maxTemp)}
                </span>
                <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                  /
                </span>
                <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                  {formatTemp(minTemp)}
                </span>
              </div>

              {/* Extra micro parameters */}
              <div className={`flex items-center gap-2 mt-2.5 border-t border-dashed pt-2 w-full justify-center ${
                isSelected ? 'border-blue-500/30' : 'border-slate-800'
              }`}>
                <span className={`flex items-center gap-0.5 font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`} title="Precipitation">
                  <CloudRain className="w-2.5 h-2.5 opacity-80 shrink-0 text-sky-400" />
                  {precipitation.toFixed(1)} mm
                </span>
                <span className={`flex items-center gap-0.5 font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`} title="Max Wind Speed">
                  <Wind className="w-2.5 h-2.5 opacity-80 shrink-0 text-blue-400" />
                  {Math.round(isCelsius ? maxWind : maxWind * 0.621371)} {isCelsius ? 'km/h' : 'mph'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
