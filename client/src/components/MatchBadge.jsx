import React from 'react';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export default function MatchBadge({ score, reasons = [], compact = false }) {
  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
  let scoreColor = 'text-slate-700';

  if (score >= 75) {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    scoreColor = 'text-emerald-700';
  } else if (score >= 50) {
    badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
    scoreColor = 'text-teal-700';
  } else if (score >= 25) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    scoreColor = 'text-amber-700';
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}
      >
        <Sparkles className="w-3 h-3" />
        {score}% Match
      </span>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${badgeColor} space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-sm">
          <Sparkles className={`w-4 h-4 ${scoreColor}`} />
          <span>Match Confidence:</span>
        </div>
        <span className={`text-base font-bold ${scoreColor}`}>
          {score}%
        </span>
      </div>

      {reasons && reasons.length > 0 && (
        <ul className="text-xs space-y-1 pt-1 border-t border-black/5">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-1.5 opacity-90">
              <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
