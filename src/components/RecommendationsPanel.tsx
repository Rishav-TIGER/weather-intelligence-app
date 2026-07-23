import React, { useState } from 'react';
import { 
  Sparkles, 
  Shirt, 
  Compass, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Layers,
  Filter
} from 'lucide-react';
import { SmartRecommendation } from '../types';

interface RecommendationsPanelProps {
  recommendations: SmartRecommendation[];
}

export default function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: Layers },
    { id: 'alert', label: 'Alerts', icon: AlertTriangle },
    { id: 'clothing', label: 'Clothing', icon: Shirt },
    { id: 'activity', label: 'Activities', icon: Compass },
    { id: 'health', label: 'Health', icon: Heart },
  ];

  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter((r) => r.category === filter);

  const getCategoryStyles = (category: SmartRecommendation['category'], type: SmartRecommendation['type']) => {
    switch (category) {
      case 'alert':
        return {
          icon: AlertTriangle,
          borderColor: type === 'danger' ? 'border-red-600' : 'border-amber-600',
          bgColor: type === 'danger' ? 'bg-red-950/20' : 'bg-amber-950/20',
          iconColor: type === 'danger' ? 'text-red-400' : 'text-amber-400',
        };
      case 'clothing':
        return {
          icon: Shirt,
          borderColor: 'border-blue-600',
          bgColor: 'bg-blue-950/15',
          iconColor: 'text-blue-400',
        };
      case 'activity':
        return {
          icon: Compass,
          borderColor: 'border-emerald-600',
          bgColor: 'bg-emerald-950/15',
          iconColor: 'text-emerald-400',
        };
      case 'health':
        return {
          icon: Heart,
          borderColor: 'border-rose-600',
          bgColor: 'bg-rose-950/15',
          iconColor: 'text-rose-400',
        };
      default:
        return {
          icon: Info,
          borderColor: 'border-slate-800',
          bgColor: 'bg-slate-900',
          iconColor: 'text-slate-400',
        };
    }
  };

  return (
    <div 
      id="recommendations-panel"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300"
    >
      {/* Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-950 border border-slate-800 text-blue-500 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">Smart Weather Planning</h3>
            <p className="text-xs text-slate-400 mt-0.5">Customized attire, activity, safety and wellness guides</p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = filter === cat.id;
            
            // Check count of items in this category
            const count = cat.id === 'all' 
              ? recommendations.length 
              : recommendations.filter((r) => r.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                    : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CatIcon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Cards List */}
      {filteredRecs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const styles = getCategoryStyles(rec.category, rec.type);
            const RecIcon = styles.icon;

            return (
              <div
                key={rec.id}
                className={`flex gap-4 p-4 rounded-xl border border-l-4 ${styles.borderColor} border-slate-800/80 ${styles.bgColor} transition-all duration-300 hover:shadow-sm`}
              >
                <div className={`p-2 bg-slate-950 rounded-lg shrink-0 self-start shadow-sm border border-slate-800 ${styles.iconColor}`}>
                  <RecIcon className="w-5 h-5 stroke-[2]" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-200">
                      {rec.title}
                    </span>
                    {rec.category === 'alert' && (
                      <span className={`text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
                        rec.type === 'danger' 
                          ? 'bg-red-950/60 text-red-400 border border-red-900/30' 
                          : 'bg-amber-950/60 text-amber-400 border border-amber-900/30'
                      }`}>
                        {rec.type === 'danger' ? 'Urgent' : 'Advisory'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {rec.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 bg-slate-950/40 border border-slate-800/60 border-dashed rounded-xl">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">No recommendations found in this category.</p>
          <p className="text-xs mt-0.5">Everything looks clear and optimal!</p>
        </div>
      )}
    </div>
  );
}
