import React from 'react';
import { Compass, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-campus-border bg-white text-campus-muted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-campus-navy flex items-center justify-center text-teal-300">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-semibold text-campus-navy text-base">Campus Lost &amp; Found</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              A centralized student utility for safely reconnecting owners with lost belongings
              across lecture halls, libraries, dining commons, and campus recreation facilities.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-campus-muted">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-campus-accent" /> Privacy-First Claims
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-campus-accent" /> Student Moderated
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-campus-navy">
              Campus Hotspots
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-campus-accent" /> Main Library &amp; Study Carrels
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-campus-accent" /> Student Center &amp; Food Court
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-campus-accent" /> Science &amp; Engineering Complex
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-campus-accent" /> North Campus Quad &amp; Dorms
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-campus-navy">
              System Info
            </h4>
            <p className="text-xs leading-relaxed">
              Matching relies on deterministic backend algorithms evaluating category alignment, location proximity, and keyword overlap.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              MERN Stack Architecture &bull; Node.js &bull; Express &bull; React &bull; MongoDB
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-campus-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} University Campus Lost &amp; Found Portal. Built for college community.</p>
          <div className="flex items-center gap-4">
            <span>Student Privacy Protected</span>
            <span>&bull;</span>
            <span>No Commercial Advertisements</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
