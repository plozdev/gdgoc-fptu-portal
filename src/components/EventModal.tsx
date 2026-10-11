import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Ticket, Sparkles, User, Check, Star, ExternalLink } from 'lucide-react';
import { EventItem } from '../types';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';



interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;
  let registrationUrl: string | undefined;
  try { const url = new URL(event.registrationUrl || ''); if (url.protocol === 'https:') registrationUrl = url.href; } catch { /* Registration has no external form. */ }
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E1E1E]/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[28px] brutal-shadow-lg max-h-[90vh] flex flex-col overflow-hidden"
      >
        
        {/* Modal Top Bar */}
        <div className="bg-[#FFFFFF] border-b-2 border-[#1E1E1E] px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 text-xs font-mono-code font-bold rounded border border-[#1E1E1E]"
              style={{ backgroundColor: event.pastelColor }}
            >
              {event.category}
            </span>
            <span className="font-mono-code text-xs font-bold text-[#1E1E1E]">
              {event.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-[#1E1E1E] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#1E1E1E]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {(
            <>
              {/* Event Title & Summary */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] leading-tight">
                  {event.title}
                </h3>
                <p className="text-sm text-[#1E1E1E]/80 leading-relaxed">
                  {event.summary}
                </p>
              </div>

              {/* Event Date & Location Card */}
              <div className="bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-2xl p-4 space-y-2 text-xs font-mono-code">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#EA4335]" />
                  <span className="font-bold text-[#1E1E1E]">{formatDateToDDMMYYYY(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-[#1E1E1E]/80">
                  <Clock className="w-4 h-4 text-[#FBBC04]" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[#1E1E1E]/80">
                  <MapPin className="w-4 h-4 text-[#4285F4]" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Highlights */}
              {event.highlights && event.highlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm font-mono-code text-[#1E1E1E] uppercase">
                    Điểm Nhấn Nổi Bật Của Sự Kiện:
                  </h4>
                  <div className="space-y-1.5">
                    {event.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#FFFFFF] border border-[#1E1E1E] rounded-xl flex items-center gap-2.5 text-xs font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speaker Card */}
              {event.speaker && (
                <div className="border-2 border-[#1E1E1E] rounded-2xl p-4 flex items-center gap-4 bg-[#FFFFFF]">
                  <div className="w-12 h-12 rounded-full border-2 border-[#1E1E1E] bg-[#C3ECF6] flex items-center justify-center font-bold text-[#4285F4] shrink-0">
                    <User className="w-6 h-6 text-[#1E1E1E]" />
                  </div>
                  <div>
                    <span className="font-mono-code text-[11px] text-[#4285F4] font-bold uppercase">
                      Đơn Vị Chủ Trì / Khách Mời
                    </span>
                    <h4 className="font-extrabold text-base text-[#1E1E1E]">
                      {event.speaker.name}
                    </h4>
                    <p className="text-xs text-[#1E1E1E]/75 font-mono-code">
                      {event.speaker.role} {event.speaker.company ? `• ${event.speaker.company}` : ''}
                    </p>
                  </div>
                </div>
              )}


              <div className="pt-4 border-t-2 border-slate-200">
                {registrationUrl ? <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold">Đăng ký tham dự<ExternalLink className="w-4 h-4" /></a> : <p className="text-sm text-slate-500">Sự kiện chưa mở đăng ký trực tuyến.</p>}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
