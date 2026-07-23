import React, { useState, useEffect, useRef } from 'react';
import { Search, History, X, MapPin, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { CitySearchResult } from '../types';

interface SearchBarProps {
  onSelectCity: (city: CitySearchResult) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSelectCity, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recent_weather_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing recent searches', e);
      }
    }
  }, []);

  // Listen for clicks outside search bar to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Open-Meteo Geocoding API
  const fetchSuggestions = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        trimmedQuery
      )}&count=5&language=en&format=json`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Failed to fetch city suggestions');
      }

      const data = await res.json();
      
      if (data.results && Array.isArray(data.results)) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to location service.');
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced query change
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 2) {
      debounceTimeout.current = setTimeout(() => {
        fetchSuggestions(trimmedQuery);
      }, 350);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleSelectSuggestion = (city: CitySearchResult) => {
    onSelectCity(city);
    
    // Save to recents
    const updated = [
      city,
      ...recentSearches.filter((item) => item.id !== city.id),
    ].slice(0, 5); // Keep up to 5 cities
    
    setRecentSearches(updated);
    localStorage.setItem('recent_weather_searches', JSON.stringify(updated));
    
    setQuery('');
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recent_weather_searches');
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item.id !== id);
    setRecentSearches(updated);
    localStorage.setItem('recent_weather_searches', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-2.5">
      <div id="search-container" ref={containerRef} className="relative w-full z-50">
        <div 
          className={`flex items-center gap-3 bg-slate-900 border rounded-xl px-4 py-3 transition-all duration-300 ${
            isFocused 
              ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-lg shadow-blue-950/25' 
              : 'border-slate-800 hover:border-slate-700 shadow-sm'
          }`}
        >
          <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-blue-500' : 'text-slate-500'}`} />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for a city (e.g. New York, Tokyo, Berlin...)"
            className="w-full text-base text-slate-100 placeholder-slate-500 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              id="clear-search-button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
        </div>

        {/* Dropdown for suggestions and recent searches */}
        {isFocused && (
          <div 
            id="search-dropdown"
            className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* Suggestions List */}
            {query.trim().length >= 2 && (
              <div>
                <div className="bg-slate-900 px-4 py-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-800">
                  Search Results
                </div>
                {isSearching ? (
                  <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Searching locations...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="divide-y divide-slate-900">
                    {suggestions.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelectSuggestion(city)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-900 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200 group-hover:text-white">{city.name}</span>
                            <span className="text-slate-400 text-xs mt-0.5">
                              {city.admin1 ? `${city.admin1}, ` : ''}
                              {city.country}
                              {city.country_code ? ` (${city.country_code.toUpperCase()})` : ''}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-transparent group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 flex items-start gap-3 bg-slate-900/40 border-b border-slate-900">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-slate-200">No matching location found.</p>
                      <p className="text-xs text-slate-400 font-medium">Please check spelling.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {query.trim().length < 2 && (
              <div>
                <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-800">
                  <span>Recent Searches</span>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-blue-500 hover:text-blue-400 normal-case font-semibold text-xs transition-colors hover:underline cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>
                {recentSearches.length > 0 ? (
                  <div className="divide-y divide-slate-900">
                    {recentSearches.map((city) => (
                      <div
                        key={`recent-${city.id}`}
                        className="flex items-center justify-between group/item hover:bg-slate-900 transition-colors"
                      >
                        <button
                          onClick={() => handleSelectSuggestion(city)}
                          className="flex-1 flex items-center gap-3 px-4 py-3 text-left group/btn"
                        >
                          <History className="w-4 h-4 text-slate-500 group-hover/btn:text-blue-500 transition-colors shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200 group-hover/btn:text-white">{city.name}</span>
                            <span className="text-slate-400 text-xs mt-0.5">
                              {city.admin1 ? `${city.admin1}, ` : ''}
                              {city.country}
                              {city.country_code ? ` (${city.country_code.toUpperCase()})` : ''}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleRemoveHistoryItem(e, city.id)}
                          className="p-1 mr-3 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors md:opacity-0 md:group-hover/item:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-center text-sm text-slate-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-1" />
                    No search history. Look up a city to get started!
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-950/40 text-red-400 text-xs px-4 py-2 border-t border-red-900/60">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick-click Recent Searches Tags */}
      {recentSearches.length > 0 && (
        <div id="recent-searches-tags" className="flex flex-wrap items-center justify-center gap-2 px-2 animate-in fade-in duration-300">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <History className="w-3 h-3 text-slate-500" />
            Recent:
          </span>
          {recentSearches.map((city) => (
            <button
              key={`tag-${city.id}`}
              onClick={() => onSelectCity(city)}
              className="px-3 py-1 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-blue-400 border border-slate-800 hover:border-slate-700 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span>{city.name}</span>
              {city.country_code && (
                <span className="text-[9px] text-slate-500 font-extrabold uppercase">
                  {city.country_code}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
