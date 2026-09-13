import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Ticket, Sparkles, User, Check, Star } from 'lucide-react';
import { EventItem } from '../types';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const [isRsvpDone, setIsRsvpDone] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');

  if (!event) return null;

  const handleRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRsvpDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1E1E]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[28px] brutal-shadow-lg max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top Bar */}
        <div className="sticky top-0 bg-[#FFFFFF] border-b-2 border-[#1E1E1E] px-6 py-4 flex items-center justify-between z-10">
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isRsvpDone ? (
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
                  <span className="font-bold text-[#1E1E1E]">{event.date}</span>
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

              {/* RSVP Form */}
              <form onSubmit={handleRsvp} className="pt-2 space-y-3 border-t-2 border-[#1E1E1E]/10">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-[#1E1E1E]">
                    Đăng Ký Tham Dự Miễn Phí (RSVP)
                  </h4>
                  <p className="text-xs text-[#1E1E1E]/70">
                    Dành cho tất cả sinh viên FPT University và cộng đồng công nghệ. Ban Tổ Chức sẽ gửi vé check-in điện tử qua email.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên *"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Mã số sinh viên (MSSV) *"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="student@fpt.edu.vn *"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Xác Nhận Giữ Chỗ Tham Dự</span>
                </button>
              </form>
            </>
          ) : (
            /* RSVP Success Screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#CCF6C5] border-2 border-[#1E1E1E] mx-auto flex items-center justify-center text-[#34A853]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#1E1E1E]">
                  Đăng Ký Thành Công!
                </h3>
                <p className="text-xs sm:text-sm text-[#1E1E1E]/80 max-w-md mx-auto">
                  Ban Tổ Chức đã ghi nhận đăng ký của bạn <strong>{studentName || 'Sinh viên'}</strong> ({studentId || 'FPTU'}). Thông tin vé tham dự đã được lưu trữ cho email <strong>{studentEmail || 'email của bạn'}</strong>.
                </p>
              </div>

              <div className="bg-[#FFE7A5] border-2 border-[#1E1E1E] rounded-2xl p-4 max-w-md mx-auto text-left text-xs font-mono-code space-y-1.5">
                <div className="font-bold text-[#1E1E1E] truncate">{event.title}</div>
                <div className="text-[#1E1E1E]/80">{event.date} • {event.time}</div>
                <div className="text-[#1E1E1E]/80">{event.location}</div>
                <div className="text-[#34A853] font-bold">Mã vé: GDGOC-{Math.floor(100000 + Math.random() * 900000)}</div>
              </div>

              <button
                onClick={() => {
                  setIsRsvpDone(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#1E1E1E] text-[#FFFFFF] font-bold text-xs font-mono-code rounded-full border-2 border-[#1E1E1E] cursor-pointer"
              >
                Đóng & Quay Lại
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
