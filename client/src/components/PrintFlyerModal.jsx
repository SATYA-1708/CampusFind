import React, { useRef } from 'react';
import { X, Printer, Compass, ShieldCheck, MapPin, Calendar, Tag } from 'lucide-react';

export default function PrintFlyerModal({ item, isOpen, onClose }) {
  const printAreaRef = useRef(null);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const isLost = item.type === 'lost';
  const itemUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-campus-border shadow-dropdown overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Action Bar */}
        <div className="p-4 border-b border-campus-border flex items-center justify-between bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-campus-accent" />
            <h3 className="font-semibold text-sm text-campus-navy">
              Printable Campus Notice Flyer
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-campus-navy text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-subtle"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Flyer Preview Sheet */}
        <div className="p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            ref={printAreaRef}
            id="printable-flyer"
            className="w-full max-w-lg bg-white border-2 border-slate-900 p-8 rounded-none shadow-md space-y-6 text-slate-900 print:shadow-none print:border-2 print:border-black print:m-0 print:p-6"
          >
            {/* University Notice Header */}
            <div className="border-b-2 border-black pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-bold">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">Campus Lost &amp; Found</h1>
                  <p className="text-[10px] tracking-wider uppercase text-slate-600 font-semibold">
                    Official Student Community Notice
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-600">
                ID: {item._id.slice(-6).toUpperCase()}
              </div>
            </div>

            {/* Giant Attention Header */}
            <div
              className={`p-4 text-center text-white font-black text-2xl tracking-widest uppercase rounded-lg ${
                isLost ? 'bg-amber-600 text-white' : 'bg-teal-700 text-white'
              }`}
            >
              {isLost ? 'MISSING ITEM NOTICE' : 'FOUND ITEM NOTICE'}
            </div>

            {/* Item Title & Category */}
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
                {item.title}
              </h2>
              <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Category: {item.category}
              </p>
            </div>

            {/* Photo if exists */}
            {item.imageUrl && (
              <div className="w-full h-64 border-2 border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Location & Date Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-300 text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                  Campus Location:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{item.campusLocation}</p>
                {item.locationDetails && (
                  <p className="text-slate-600 text-[11px] mt-0.5">{item.locationDetails}</p>
                )}
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                  Incident Date:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {new Date(item.eventDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                Item Description:
              </span>
              <p className="text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Safe Verification & Portal Link Footer */}
            <div className="p-4 border-2 border-dashed border-slate-400 rounded-lg text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>How to verify ownership:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Log into the university lost &amp; found web portal and submit your claim proof. Private details will be evaluated securely to confirm ownership.
              </p>
              <div className="p-2 bg-slate-100 rounded text-[11px] font-mono break-all text-slate-800 font-semibold select-all">
                {itemUrl}
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-2">
              Authorized Student Notice &bull; Please do not remove until resolved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
