import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ExternalLink, ArrowRight, UserCheck, Tag, CheckCircle2, ChevronRight } from 'lucide-react';
import { EVENTS_DATA } from '../data/gdgData';
import { EventItem } from '../types';

interface EventsProps {
  onSelectEvent: (event: EventItem) => void;
}

export const Events: React.FC<EventsProps> = ({ onSelectEvent }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Showcase', 'Flagship Event', 'Workshop Series', 'Campus Challenge'];

  const filteredEvents =
    activeFilter === 'ALL'
      ? EVENTS_DATA
      : EVENTS_DATA.filter((ev) => ev.category === activeFilter);

  return (
    <section id="events" className="py-20 sm:py-28 bg-[#F0F0F0] border-t-2 border-[#1E1E1E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C3ECF6] border-2 border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 04. PIPELINE SỰ KIỆN FALL 2026</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Featured Events & Challenges
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/75 max-w-2xl">
              Chuỗi sự kiện công nghệ quy mô lớn được thiết kế dành riêng cho sinh viên Đại học FPT TP.HCM xuyên suốt kỳ Fall 2026.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-2xl brutal-shadow-sm overflow-x-auto self-start sm:self-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-[#1E1E1E] text-[#FFFFFF]'
                    : 'text-[#1E1E1E] hover:bg-[#F0F0F0]'
                }`}
              >
                {cat === 'ALL' ? 'Tất Cả (4)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[28px] p-6 sm:p-8 brutal-shadow flex flex-col justify-between transition-all group hover:-translate-y-1"
              style={{
                borderTopWidth: '8px',
                borderTopColor: event.accentColor,
              }}
            >
              <div className="space-y-4">
                {/* Event Category & Status */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className="font-mono-code text-xs font-bold px-3 py-1 rounded-full border border-[#1E1E1E]"
                    style={{ backgroundColor: event.pastelColor }}
                  >
                    {event.category}
                  </span>

                  <span
                    className={`font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#1E1E1E] ${
                      event.status === 'Registration Open'
                        ? 'bg-[#CCF6C5] text-[#1E1E1E] animate-pulse'
                        : event.status === 'Opening Soon'
                        ? 'bg-[#FFE7A5] text-[#1E1E1E]'
                        : 'bg-[#F0F0F0] text-[#1E1E1E]'
                    }`}
                  >
                    ● {event.status}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E] tracking-tight leading-snug">
                  {event.title}
                </h3>

                {/* Event Meta: Date, Time, Location */}
                <div className="space-y-2 py-3 border-y border-[#1E1E1E]/15 text-xs font-mono-code text-[#1E1E1E]/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4285F4] shrink-0" />
                    <span className="font-bold text-[#1E1E1E]">{event.date}</span>
                    <span className="text-[#1E1E1E]/30">•</span>
                    <Clock className="w-3.5 h-3.5 text-[#FBBC04] shrink-0" />
                    <span>{event.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#EA4335] shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-[#1E1E1E]/85 leading-relaxed">
                  {event.summary}
                </p>

                {/* Speaker info */}
                {event.speaker && (
                  <div className="p-3 bg-[#F0F0F0] border border-[#1E1E1E] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono-code text-[10px] text-[#1E1E1E]/60 uppercase block">
                        Chủ trì / Khách mời:
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-[#1E1E1E]">
                        {event.speaker.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono-code font-semibold px-2 py-0.5 bg-[#FFFFFF] rounded border border-[#1E1E1E]">
                      {event.speaker.role}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-6 mt-4 border-t border-[#1E1E1E]/10 flex items-center justify-between">
                <button
                  onClick={() => onSelectEvent(event)}
                  className="w-full py-3 px-5 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] font-bold text-xs sm:text-sm font-mono-code rounded-xl border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Xem Chi Tiết & Đăng Ký Tham Gia</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
