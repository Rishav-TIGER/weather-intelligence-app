import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Thermometer, Info, CloudRain, ShieldAlert } from 'lucide-react';
import { DailyForecast } from '../types';
import { getWeatherCodeInfo } from '../utils/weatherCodes';

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize listener to make SVG completely fluid
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width || 600);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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

  const convertedMax = maxTemps.map(convertTemp);
  const convertedMin = minTemps.map(convertTemp);

  // Math dimensions for the SVG grid
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  
  const height = 240;
  const width = containerWidth;
  
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Find min/max boundaries across both lines
  const allTemps = [...convertedMax, ...convertedMin];
  let tempMax = Math.max(...allTemps);
  let tempMin = Math.min(...allTemps);
  
  // Add padding to range
  const tempRange = tempMax - tempMin;
  const boundsPadding = tempRange * 0.15 || 4; // At least 4 units padding
  const yMaxBound = tempMax + boundsPadding;
  const yMinBound = tempMin - boundsPadding;
  const yRange = yMaxBound - yMinBound;

  // Coordinate getters
  const getX = (index: number) => {
    return paddingLeft + (index / 6) * plotWidth;
  };

  const getY = (temp: number) => {
    const ratio = (temp - yMinBound) / yRange;
    return height - paddingBottom - ratio * plotHeight;
  };

  // Build points for paths
  const maxPoints = convertedMax.map((temp, i) => ({ x: getX(i), y: getY(temp) }));
  const minPoints = convertedMin.map((temp, i) => ({ x: getX(i), y: getY(temp) }));

  // Create SVG path strings (smooth or straight lines)
  const buildPath = (points: { x: number; y: number }[]) => {
    return points.reduce((path, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Let's draw standard straight segment lines, which are extremely precise for daily forecast trends
      return `${path} L ${pt.x} ${pt.y}`;
    }, '');
  };

  const maxLinePath = buildPath(maxPoints);
  const minLinePath = buildPath(minPoints);

  // Gradient area path (from path down to baseline)
  const buildAreaPath = (points: { x: number; y: number }[], baselineY: number) => {
    if (points.length === 0) return '';
    const linePath = buildPath(points);
    return `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
  };

  const maxAreaPath = buildAreaPath(maxPoints, getY(yMinBound));
  const minAreaPath = buildAreaPath(minPoints, getY(yMinBound));

  // Determine closest point on mouse hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Find closest index
    let closestIndex = 0;
    let minDiff = Infinity;
    for (let i = 0; i < 7; i++) {
      const ptX = getX(i);
      const diff = Math.abs(mouseX - ptX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    setHoveredIndex(closestIndex);
    
    // Set tooltip position
    setTooltipPos({
      x: getX(closestIndex),
      y: (getY(convertedMax[closestIndex]) + getY(convertedMin[closestIndex])) / 2,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleSvgClick = (index: number) => {
    onSelectDayIndex(index);
  };

  // Generate grid-lines
  const gridLinesYCount = 4;
  const gridLinesY = Array.from({ length: gridLinesYCount }).map((_, i) => {
    const ratio = i / (gridLinesYCount - 1);
    const tempValue = yMinBound + ratio * yRange;
    const yCoord = getY(tempValue);
    return { temp: tempValue, y: yCoord };
  });

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
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

      <div ref={containerRef} className="relative w-full overflow-visible select-none">
        <svg
          height={height}
          width={width}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="overflow-visible cursor-crosshair"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="maxTempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="minTempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (Horizontal) */}
          {gridLinesY.map((line, i) => (
            <g key={`grid-y-${i}`} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                textAnchor="end"
                className="text-[10px] font-bold fill-slate-500"
              >
                {Math.round(line.temp)}°
              </text>
            </g>
          ))}

          {/* Grid columns (Vertical) */}
          {dates.map((_, i) => {
            const x = getX(i);
            const isSelected = i === selectedDayIndex;
            const isHovered = i === hoveredIndex;

            return (
              <g key={`grid-x-${i}`}>
                {/* Column click target zone */}
                <rect
                  x={x - (plotWidth / 12)}
                  y={paddingTop}
                  width={plotWidth / 6}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => handleSvgClick(i)}
                />
                
                {/* vertical grid line */}
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke={isSelected ? '#3b82f6' : isHovered ? '#334155' : '#0f172a'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  strokeDasharray={isSelected ? 'none' : '3 3'}
                  className="transition-colors pointer-events-none"
                />
              </g>
            );
          })}

          {/* Gradient Areas */}
          <path d={maxAreaPath} fill="url(#maxTempGradient)" className="pointer-events-none" />
          <path d={minAreaPath} fill="url(#minTempGradient)" className="pointer-events-none" />

          {/* Trend Lines */}
          <path
            d={maxLinePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none"
          />
          <path
            d={minLinePath}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none"
          />

          {/* Data Nodes & Halo highlights */}
          {dates.map((_, i) => {
            const x = getX(i);
            const yMax = getY(convertedMax[i]);
            const yMin = getY(convertedMin[i]);
            const isSelected = i === selectedDayIndex;
            const isHovered = i === hoveredIndex;

            return (
              <g key={`nodes-${i}`} className="pointer-events-none">
                {/* Max Temp Nodes */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={x}
                    cy={yMax}
                    r={isSelected ? 8 : 6}
                    fill="#f43f5e"
                    fillOpacity={isSelected ? 0.2 : 0.1}
                    className="transition-all"
                  />
                )}
                <circle
                  cx={x}
                  cy={yMax}
                  r="4"
                  fill="#020617"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />

                {/* Min Temp Nodes */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={x}
                    cy={yMin}
                    r={isSelected ? 8 : 6}
                    fill="#0ea5e9"
                    fillOpacity={isSelected ? 0.2 : 0.1}
                    className="transition-all"
                  />
                )}
                <circle
                  cx={x}
                  cy={yMin}
                  r="4"
                  fill="#020617"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />

                {/* Bottom X-Axis labels (Days of week) */}
                <text
                  x={x}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-bold transition-colors ${
                    isSelected 
                      ? 'fill-blue-500 font-extrabold' 
                      : isHovered 
                        ? 'fill-slate-300' 
                        : 'fill-slate-500'
                  }`}
                >
                  {getDayName(dates[i], i)}
                </text>
                
                <text
                  x={x}
                  y={height - paddingBottom + 30}
                  textAnchor="middle"
                  className={`text-[9px] font-semibold transition-colors ${
                    isSelected ? 'fill-blue-400' : 'fill-slate-600'
                  }`}
                >
                  {new Date(dates[i]).getDate()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Highlight Interactive Overlay Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute bg-slate-950 text-slate-100 rounded-xl shadow-2xl p-3 text-xs border border-slate-800 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: Math.min(
                Math.max(tooltipPos.x - 70, 10),
                width - 150
              ),
              top: Math.max(tooltipPos.y - 110, 5),
            }}
          >
            <div className="font-extrabold border-b border-slate-900 pb-1.5 mb-1.5 flex items-center justify-between gap-4">
              <span>{new Date(dates[hoveredIndex]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {getWeatherCodeInfo(weathercode[hoveredIndex], true).label}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-5 text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Max Temp:
                </span>
                <span className="font-bold text-white">{formatTempDisplay(maxTemps[hoveredIndex])}</span>
              </div>
              
              <div className="flex items-center justify-between gap-5 text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Min Temp:
                </span>
                <span className="font-bold text-white">{formatTempDisplay(minTemps[hoveredIndex])}</span>
              </div>

              <div className="flex items-center justify-between gap-5 text-slate-500 mt-0.5 border-t border-dashed border-slate-800 pt-1 text-[10px]">
                <span className="flex items-center gap-0.5">
                  <CloudRain className="w-2.5 h-2.5 text-blue-400" />
                  Precipitation:
                </span>
                <span className="font-bold text-slate-300">{precipSums[hoveredIndex].toFixed(1)} mm</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-400 bg-slate-950/50 border border-slate-800/60 rounded-xl p-2.5">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>
          <strong>Pro-tip:</strong> Use the 7-day forecast cards above to toggle which day's statistics are focused. Hover anywhere on the chart to read precise values.
        </span>
      </div>
    </div>
  );
}
