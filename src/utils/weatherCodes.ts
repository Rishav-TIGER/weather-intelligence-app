import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Snowflake, 
  LucideIcon 
} from 'lucide-react';

export interface WeatherCodeInfo {
  label: string;
  icon: LucideIcon;
  colorClass: string; // Tailwind class for text / accent color
  bgClass: string; // Tailwind class for background
  gradientClass: string; // Tailwind class for subtle card gradients
}

export function getWeatherCodeInfo(code: number, isDay: boolean = true): WeatherCodeInfo {
  // Map WMO Weather Interpretation Codes (WW)
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        icon: Sun,
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-50 dark:bg-amber-950/20',
        gradientClass: 'from-amber-500/10 to-transparent',
      };
    case 1:
    case 2:
      return {
        label: code === 1 ? 'Mainly Clear' : 'Partly Cloudy',
        icon: CloudSun,
        colorClass: 'text-sky-500',
        bgClass: 'bg-sky-50 dark:bg-sky-950/20',
        gradientClass: 'from-sky-500/10 to-transparent',
      };
    case 3:
      return {
        label: 'Overcast',
        icon: Cloud,
        colorClass: 'text-slate-500',
        bgClass: 'bg-slate-50 dark:bg-slate-900/20',
        gradientClass: 'from-slate-500/10 to-transparent',
      };
    case 45:
    case 48:
      return {
        label: code === 45 ? 'Foggy' : 'Depositing Rime Fog',
        icon: CloudFog,
        colorClass: 'text-zinc-400',
        bgClass: 'bg-zinc-50 dark:bg-zinc-900/20',
        gradientClass: 'from-zinc-400/10 to-transparent',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: `${code === 51 ? 'Light' : code === 53 ? 'Moderate' : 'Dense'} Drizzle`,
        icon: CloudDrizzle,
        colorClass: 'text-teal-500',
        bgClass: 'bg-teal-50 dark:bg-teal-950/20',
        gradientClass: 'from-teal-500/10 to-transparent',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        icon: Snowflake,
        colorClass: 'text-cyan-400',
        bgClass: 'bg-cyan-50 dark:bg-cyan-950/20',
        gradientClass: 'from-cyan-400/10 to-transparent',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: `${code === 61 ? 'Slight' : code === 63 ? 'Moderate' : 'Heavy'} Rain`,
        icon: CloudRain,
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-50 dark:bg-blue-950/20',
        gradientClass: 'from-blue-500/10 to-transparent',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        icon: Snowflake,
        colorClass: 'text-indigo-400',
        bgClass: 'bg-indigo-50 dark:bg-indigo-950/20',
        gradientClass: 'from-indigo-400/10 to-transparent',
      };
    case 71:
    case 73:
    case 75:
      return {
        label: `${code === 71 ? 'Slight' : code === 73 ? 'Moderate' : 'Heavy'} Snowfall`,
        icon: CloudSnow,
        colorClass: 'text-blue-400',
        bgClass: 'bg-blue-50 dark:bg-blue-950/20',
        gradientClass: 'from-blue-400/10 to-transparent',
      };
    case 77:
      return {
        label: 'Snow Grains',
        icon: Snowflake,
        colorClass: 'text-blue-300',
        bgClass: 'bg-blue-50 dark:bg-blue-950/20',
        gradientClass: 'from-blue-300/10 to-transparent',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: `${code === 80 ? 'Slight' : code === 81 ? 'Moderate' : 'Heavy'} Rain Showers`,
        icon: CloudRain,
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50 dark:bg-blue-950/20',
        gradientClass: 'from-blue-600/10 to-transparent',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        icon: CloudSnow,
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-50 dark:bg-sky-950/20',
        gradientClass: 'from-sky-400/10 to-transparent',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        icon: CloudLightning,
        colorClass: 'text-violet-500',
        bgClass: 'bg-violet-50 dark:bg-violet-950/20',
        gradientClass: 'from-violet-500/10 to-transparent',
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm with Hail',
        icon: CloudLightning,
        colorClass: 'text-fuchsia-600',
        bgClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/20',
        gradientClass: 'from-fuchsia-600/10 to-transparent',
      };
    default:
      return {
        label: 'Unknown Weather',
        icon: Cloud,
        colorClass: 'text-slate-400',
        bgClass: 'bg-slate-50 dark:bg-slate-900/20',
        gradientClass: 'from-slate-400/10 to-transparent',
      };
  }
}
