import { generationApi } from '../../api/generation.api';
import { MemberProfileLink } from '../../components/members/MemberProfileLink';
import { subscribeSync } from '../../sync/subscriptions';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Trophy, 
  Award,
  CheckCircle2,
  FolderGit2,
  RefreshCw,
  TrendingUp,
  History,
  Coins,
  ArrowUpRight,
  Medal,
  Clock,
  Filter
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { gemsApi } from '../../api/gems.api';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface LeaderboardUser {
  rank: number | null;
  userId?: string;
  name: string;
  mssv?: string;
  ban: string;
  departmentCode?: string;
  gems: number;
  tasksCompleted: number;
  avatar: string;
  delta?: string;
}

interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  reason: string;
  createdAt: string;
  actorId?: string | null;
  actor?: { id: string; fullName: string } | null;
}

const DEPT_FILTER_OPTIONS = [
  { code: 'all', label: 'Tất Cả Các Ban' },
  { code: 'TECH_AI', label: 'Ban AI' },
  { code: 'TECH_CLOUD', label: 'Ban Cloud' },
  { code: 'TECH_WEB', label: 'Ban Web' },
  { code: 'TECH_RESEARCH', label: 'Ban Research' },
  { code: 'MEDIA', label: 'Ban Media' },
  { code: 'HR_EVENT', label: 'Ban HR-Event' },
];

