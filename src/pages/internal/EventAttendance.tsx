import React, { useState } from 'react';
import { 
  Calendar, 
  Upload, 
  CheckCircle2, 
  Users, 
  Clock, 
  MapPin, 
  ExternalLink,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { useLandingContentStore } from '../../store/useLandingContentStore';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

export const EventAttendance: React.FC = () => {
  const { events } = useLandingContentStore();
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSimulateImport = () => {
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono-code">
              EVENT & ATTENDANCE OPS
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Đồng bộ dữ liệu vé Google Bevy</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Quản Lý Sự Kiện & Điểm Danh Tự Động
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tỷ lệ tham gia thực tế (Check-in rate) và import danh sách quét QR từ hệ thống Bevy.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSimulateImport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Điểm Danh Bevy (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {importSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã import thành công 142 lượt check-in từ file CSV Google Bevy! Hệ thống đã ghi nhận điểm danh.</span>
        </div>
      )}

      {/* Events Attendance List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((ev, idx) => (
          <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                {ev.category}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tỷ lệ check-in: 88%
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{ev.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDateToDDMMYYYY(ev.date)} • {ev.time}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{ev.location}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">Vé phát hành: <strong>200</strong></span>
                <span className="text-slate-400">|</span>
                <span className="font-semibold text-emerald-700">Check-in: <strong>176</strong></span>
              </div>

              {ev.bevyUrl && (
                <a
                  href={ev.bevyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline text-[11px]"
                >
                  <span>Bevy Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
