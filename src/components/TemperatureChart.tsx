import React from 'react';
import { TrendingUp, Info, CloudRain } from 'lucide-react';
import { DailyForecast } from '../types';
import { getWeatherCodeInfo } from '../utils/weatherCodes';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface TemperatureChartProps {
  daily: DailyForecast;
  isCelsius: boolean;
  selectedDayIndex: number;
  onSelectDayIndex: (index: number) => void;
}

export default function TemperatureChart({
  daily,
  isCelsius,
  selectedDayIndex,
  onSelectDayIndex,
}: TemperatureChartProps) {
  const {
    time: dates,
    temperature_2m_max: maxTemps,
    temperature_2m_min: minTemps,
    weathercode,
    precipitation_sum: precipSums,
  } = daily;

  // Convert temperatures for display
  const convertTemp = (celsius: number) => {
    if (isCelsius) return celsius;
    return (celsius * 1.8) + 32;
  };

  const formatTempDisplay = (celsius: number) => {
    return `${Math.round(convertTemp(celsius))}°${isCelsius ? 'C' : 'F'}`;
  };

  const getDayName = (dateStr: string, index: number) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Build structured data array for Recharts
  const chartData = dates.map((dateStr, i) => {
    const max = convertTemp(maxTemps[i]);
    const min = convertTemp(minTemps[i]);
    return {
      name: getDayName(dateStr, i),
      date: dateStr,
      max: Number(max.toFixed(1)),
      min: Number(min.toFixed(1)),
      precipitation: precipSums[i],
      weatherCode: weathercode[i],
      index: i,
    };
  });

  const handleChartClick = (state: any) => {
    if (state && typeof state.activeTooltipIndex === 'number') {
      onSelectDayIndex(state.activeTooltipIndex);
    }
  };

  // Custom X-Axis Tick rendering to mirror the exquisite original style
  const CustomXAxisTick = ({ x, y, payload, index }: any) => {
    const isSelected = index === selectedDayIndex;
    const dateStr = dates[index];
    const dayNum = dateStr ? new Date(dateStr).getDate() : '';

    return (
      <g transform={`translate(${x},${y})`} className="cursor-pointer">
        <text
          x={0}
          y={0}
          dy={14}
          textAnchor="middle"
          className={`text-[11px] font-bold transition-colors ${
            isSelected ? 'fill-blue-500 font-extrabold' : 'fill-slate-400'
          }`}
        >
          {payload.value}
        </text>
        <text
          x={0}
          y={0}
          dy={26}
          textAnchor="middle"
          className={`text-[9px] font-semibold transition-colors ${
            isSelected ? 'fill-blue-400 font-bold' : 'fill-slate-600'
          }`}
        >
          {dayNum}
        </text>
      </g>
    );
  };

  // Custom Tooltip rendering to mirror high-fidelity original popup styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const weatherInfo = getWeatherCodeInfo(data.weatherCode, true);
      return (
        <div className="bg-slate-950 text-slate-100 rounded-xl shadow-2xl p-3 text-xs border border-slate-800 z-30 pointer-events-none select-none">
          <div className="font-extrabold border-b border-slate-900 pb-1.5 mb-1.5 flex items-center justify-between gap-4">
            <span>
              {new Date(data.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              {weatherInfo.label}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-5 text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Max Temp:
              </span>
              <span className="font-bold text-white">
                {data.max}°{isCelsius ? 'C' : 'F'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-5 text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Min Temp:
              </span>
              <span className="font-bold text-white">
                {data.min}°{isCelsius ? 'C' : 'F'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-5 text-slate-500 mt-0.5 border-t border-dashed border-slate-800 pt-1 text-[10px]">
              <span className="flex items-center gap-0.5">
                <CloudRain className="w-2.5 h-2.5 text-blue-400 animate-pulse" />
                Precipitation:
              </span>
              <span className="font-bold text-slate-300">
                {data.precipitation.toFixed(1)} mm
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="temperature-chart-container"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            7-Day Temperature Variation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Sleek visual representation of highs and lows</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-rose-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Max Temp</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-500">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Min Temp</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-visible select-none h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            onClick={handleChartClick}
            className="cursor-pointer"
          >
            <defs>
              <linearGradient id="maxTempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="minTempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
              opacity={0.3}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={<CustomXAxisTick />}
              interval={0}
            />

            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
              width={35}
              tickFormatter={(v) => `${Math.round(v)}°`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="max"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#maxTempGradient)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
            />

            <Area
              type="monotone"
              dataKey="min"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fill="url(#minTempGradient)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-400 bg-slate-950/50 border border-slate-800/60 rounded-xl p-2.5">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>
          <strong>Pro-tip:</strong> Click anywhere on the temperature chart or the 7-day cards above to select that day's complete details. Hover on points to view precise values.
        </span>
      </div>
    </div>
  );
}