export const GemsLeaderboard: React.FC = () => {
  const { user } = useAuthStore();

  const [periods, setPeriods] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState('');
  useEffect(() => subscribeSync(['semesters', 'scope'], async () => {
    try {
      const c: any = await generationApi.getGenerationConfig();
      setPeriods([c.currentSemester, ...(c.archivedTenures || [])].filter(Boolean));
      setSemesterId(previous => previous || c.currentSemester?.id || '');
      return true;
    } catch {
      setDataError('Không tải được danh sách kỳ. Hệ thống sẽ tự thử lại.');
      return false;
    }
  }), []);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'history'>('leaderboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(user?.gemsBalance ?? 0);
  const [lifetimeBalance, setLifetimeBalance] = useState<number>(user?.gemsBalance ?? 0);
  const [dataError, setDataError] = useState('');
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [transactionPage, setTransactionPage] = useState(1);
  const requestVersion = useRef(0);
  const transactionPages = Math.max(1, Math.ceil(transactionTotal / 15));
  useEffect(() => { setTransactionPage(1); }, [user?.id]);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  // Fetch real leaderboard and transaction history from backend
  const fetchGemsData = useCallback(async () => {
    if (!semesterId) return false;
    const version = ++requestVersion.current;
    setIsLoading(true);
    setDataError('');
    try {
      const params = { limit: 100, semesterId: semesterId || undefined, ...(selectedDept !== 'all' && { departmentCode: selectedDept }) };
      const lbRes: any = await gemsApi.getLeaderboard(params);
      if (version !== requestVersion.current) return false;

      if (lbRes && Array.isArray(lbRes.rankings)) {
        setIsFrozen(Boolean(lbRes.isFrozen));
        const mapped: LeaderboardUser[] = lbRes.rankings.map((r: any) => ({
          rank: r.rank,
          userId: r.userId,
          name: r.fullName || 'Thành viên',
          mssv: r.mssv || '',
          ban: r.departmentName || (r.departmentCode ? `Ban ${r.departmentCode}` : 'GDGoC Member'),
          departmentCode: r.departmentCode,
          gems: r.gemsBalance || 0,
          tasksCompleted: r.tasksCompleted ?? 0,
          avatar: r.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(r.fullName || 'GDGoC')}`,
          delta: r.delta,
        }));
        setLeaderboardUsers(mapped);


      } else {
        // No rankings returned by the server
        setLeaderboardUsers([]);
      }

      // Fetch personal transaction ledger
      try {
        const txRes: any = await gemsApi.getTransactions({ page: transactionPage, limit: 15, semesterId: semesterId || undefined });
        if (version !== requestVersion.current) return false;
        if (txRes && Array.isArray(txRes.transactions)) {
          const lastPage = Math.max(1, Math.ceil((txRes.total ?? 0) / 15));
          if (transactionPage > lastPage) { setTransactionPage(lastPage); return false; }
          setTransactions(txRes.transactions);
          setTransactionTotal(txRes.total ?? 0);
          setLifetimeBalance(txRes.lifetimeBalance ?? 0);
          if (txRes.balance !== undefined) {
            setUserBalance(txRes.balance);
          }
          return true;
        }
        return false;
      } catch (txErr) {
        if (version !== requestVersion.current) return false;
        setDataError('Không tải được số dư và lịch sử Gems. Vui lòng thử lại.');
        return false;
      }
    } catch (err) {
      if (version !== requestVersion.current) return false;
      setDataError('Không tải được bảng xếp hạng. Vui lòng thử lại.');
      return false;
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [selectedDept, semesterId, transactionPage, user?.id, user?.name]);

  useEffect(() => {
    const unsubscribe = subscribeSync(['gems', 'members', 'semesters', 'scope'], fetchGemsData);
    return () => {
      unsubscribe();
      requestVersion.current++;
    };
  }, [fetchGemsData]);
  // Compute user rank
  const userRank = useMemo(() => {
    if (!user?.name) return null;
    const match = leaderboardUsers.find(
      u => (user.id && u.userId === user.id) || 
           (user.name && u.name.toLowerCase().includes(user.name.toLowerCase()))
    );
    return match?.rank ? `#${match.rank}` : 'Chưa xếp hạng';
  }, [leaderboardUsers, user?.id, user?.name]);

  const effectiveGems = userBalance;
  const periodName = periods.find(p=>p.id===semesterId)?.name || 'kỳ đã chọn';

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      <label className="flex gap-3 items-center text-sm">Xem kỳ<select className="border rounded-lg p-2" value={semesterId} onChange={e=>{setTransactionPage(1);setSemesterId(e.target.value);}}>{periods.map(p=><option key={p.id} value={p.id}>{p.name}{p.isClosed ? " · Đã chốt" : ""}</option>)}</select></label>
      {dataError && <p role="alert" className="text-red-700 bg-red-50 p-3 rounded-xl">{dataError}</p>}
      <p className="text-sm text-slate-600">Điểm kỳ được tính từ giao dịch của kỳ đã chọn. Số dư tích lũy trước đây không tự tính vào kỳ này.</p>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono-code">
              GAMIFICATION & GEMS SYSTEM
            </span>
            <span className="text-xs text-amber-100">•</span>
            <span className="text-xs text-amber-100 font-medium">Vinh danh đóng góp theo kỳ</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Bảng Xếp Hạng & Quỹ Điểm Thưởng (Gems)</span>
            <Sparkles className="w-6 h-6 text-yellow-200" />
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
            Gems ghi nhận nhiệm vụ được duyệt và đóng góp tổ chức sự kiện. Bảng xếp hạng chốt riêng theo từng kỳ.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => fetchGemsData()}
            disabled={isLoading}
            className="p-3 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl border border-white/20 text-white transition-all cursor-pointer"
            title="Làm mới bảng xếp hạng"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right min-w-[150px]">
            <p className="text-[11px] text-amber-100 font-medium">Gems trong kỳ ({user?.name || 'Thành viên'})</p>
            <p className="text-2xl font-black text-white mt-0.5">{isLoading ? "…" : effectiveGems} 💎</p>
            <span className="text-[10px] bg-white text-amber-900 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
              {userRank}
            </span>
            <p className="text-xs mt-2">Tích lũy toàn thời gian: {isLoading ? "…" : lifetimeBalance} 💎</p>
          </div>
        </div>
      </div>

      {/* Tabs and Filter Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Bảng Xếp Hạng</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sổ Cái Điểm Thưởng ({transactionTotal})</span>
          </button>
        </div>

        {/* Department Filter (Only for Leaderboard) */}
        {activeTab === 'leaderboard' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Lọc Ban:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {DEPT_FILTER_OPTIONS.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'leaderboard' ? (
        leaderboardUsers.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500 shadow-xs">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-extrabold text-slate-900">
                Bảng xếp hạng {periodName} chưa có dữ liệu
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chưa có nhiệm vụ nào được phê duyệt hoàn thành trong {periodName}. Hãy hoàn thành các task trên <strong>Task Board</strong> để tích lũy Gems và ghi danh trên bảng xếp hạng!
              </p>
            </div>
            <div className="pt-2">
              <a
                href="/app/tasks"
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
              {leaderboardUsers.filter(u => u.gems > 0).slice(0, 3).map((u, idx) => (
                <div 
                  key={u.userId} 
                  className={`p-5 rounded-2xl border bg-white shadow-xs relative overflow-hidden transition-all hover:shadow-md ${
                    idx === 0 
                      ? 'border-amber-400 ring-2 ring-amber-200' 
                      : idx === 1 
                      ? 'border-slate-300' 
                      : 'border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {u.rank ? `#${u.rank}` : "—"}
                    </span>
                    <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                      💎 {u.gems} Gems
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MemberProfileLink id={u.userId}><img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" /></MemberProfileLink>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate"><MemberProfileLink id={u.userId}>{u.name}</MemberProfileLink></h4>
                      <p className="text-xs text-slate-500 truncate">{u.ban}</p>
                      {u.delta && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{u.delta}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full Leaderboard Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-600" />
                  <span>Bảng Xếp Hạng Đóng Góp · {periodName}</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">Hạng</th>
                      <th className="px-4 py-3">Thành Viên</th>
                      <th className="px-4 py-3">Ban Chuyên Môn</th>
                      <th className="px-4 py-3 text-center">Tăng Trưởng</th>
                      <th className="px-4 py-3 text-right">Tổng Gems</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboardUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-center font-black text-slate-800">
                          {u.rank ? `#${u.rank}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <MemberProfileLink id={u.userId}><img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" /></MemberProfileLink>
                            <div>
                              <MemberProfileLink id={u.userId} className="font-bold text-slate-900 block leading-tight">{u.name}</MemberProfileLink>
                              {u.mssv && <span className="text-[10px] text-slate-400 font-mono-code">{u.mssv}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {u.ban}
                        </td>
                        <td className="px-4 py-3 text-center font-mono-code font-bold text-emerald-600">
                          {u.delta || '--'}
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
        )
      ) : (
        /* Sổ cái giao dịch Gems */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Lịch Sử Giao Dịch & Cộng Thưởng Gems</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono-code">Dữ liệu từ bảng gems_transactions</span>
          </div>

          {transactions.length === 0 && !isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Coins className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Chưa có giao dịch Gems nào được ghi nhận cho tài khoản của bạn.</p>
              <p className="text-[11px] text-slate-400">Hoàn thành nhiệm vụ trên Task Board để nhận Gems thưởng tự động.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Loại Giao Dịch</th>
                    <th className="px-4 py-3">Lý Do / Chi Tiết</th>
                    <th className="px-4 py-3">Người thực hiện</th>
                    <th className="px-4 py-3">Thời Gian</th>
                    <th className="px-4 py-3 text-right">Số Gems</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    const typeLabelMap: Record<string, string> = {
                      TASK_REWARD: 'Thưởng Hoàn Thành Task',
                      EVENT_CONTRIBUTION: tx.amount < 0 ? 'Thu Hồi Đóng Góp Sự Kiện' : 'Đóng Góp Sự Kiện',
                      HONOR_AWARD: 'Khen Thưởng Đóng Góp',
                      GIFT_REDEMPTION: 'Đổi Quà Tặng',
                      MANUAL_ADJUSTMENT: 'Điều Chỉnh Thủ Công',
                    };

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'TASK_REWARD' ? 'bg-emerald-100 text-emerald-800' :
                            tx.type === 'GIFT_REDEMPTION' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {typeLabelMap[tx.type] || tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {tx.reason || 'Cộng điểm thưởng tự động'}
                        </td>
                        <td className="px-4 py-3"><MemberProfileLink id={tx.actor?.id}>{tx.actor?.fullName || (tx.type === 'MANUAL_ADJUSTMENT' ? 'Chưa ghi nhận (lịch sử cũ)' : 'Hệ thống')}</MemberProfileLink></td>
                        <td className="px-4 py-3 text-slate-400 font-mono-code text-[11px]">
                          {formatDateToDDMMYYYY(tx.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right font-black font-mono-code">
                          <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>
                            {isPositive ? `+${tx.amount}` : tx.amount} 💎
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {isLoading && <p role="status" className="p-4 text-sm text-slate-500">Đang tải lịch sử Gems...</p>}
          {transactionTotal > 0 && <nav aria-label="Phân trang lịch sử Gems" className="p-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs">
            <span>{(transactionPage - 1) * 15 + 1}–{Math.min(transactionPage * 15, transactionTotal)} / {transactionTotal} giao dịch · Trang {transactionPage}/{transactionPages}</span>
            <div className="flex gap-2">
              <button type="button" disabled={isLoading || transactionPage <= 1} onClick={() => setTransactionPage(page => page - 1)} className="px-3 py-2 border rounded-lg disabled:opacity-40">Trang trước</button>
              <button type="button" disabled={isLoading || transactionPage >= transactionPages} onClick={() => setTransactionPage(page => page + 1)} className="px-3 py-2 border rounded-lg disabled:opacity-40">Trang sau</button>
            </div>
          </nav>}
        </div>
      )}
    </div>
  );
};

