import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ExternalLink, ArrowRight, Ticket, Users } from 'lucide-react';
import { useLandingContentStore } from '../store/useLandingContentStore';
import { EventItem } from '../types';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

interface EventsProps {
  onSelectEvent: (event: EventItem) => void;
}

export const Events: React.FC<EventsProps> = ({ onSelectEvent }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const events = useLandingContentStore((s) => s.events);

  const categories = ['ALL', 'Showcase', 'Flagship Event', 'Workshop Series', 'Campus Challenge'];

  const publishedEvents = events.filter((ev) => ev.showOnLanding !== false);

  const filteredEvents =
    activeFilter === 'ALL'
      ? publishedEvents
      : publishedEvents.filter((ev) => ev.category === activeFilter);

  return (
    <section id="events" className="py-20 sm:py-28 bg-[#FFFFFF] relative border-t border-[#1E1E1E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#C3ECF6] border-[2.5px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 04. FLAGSHIP PROGRAMS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Featured Chapter Events
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/85 max-w-2xl">
              From global hackathons to hands-on weekend codelabs. Level up your technical craft alongside peers and mentors.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-2xl brutal-shadow-sm self-start sm:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-[#1E1E1E] text-[#FFFFFF]'
                    : 'text-[#1E1E1E] hover:bg-[#F0F0F0]'
                }`}
              >
                {cat === 'ALL' ? 'All Events' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid (2 columns as in Reference UI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[28px] p-6 sm:p-8 brutal-shadow flex flex-col justify-between transition-all group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Event Category & Status Badges */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className="font-mono-code text-xs font-bold px-3 py-1 rounded-md border-[1.5px] border-[#1E1E1E]"
                    style={{ backgroundColor: event.pastelColor }}
                  >
                    {event.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {event.isHybrid && (
                      <span className="font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-[#1E1E1E] bg-[#FFFFFF] text-[#1E1E1E]">
                        Hybrid
                      </span>
                    )}
                    <span
                      className={`font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-[#1E1E1E] ${
                        event.status === 'Registration Open'
                          ? 'bg-[#CCF6C5] text-[#1E1E1E]'
                          : event.status === 'Opening Soon'
                          ? 'bg-[#FFE7A5] text-[#1E1E1E]'
                          : 'bg-[#F0F0F0] text-[#1E1E1E]'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Event Title */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E] tracking-tight leading-snug">
                  {event.title}
                </h3>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-[#1E1E1E]/80 leading-relaxed font-normal">
                  {event.summary}
                </p>

                {/* Event Meta Box (Gray rounded box with Date, Time, Location) */}
                <div className="p-4 bg-[#F8F9FA] border border-[#1E1E1E]/20 rounded-2xl space-y-2 text-xs font-mono-code text-[#1E1E1E]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#EA4335] shrink-0" />
                    <span className="font-extrabold">{formatDateToDDMMYYYY(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#FBBC04] shrink-0" />
                    <span className="text-[#1E1E1E]/90">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                    <span className="truncate text-[#1E1E1E]/90">{event.location}</span>
                  </div>
                </div>

                {/* Speaker row with circular avatar */}
                {event.speaker && (
                  <div className="pt-2 flex items-center gap-3">
                    <img
                      src={event.speaker.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={event.speaker.name}
                      className="w-10 h-10 rounded-full border-2 border-[#1E1E1E] object-cover shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm text-[#1E1E1E] truncate">
                        {event.speaker.name}
                      </div>
                      <div className="text-[11px] text-[#1E1E1E]/75 font-mono-code truncate">
                        {event.speaker.role}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-6 mt-4 border-t border-[#1E1E1E]/15 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 font-mono-code text-xs font-bold text-[#34A853]">
                  <Ticket className="w-4 h-4 text-[#34A853]" />
                  <span>Free Student Pass</span>
                </div>

                <button
                  onClick={() => onSelectEvent(event)}
                  className="px-5 py-2.5 bg-[#1E1E1E] hover:bg-[#4285F4] text-[#FFFFFF] font-bold text-xs sm:text-sm font-mono-code rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Xem Chi Tiết Sự Kiện</span>
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
