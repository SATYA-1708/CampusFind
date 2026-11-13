import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MapPin, Building2, Flame } from 'lucide-react';

export default function CampusHotspots({ activeLocation, onSelectLocation }) {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHotspots() {
      try {
        const res = await api.getCampusHotspots();
        setHotspots(res.data || []);
      } catch {
        // silently fallback
      } finally {
        setLoading(false);
      }
    }
    loadHotspots();
  }, []);

  if (loading || hotspots.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-campus-border p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-campus-navy uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Active Campus Hotspots</span>
        </div>
        <span className="text-[11px] text-campus-muted">Click to filter location</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {hotspots.slice(0, 6).map((h) => {
          const isSelected = activeLocation === h.location;
          return (
            <button
              key={h.location}
              type="button"
              onClick={() => onSelectLocation(isSelected ? '' : h.location)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-campus-accent bg-campus-accentLight ring-2 ring-campus-accent/20'
                  : 'border-campus-border hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-semibold text-campus-navy line-clamp-1">
                  {h.location}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-campus-accent text-white'
                      : 'bg-white border border-campus-border text-slate-700'
                  }`}
                >
                  {h.count}
                </span>
              </div>

              <div className="mt-1 text-[10px] text-campus-muted flex items-center gap-2">
                {h.lostCount > 0 && <span className="text-amber-700">{h.lostCount} lost</span>}
                {h.foundCount > 0 && <span className="text-teal-700">{h.foundCount} found</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
