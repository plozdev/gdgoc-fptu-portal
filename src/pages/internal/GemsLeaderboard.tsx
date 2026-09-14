import React from 'react';
import { 
  Award, 
  Sparkles, 
  Trophy, 
  Flame, 
  Gift, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface LeaderboardUser {
  rank: number;
  name: string;
  ban: string;
  gems: number;
  tasksCompleted: number;
  avatar: string;
}

const LEADERBOARD_DATA: LeaderboardUser[] = [
  { rank: 1, name: 'Trần Nguyên Bảo', ban: 'Ban AI', gems: 1450, tasksCompleted: 8, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { rank: 2, name: 'Lê Hoàng Long', ban: 'Ban Web', gems: 1280, tasksCompleted: 7, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { rank: 3, name: 'Vũ Thị Lan Hương', ban: 'Ban Media', gems: 1150, tasksCompleted: 6, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { rank: 4, name: 'Hoàng Minh Tuấn', ban: 'Ban Cloud', gems: 980, tasksCompleted: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { rank: 5, name: 'Bùi Đức Thịnh', ban: 'Ban HR-Event', gems: 920, tasksCompleted: 5, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { rank: 6, name: 'Phạm Quốc Anh', ban: 'Ban Research', gems: 850, tasksCompleted: 4, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
];

export const GemsLeaderboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono-code">
              GAMIFICATION & GEMS SYSTEM
            </span>
            <span className="text-xs text-amber-100">•</span>
            <span className="text-xs text-amber-100 font-medium">Cơ chế vinh danh & đổi thưởng nội bộ</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Bảng Xếp Hạng & Quỹ Điểm Thưởng (Gems)</span>
            <Sparkles className="w-6 h-6 text-yellow-200" />
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
            Tích lũy Gems qua từng nhiệm vụ hoàn thành xuất sắc để thăng cấp danh hiệu và đổi các phần quà độc quyền từ Google Developer Groups.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right shrink-0">
          <p className="text-[11px] text-amber-100 font-medium">Gems Của Bạn ({user?.name})</p>
          <p className="text-2xl font-black text-white mt-0.5">450 💎</p>
          <span className="text-[10px] bg-white text-amber-900 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
            Hạng #8 Toàn CLB
          </span>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LEADERBOARD_DATA.slice(0, 3).map((u, idx) => (
          <div 
            key={u.rank} 
            className={`p-5 rounded-2xl border bg-white shadow-xs relative overflow-hidden ${
              idx === 0 ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-amber-100 text-amber-800'
              }`}>
                #{u.rank}
              </span>
              <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                💎 {u.gems} Gems
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{u.name}</h4>
                <p className="text-xs text-slate-500">{u.ban}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{u.tasksCompleted} nhiệm vụ hoàn thành</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Bảng Xếp Hạng Đóng Góp Kỳ Fall 2026
          </h3>
          <span className="text-xs text-slate-500 font-mono-code">Cập nhật lúc 00:00 hàng ngày</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-16">Hạng</th>
                <th className="px-4 py-3">Thành Viên</th>
                <th className="px-4 py-3">Ban Chuyên Môn</th>
                <th className="px-4 py-3 text-center">Tasks Hoàn Thành</th>
                <th className="px-4 py-3 text-right">Tổng Gems</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LEADERBOARD_DATA.map((u) => (
                <tr key={u.rank} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-center font-black text-slate-800">
                    #{u.rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {u.ban}
                  </td>
                  <td className="px-4 py-3 text-center font-mono-code font-bold text-slate-800">
                    {u.tasksCompleted}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-amber-600 font-mono-code">
                    💎 {u.gems}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
