import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  Laptop,
  CreditCard,
  Briefcase,
  Key,
  Shirt,
  BookOpen,
  Coffee,
  Watch,
  HelpCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const categoryIcons = {
  Electronics: Laptop,
  'ID & Cards': CreditCard,
  'Bags & Backpacks': Briefcase,
  Keys: Key,
  'Clothing & Accessories': Shirt,
  'Books & Stationery': BookOpen,
  'Water Bottles & Tumblers': Coffee,
  'Jewelry & Watches': Watch,
  Other: HelpCircle,
};

export default function ItemCard({ item }) {
  const IconComponent = categoryIcons[item.category] || HelpCircle;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isLost = item.type === 'lost';

  return (
    <div className="bg-white rounded-xl border border-campus-border shadow-card hover:shadow-dropdown transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image or Designed Graphic Fallback */}
      <div className="relative h-48 w-full bg-slate-50 border-b border-campus-border overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isLost ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
            }`}>
              <IconComponent className="w-7 h-7" />
            </div>
            <span className="text-xs font-medium text-slate-500">{item.category}</span>
          </div>
        )}

        {/* Type Ribbon */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase shadow-subtle ${
              isLost
                ? 'bg-amber-600 text-white'
                : 'bg-campus-accent text-white'
            }`}
          >
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          {item.status === 'resolved' && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 shadow-subtle">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          )}

          {item.status === 'pending_claim' && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 flex items-center gap-1 shadow-subtle">
              <Clock className="w-3 h-3" /> Under Claim
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category Pill */}
          <div className="flex items-center gap-2 text-xs text-campus-muted">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
              <Tag className="w-3 h-3 text-campus-accent" />
              {item.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base text-campus-navy line-clamp-1 group-hover:text-campus-accent transition-colors">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-campus-muted line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-campus-border text-xs text-campus-muted space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-campus-accent shrink-0" />
              <span className="truncate">{item.campusLocation}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(item.eventDate)}</span>
            </div>
          </div>

          <Link
            to={`/item/${item._id}`}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-campus-navy bg-slate-100/80 hover:bg-campus-navy hover:text-white transition-colors"
          >
            View Details &amp; Match Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
