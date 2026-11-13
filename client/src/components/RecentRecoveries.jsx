import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { CheckCircle2, HeartHandshake, MapPin } from 'lucide-react';

export default function RecentRecoveries() {
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecoveries() {
      try {
        const res = await api.getRecentRecoveries();
        setRecoveries(res.data || []);
      } catch {
        // Silently fallback if none
      } finally {
        setLoading(false);
      }
    }
    loadRecoveries();
  }, []);

  if (loading || recoveries.length === 0) return null;

  return (
    <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/70 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>Recent Campus Reunifications</span>
        </div>
        <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Returned to rightful owners
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recoveries.map((item) => (
          <Link
            key={item._id}
            to={`/item/${item._id}`}
            className="p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 transition shadow-subtle flex flex-col justify-between group"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                {item.category}
              </span>
              <h5 className="font-semibold text-xs text-campus-navy group-hover:text-emerald-700 line-clamp-1 mt-0.5">
                {item.title}
              </h5>
            </div>

            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> {item.campusLocation}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                Resolved
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
