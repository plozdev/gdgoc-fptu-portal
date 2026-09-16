import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Trophy, 
  Award,
  CheckCircle2,
  FolderGit2
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

export const GemsLeaderboard: React.FC = () => {
  const { user } = useAuthStore();

  // Dynamically compute leaderboard from completed tasks
  const leaderboardData: LeaderboardUser[] = useMemo(() => {
    try {
      const savedTasks = localStorage.getItem('gdgoc_tasks_v2');
      if (!savedTasks) return [];
      const tasks: Array<{
        id: string;
        assignee: string;
        banId: string;
        gems: number;
        status: string;
      }> = JSON.parse(savedTasks);

      const doneTasks = tasks.filter(t => t.status === 'done');
      if (doneTasks.length === 0) return [];

      const userMap = new Map<string, { name: string; ban: string; gems: number; count: number }>();

      doneTasks.forEach(task => {
        const key = task.assignee.trim();
        const existing = userMap.get(key) || {
          name: key,
          ban: task.banId ? `Ban ${task.banId.toUpperCase()}` : 'GDGoC Member',
          gems: 0,
          count: 0
        };
        existing.gems += Number(task.gems) || 0;
        existing.count += 1;
        userMap.set(key, existing);
      });

      const sorted = Array.from(userMap.values())
        .sort((a, b) => b.gems - a.gems)
        .map((item, index) => ({
          rank: index + 1,
          name: item.name,
          ban: item.ban,
          gems: item.gems,
          tasksCompleted: item.count,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.name)}`
        }));

      return sorted;
    } catch {
      return [];
    }
  }, []);

  // Compute user gems dynamically
  const userGems = useMemo(() => {
    if (!user?.name) return 0;
    const match = leaderboardData.find(u => u.name.toLowerCase().includes(user.name.toLowerCase()));
    return match ? match.gems : 0;
  }, [leaderboardData, user?.name]);

  const userRank = useMemo(() => {
    if (!user?.name) return null;
    const match = leaderboardData.find(u => u.name.toLowerCase().includes(user.name.toLowerCase()));
    return match ? `#${match.rank}` : 'Chưa xếp hạng';
  }, [leaderboardData, user?.name]);

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
          <p className="text-2xl font-black text-white mt-0.5">{userGems} 💎</p>
          <span className="text-[10px] bg-white text-amber-900 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
            {userRank}
          </span>
        </div>
      </div>

      {leaderboardData.length === 0 ? (
        /* Clean Fall 2026 Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500 shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-extrabold text-slate-900">
              Bảng Vàng Fall 2026 Đang Chờ Đón Điểm Thưởng Đầu Tiên
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chưa có nhiệm vụ nào được phê duyệt hoàn thành trong kỳ Fall 2026. Hãy hoàn thành các task trên <strong>Task Board</strong> để tích lũy Gems và ghi danh trên bảng xếp hạng!
            </p>
          </div>
          <div className="pt-2">
            <a
              href="#/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Xem Task Board & Nhận Nhiệm Vụ</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboardData.slice(0, 3).map((u, idx) => (
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
              <span className="text-xs text-slate-500 font-mono-code">Cập nhật theo thời gian thực</span>
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
                  {leaderboardData.map((u) => (
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
        </>
      )}
    </div>
  );
};
