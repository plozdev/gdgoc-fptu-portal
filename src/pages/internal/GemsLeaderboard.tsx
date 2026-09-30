import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trophy, 
  Award, 
  CheckCircle2, 
  FolderGit2, 
  Gift, 
  ShoppingBag, 
  Loader2, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { gemsApi, giftsApi } from '../../api';

interface LeaderboardItem {
  rank: number;
  userId: string;
  fullName: string;
  mssv: string;
  avatarUrl?: string;
  departmentName: string;
  departmentCode?: string;
  gemsBalance: number;
  delta: string;
}

interface GiftItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  gemsPrice: number;
  stock: number;
}

export const GemsLeaderboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'shop'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [lbRes, giftsRes] = await Promise.all([
        gemsApi.getLeaderboard({ limit: 50 }),
        giftsApi.getGifts(),
      ]);
      const lbData = (lbRes as any)?.rankings || (lbRes as any)?.items || (Array.isArray(lbRes) ? lbRes : []);
      setLeaderboard(lbData);
      setGifts(Array.isArray(giftsRes) ? giftsRes : (giftsRes as any)?.items || []);
    } catch (err) {
      console.error('Failed to load gems/gifts data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeemGift = async (gift: GiftItem) => {
    if (!confirm(`Bạn có chắc chắn muốn dùng ${gift.gemsPrice} Gems để đổi "${gift.name}"?`)) {
      return;
    }

    setRedeemingId(gift.id);
    setRedeemSuccess(null);
    setRedeemError(null);

    try {
      await giftsApi.redeemGift(gift.id);
      setRedeemSuccess(`Đổi thành công phần quà "${gift.name}"! Đơn đổi quà đang chờ BCN giao nhận.`);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to redeem gift:', err);
      setRedeemError(err.response?.data?.message || err.message || 'Không đủ số dư Gems hoặc quà đã hết hàng');
    } finally {
      setRedeemingId(null);
    }
  };

  // Find my current rank & balance
  const myItem = leaderboard.find(
    (item) => item.userId === user?.id || item.fullName === user?.name || item.mssv === user?.mssv
  );
  const myGems = myItem?.gemsBalance ?? (user as any)?.gemsBalance ?? 0;
  const myRank = myItem ? `#${myItem.rank}` : 'Chưa xếp hạng';

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono-code">
              GAMIFICATION & GEMS SYSTEM
            </span>
            <span className="text-xs text-amber-100">•</span>
            <span className="text-xs text-amber-100 font-medium">Cơ chế vinh danh & đổi thưởng nội bộ GDGoC</span>
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
          <p className="text-2xl font-black text-white mt-0.5">{myGems} 💎</p>
          <span className="text-[10px] bg-white text-amber-900 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
            {myRank}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Bảng Xếp Hạng ({leaderboard.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'shop'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-pink-400" />
          <span>Cửa Hàng Đổi Quà ({gifts.length})</span>
        </button>
      </div>

      {/* Feedback alerts */}
      {redeemSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{redeemSuccess}</span>
        </div>
      )}

      {redeemError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{redeemError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-amber-600 gap-2 font-medium text-xs">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Đang đồng bộ dữ liệu Gamification từ PostgreSQL...</span>
        </div>
      ) : activeTab === 'leaderboard' ? (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((item, idx) => (
                <div 
                  key={item.userId || idx} 
                  className={`p-5 rounded-2xl border bg-white shadow-xs relative overflow-hidden ${
                    idx === 0 ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      #{item.rank}
                    </span>
                    <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                      💎 {item.gemsBalance} Gems
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {item.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{item.fullName}</h4>
                      <p className="text-xs text-slate-500">{item.departmentName || 'Thành Viên GDGoC'}</p>
                      {item.delta && item.delta !== '0 tuần này' && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{item.delta}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bảng Xếp Hạng Đóng Góp Điểm Thưởng (Gems)
              </h3>
              <span className="text-xs text-slate-500 font-mono-code">Tính toán theo sổ cái Gems ACID</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">Hạng</th>
                    <th className="px-4 py-3">Thành Viên</th>
                    <th className="px-4 py-3">MSSV</th>
                    <th className="px-4 py-3">Ban Chuyên Môn</th>
                    <th className="px-4 py-3">Tăng Trưởng</th>
                    <th className="px-4 py-3 text-right">Tổng Gems</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Chưa có dữ liệu xếp hạng trong kỳ này.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((item) => (
                      <tr key={item.userId || item.rank} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-center font-bold">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-[11px] ${
                            item.rank === 1 
                              ? 'bg-amber-100 text-amber-800' 
                              : item.rank === 2 
                              ? 'bg-slate-200 text-slate-800' 
                              : item.rank === 3 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'text-slate-500'
                          }`}>
                            {item.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {item.fullName.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{item.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono-code text-slate-600 font-semibold">{item.mssv}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{item.departmentName || 'Thành Viên'}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 text-[11px]">
                          {item.delta || '0 tuần này'}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-amber-600 font-mono-code text-xs">
                          {item.gemsBalance} 💎
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Gift Shop Tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gifts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <Gift className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold">Hiện chưa có quà tặng nào trong kho đổi thưởng.</p>
            </div>
          ) : (
            gifts.map((gift) => {
              const canAfford = myGems >= gift.gemsPrice;
              const inStock = gift.stock > 0;
              const isRedeeming = redeemingId === gift.id;

              return (
                <div key={gift.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {gift.imageUrl ? (
                      <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                    ) : (
                      <Gift className="w-12 h-12 text-slate-300" />
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white rounded-md text-[10px] font-bold backdrop-blur-xs font-mono-code">
                      Còn: {gift.stock}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{gift.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{gift.description || 'Quà tặng độc quyền từ GDGoC FPTU.'}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black text-amber-600 font-mono-code">
                        {gift.gemsPrice} 💎
                      </span>

                      <button
                        onClick={() => handleRedeemGift(gift)}
                        disabled={!canAfford || !inStock || isRedeeming}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          canAfford && inStock
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isRedeeming ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Đang Đổi...</span>
                          </>
                        ) : !inStock ? (
                          <span>Hết Hàng</span>
                        ) : !canAfford ? (
                          <span>Thiếu {gift.gemsPrice - myGems} 💎</span>
                        ) : (
                          <span>Đổi Ngay</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
