import React from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, MapPin, Calendar, Tag, ShieldCheck } from 'lucide-react';

export default function MatchCompareModal({
  sourceItem,
  matchedItem,
  score,
  reasons = [],
  isOpen,
  onClose,
  onClaim,
}) {
  if (!isOpen || !sourceItem || !matchedItem) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-campus-border shadow-dropdown overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-campus-border flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-campus-navy text-teal-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-campus-navy">
                Side-by-Side Match Comparison
              </h3>
              <p className="text-xs text-campus-muted">
                Deterministic rule correlation analysis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Match Score Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-slate-50 to-blue-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                Deterministic Match Confidence
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-campus-navy">{score}%</span>
                <span className="text-xs text-slate-600 font-medium">Similarity Metric</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {reasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-teal-200 text-teal-900 shadow-subtle flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item 1: Source */}
            <div className="p-5 rounded-2xl border border-campus-border bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    sourceItem.type === 'lost'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {sourceItem.type === 'lost' ? 'Your Lost Report' : 'Your Found Report'}
                </span>
                <span className="text-xs text-campus-muted font-medium">Original</span>
              </div>

              <h4 className="font-bold text-base text-campus-navy leading-snug">
                {sourceItem.title}
              </h4>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-campus-accent shrink-0" />
                  <span>{sourceItem.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-campus-accent shrink-0" />
                  <span>{sourceItem.campusLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(sourceItem.eventDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-campus-border text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {sourceItem.description}
              </div>
            </div>

            {/* Item 2: Matched Candidate */}
            <div className="p-5 rounded-2xl border-2 border-campus-accent/30 bg-teal-50/20 space-y-4">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    matchedItem.type === 'lost'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {matchedItem.type === 'lost' ? 'Candidate Lost Post' : 'Candidate Found Post'}
                </span>
                <span className="text-xs font-bold text-campus-accent">
                  {score}% Match
                </span>
              </div>

              <h4 className="font-bold text-base text-campus-navy leading-snug">
                {matchedItem.title}
              </h4>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-campus-accent shrink-0" />
                  <span className="font-semibold text-slate-800">{matchedItem.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-campus-accent shrink-0" />
                  <span className="font-semibold text-slate-800">{matchedItem.campusLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(matchedItem.eventDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-campus-border text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {matchedItem.description}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-campus-border bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-campus-muted hover:bg-slate-200 transition"
          >
            Close Comparison
          </button>

          {onClaim && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onClaim(matchedItem);
              }}
              className="px-5 py-2.5 rounded-xl bg-campus-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle flex items-center gap-2"
            >
              <span>Verify &amp; Claim Item</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
