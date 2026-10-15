import React, { useEffect, useState, useCallback } from "react";
import { generationApi } from "../../api/generation.api";
import { useAuthStore } from "../../store/useAuthStore";
import { useGenerationStore } from "../../store/useGenerationStore";
import {
  Calendar,
  FastForward,
  RotateCcw,
  ShieldAlert,
  Archive,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  Users,
  CheckSquare,
  Award,
  History,
  Info,
  Clock,
  X
} from "lucide-react";

export const GenerationSettings: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const refresh = useGenerationStore((s) => s.fetchGenerationConfig);

  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal xác nhận chuyển đổi
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    kind: "semester" | "tenure";
    targetName: string;
  } | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await generationApi.getGenerationConfig();
      setConfig(data);
    } catch (e: any) {
      setError(e.message || "Không thể tải cấu hình niên khóa");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleOpenConfirm = (kind: "semester" | "tenure") => {
    const targetName =
      kind === "semester"
        ? config?.nextSemester?.name || "Kỳ tiếp theo"
        : `Nhiệm kỳ mới (${config?.currentTenure?.genLabel ? `Gen ${(parseFloat(config.currentTenure.genLabel.replace(/[^0-9.]/g, '')) || 4.0) + 1}.0` : 'Gen tiếp theo'})`;

    setConfirmModal({
      isOpen: true,
      kind,
      targetName,
    });
  };

  const handleExecuteTransition = async () => {
    if (!confirmModal) return;
    const { kind } = confirmModal;

    setBusy(true);
    setError("");
    try {
      const updated = await generationApi.transitionTenure({ kind });
      setConfig(updated);
      await refresh();
      setConfirmModal(null);
    } catch (e: any) {
      setError(e.message || "Quá trình chuyển kỳ thất bại");
    } finally {
      setBusy(false);
    }
  };

  if (user?.readOnly || user?.tier !== "ORG_ADMIN") {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-extrabold text-slate-800">
          Quyền Hạn Bị Giới Hạn
        </h2>
        <p className="text-xs text-slate-500">
          Chỉ Ban Chủ Nhiệm (Chapter Lead & Co-Chapter Lead) mới có quyền chốt kỳ và điều phối niên khóa của CLB.
        </p>
      </div>
    );
  }

  const currentTenure = config?.currentTenure;
  const currentSemester = config?.currentSemester;
  const nextSemester = config?.nextSemester;
  const archivedTenures = config?.archivedTenures || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none pb-12 animate-fadeIn">
      {/* Google 4-Color Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] rounded-full shadow-xs mb-2" />

      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono-code uppercase tracking-wider">
              Lifecycle Governance
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Ban Chủ Nhiệm Quản trị Hệ Thống
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Cấu Hình Niên Khóa & Chuyển Kỳ</span>
            {currentSemester && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-code">
                {currentSemester.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Điều phối chu kỳ học kỳ, chốt sổ bảng xếp hạng Gems, lưu trữ lịch sử và chuyển giao nhân sự giữa các thế hệ.
          </p>
        </div>

        <button
          onClick={() => void load()}
          disabled={busy || isLoading}
          className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-start md:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading || busy ? "animate-spin" : ""}`} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTIVE PERIOD & TRANSITION CONTROL CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Trạng Thái Kỳ Đang Hoạt Động
                </h2>
                <p className="text-xs text-slate-400">
                  Thời điểm vận hành hiện tại của toàn bộ hệ thống GDGoC FPTU OS
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đang Mở</span>
            </span>
          </div>

          {/* Active Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Khóa Hoạt Động (Gen)
              </span>
              <p className="font-mono-code text-base font-extrabold text-purple-700">
                {currentTenure?.genLabel || "Gen 4.0"}
              </p>
              <p className="text-[11px] text-slate-500">
                {currentTenure?.name || "Nhiệm kỳ hiện tại"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 space-y-1">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Học Kỳ Hiện Tại
              </span>
              <p className="font-mono-code text-base font-extrabold text-blue-700">
                {currentSemester?.name || "Chưa cấu hình"}
              </p>
              <p className="text-[11px] text-blue-600/70">
                Đang nhận nộp task & ghi nhận điểm Gems
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Dự Kiến Kỳ Kế Tiếp
              </span>
              <p className="font-mono-code text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>{nextSemester?.name || "Chưa cấu hình"}</span>
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </p>
              <p className="text-[11px] text-slate-500">
                Sẵn sàng khi chốt kỳ này
              </p>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Quy trình vận hành chuyển kỳ & chuyển nhiệm kỳ:</span>
            </div>
            <ul className="space-y-1 pl-6 list-disc text-amber-800/90 leading-relaxed font-normal">
              <li>
                <strong>Chuyển kỳ học (Semester):</strong> Lưu toàn bộ task và Gems kỳ cũ ở chế độ chỉ đọc, kể cả task chưa xong. Kỳ mới bắt đầu với bảng task trống và điểm Gems của kỳ bằng 0; nhân sự, vai trò và số dư tích lũy được giữ nguyên.
              </li>
              <li>
                <strong>Chuyển nhiệm kỳ (Tenure):</strong> Lưu trữ toàn bộ dữ liệu lịch sử của nhiệm kỳ cũ, tăng số thế hệ Gen và sao chép nhân sự sang nhiệm kỳ mới để BCN cấu trúc lại.
              </li>
            </ul>
          </div>

          {/* Transition Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              disabled={busy || !currentSemester}
              onClick={() => handleOpenConfirm("semester")}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FastForward className="w-4 h-4" />
              <span>Chuyển Sang {nextSemester?.name || "Kỳ Kế Tiếp"}</span>
            </button>

            <button
              disabled={busy || !currentSemester}
              onClick={() => handleOpenConfirm("tenure")}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold text-xs shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Chốt & Chuyển Sang Nhiệm Kỳ Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ARCHIVED PERIODS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Lịch Sử Các Kỳ Đã Chốt Sổ ({archivedTenures.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono-code">Archived History</span>
        </div>

        {archivedTenures.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 shadow-xs">
            <Archive className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
            <h3 className="text-sm font-bold text-slate-700">Chưa có kỳ nào được chốt</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Hệ thống hiện đang vận hành kỳ đầu tiên. Sau khi chốt kỳ, bản lưu trữ số liệu (Tasks, Gems, Sự kiện) sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivedTenures.map((s: any) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {s.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {s.genLabel || "Gen 4.0"}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Đã Chốt Sổ
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="font-extrabold text-xs text-slate-800">{s.totalTasks || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">Tasks</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="font-extrabold text-xs text-amber-600">{s.totalGems || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">Gems</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="font-extrabold text-xs text-blue-600">{s.membersCount || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">Member</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="font-extrabold text-xs text-emerald-600">{s.eventsCount || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">Events</p>
                  </div>
                </div>

                {s.archivedAt && (
                  <p className="text-[10px] text-slate-400 font-mono-code pt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>Chốt vào: {new Date(s.archivedAt).toLocaleDateString("vi-VN")}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                {confirmModal.kind === "semester"
                  ? `Chốt Kỳ & Chuyển Sang ${confirmModal.targetName}?`
                  : "Chốt Toàn Bộ & Chuyển Sang Nhiệm Kỳ Mới?"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {confirmModal.kind === "semester"
                  ? "Thao tác này sẽ khóa dữ liệu kỳ hiện tại và mở kỳ mới. Task chưa xong giữ nguyên trạng thái trong lịch sử, không tự cộng Gems và không chuyển sang kỳ mới. BCN có thể xem lại bằng bộ chọn kỳ trên bảng công việc."
                  : "Thao tác này sẽ chốt sổ toàn bộ kỳ hiện tại, lưu trữ hồ sơ nhiệm kỳ cũ và tạo nhiệm kỳ mới. Toàn bộ danh sách nhân sự sẽ được sao chép sang nhiệm kỳ kế tiếp."}
              </p>
              {!!config?.pendingTasks && <p className="mt-2 text-xs font-semibold text-amber-700">Có {config.pendingTasks} task chưa hoàn thành sẽ được lưu trữ nguyên trạng.</p>}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hành động tự động:</span>
              </p>
              <ul className="pl-5 list-disc text-[11px] space-y-0.5 text-slate-500">
                <li>Lưu trữ thống kê Tasks, Gems, Sự kiện</li>
                <li>Khởi tạo học kỳ <strong>{confirmModal.targetName}</strong></li>
                <li>Cập nhật đồng bộ trên toàn bộ tài khoản thành viên</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmModal(null)}
                className="w-1/2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleExecuteTransition()}
                className="w-1/2 px-4 py-2.5 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{busy ? "Đang xử lý..." : "Xác Nhận Chốt"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
