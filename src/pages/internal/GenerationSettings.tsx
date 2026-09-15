import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Archive, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Save, 
  Layers,
  ArrowRight,
  Check,
  Clock,
  Send,
  Lock
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useGenerationStore } from '../../store/useGenerationStore';

export const GenerationSettings: React.FC = () => {
  const { user } = useAuthStore();

  // 🚨 CRITICAL RULE: Member và Lead sẽ không thể xem mục cấu hình niên khóa
  if (user?.tier !== 'ORG_ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const { 
    currentGen, 
    currentSemester, 
    startMonthYear, 
    endMonthYear, 
    allowTaskSubmission, 
    allowRsvp, 
    freezeLeaderboard, 
    chapterLead, 
    coChapterLead, 
    archivedSemesters, 
    updateConfig, 
    performTransition 
  } = useGenerationStore();

  const isOrgAdmin = true;

  const [activeTab, setActiveTab] = useState<'current' | 'wizard' | 'archives'>('current');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local form state for Tab 1 (Current Config)
  const [genInput, setGenInput] = useState(currentGen);
  const [semesterInput, setSemesterInput] = useState(currentSemester);
  const [startMonthInput, setStartMonthInput] = useState(startMonthYear);
  const [endMonthInput, setEndMonthInput] = useState(endMonthYear);
  const [tasksToggle, setTasksToggle] = useState(allowTaskSubmission);
  const [rsvpToggle, setRsvpToggle] = useState(allowRsvp);
  const [freezeToggle, setFreezeToggle] = useState(freezeLeaderboard);

  // Wizard state for Tab 2 (Transition Wizard)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [transitionType, setTransitionType] = useState<'semester' | 'generation'>('semester');
  const [newGenInput, setNewGenInput] = useState('Gen 4 (2025 - 2026)');
  const [newSemesterInput, setNewSemesterInput] = useState('Spring 2027');
  const [newStartMonth, setNewStartMonth] = useState('02/2027');
  const [newEndMonth, setNewEndMonth] = useState('05/2027');
  const [carryOverTeam, setCarryOverTeam] = useState(true);
  const [sendBroadcast, setSendBroadcast] = useState(true);
  const [transitionSuccess, setTransitionSuccess] = useState(false);

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrgAdmin) return;

    updateConfig({
      currentGen: genInput.trim(),
      currentSemester: semesterInput.trim(),
      startMonthYear: startMonthInput.trim(),
      endMonthYear: endMonthInput.trim(),
      allowTaskSubmission: tasksToggle,
      allowRsvp: rsvpToggle,
      freezeLeaderboard: freezeToggle,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExecuteTransition = () => {
    if (!isOrgAdmin) return;

    performTransition({
      targetType: transitionType,
      newGen: newGenInput.trim(),
      newSemester: newSemesterInput.trim(),
      startMonthYear: newStartMonth.trim(),
      endMonthYear: newEndMonth.trim(),
      carryOverCoreTeam: carryOverTeam,
      notifyAllMembers: sendBroadcast,
    });

    setGenInput(newGenInput.trim());
    setSemesterInput(newSemesterInput.trim());
    setStartMonthInput(newStartMonth.trim());
    setEndMonthInput(newEndMonth.trim());

    setTransitionSuccess(true);
    setWizardStep(1);
    setTimeout(() => {
      setTransitionSuccess(false);
      setActiveTab('current');
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono-code">
              QUẢN TRỊ NIÊN KHÓA & CHUYỂN KỲ
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Hệ điều hành nội bộ GDGoC-OS</span>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <span>{currentGen}</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-blue-600">Học Kỳ {currentSemester}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-code font-bold">
              {startMonthYear} - {endMonthYear}
            </span>
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Quản lý vòng đời hoạt động của CLB, lưu trữ dữ liệu các kỳ trước và thiết lập thời gian bàn giao nhiệm kỳ.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              Trạng thái: Đang Hoạt Động
            </div>
            <div className="text-[10px] text-slate-500">
              Leader: <strong>{chapterLead}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Notice for Non-Admins */}
      {!isOrgAdmin && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 text-xs text-blue-800">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Bạn đang xem ở chế độ <strong>Read-Only</strong> (Chỉ đọc). Chỉ <strong>Chapter Lead / Co-Chapter Lead</strong> mới có đặc quyền thay đổi cấu hình hoặc thực hiện chuyển kỳ.
          </span>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu các thiết lập cấu hình niên khóa & học kỳ thành công!</span>
        </div>
      )}

      {/* Transition Success Alert */}
      {transitionSuccess && (
        <div className="bg-indigo-50 border-2 border-indigo-300 text-indigo-900 p-5 rounded-xl text-xs font-bold space-y-1 animate-fadeIn">
          <div className="flex items-center gap-2 text-sm text-indigo-700">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Kích Hoạt Nhiệm Kỳ Mới Thành Công!</span>
          </div>
          <p className="text-slate-600 font-normal">
            Hệ thống đã lưu trữ dữ liệu kỳ cũ, chuyển trạng thái sang <strong>{newSemesterInput} - {newGenInput}</strong> và tự động gửi thông báo Broadcast tới toàn thể thành viên.
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('current')}
          className={`py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'current'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Cấu Hình Kỳ Hiện Tại</span>
        </button>

        {isOrgAdmin && (
          <button
            onClick={() => setActiveTab('wizard')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wizard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>2. Quy Trình Chuyển Kỳ / Niên Khóa Mới</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('archives')}
          className={`py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'archives'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Archive className="w-4 h-4 text-slate-500" />
          <span>3. Lịch Sử Các Nhiệm Kỳ ({archivedSemesters.length})</span>
        </button>
      </div>

      {/* TAB 1: CURRENT CONFIGURATION */}
      {activeTab === 'current' && (
        <form
          onSubmit={handleSaveCurrent}
          className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-6"
        >
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Thông Tin Nhiệm Kỳ Đang Chạy
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật tên gọi, mốc thời gian học kỳ theo định dạng MM/yyyy và các công tắc vận hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Niên Khóa (Generation)
              </label>
              <input
                type="text"
                disabled={!isOrgAdmin}
                value={genInput}
                onChange={(e) => setGenInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Học Kỳ (Semester)
              </label>
              <input
                type="text"
                disabled={!isOrgAdmin}
                value={semesterInput}
                onChange={(e) => setSemesterInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tháng Bắt Đầu (MM/yyyy)
              </label>
              <input
                type="text"
                disabled={!isOrgAdmin}
                placeholder="09/2026"
                value={startMonthInput}
                onChange={(e) => setStartMonthInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tháng Kết Thúc (MM/yyyy)
              </label>
              <input
                type="text"
                disabled={!isOrgAdmin}
                placeholder="01/2027"
                value={endMonthInput}
                onChange={(e) => setEndMonthInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Operation Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800">
              Công Tắc Vận Hành Nhiệm Kỳ
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isOrgAdmin}
                  checked={tasksToggle}
                  onChange={(e) => setTasksToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Cho Phép Nộp Task</div>
                  <div className="text-[10px] text-slate-500">Member có thể submit minh chứng task</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isOrgAdmin}
                  checked={rsvpToggle}
                  onChange={(e) => setRsvpToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Mở Đăng Ký Sự Kiện</div>
                  <div className="text-[10px] text-slate-500">Cho phép sinh viên đăng ký vé sự kiện</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isOrgAdmin}
                  checked={freezeToggle}
                  onChange={(e) => setFreezeToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Chốt Bảng Xếp Hạng Gems</div>
                  <div className="text-[10px] text-slate-500">Khóa cộng điểm để trao giải thưởng kỳ</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit button for Org Admin */}
          {isOrgAdmin && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Cấu Hình Hiện Tại</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB 2: TRANSITION WIZARD */}
      {activeTab === 'wizard' && isOrgAdmin && (
        <div className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-6">
          {/* Wizard Step Indicator */}
          <div className="flex items-center justify-between max-w-2xl mx-auto px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold">
            <div className={`flex items-center gap-2 ${wizardStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-code ${
                wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </span>
              <span>Tổng Kết Kỳ Cũ</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <div className={`flex items-center gap-2 ${wizardStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-code ${
                wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </span>
              <span>Thiết Lập Kỳ Mới</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <div className={`flex items-center gap-2 ${wizardStep >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-code ${
                wizardStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span>Xác Nhận & Bàn Giao</span>
            </div>
          </div>

          {/* STEP 1: SUMMARY */}
          {wizardStep === 1 && (
            <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Bước 1: Chốt Số Liệu Kỳ {currentSemester} ({startMonthYear} - {endMonthYear})
                </h3>
                <p className="text-xs text-slate-500">
                  Hệ thống sẽ lưu snapshot toàn bộ các chỉ số dưới đây vào kho lưu trữ vĩnh viễn:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
                  <div className="text-2xl font-black text-blue-700">18</div>
                  <div className="text-[11px] text-blue-900 font-semibold mt-1">Công Việc Đã Xử Lý</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
                  <div className="text-2xl font-black text-amber-700">15,200 💎</div>
                  <div className="text-[11px] text-amber-900 font-semibold mt-1">Gems Tích Lũy</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                  <div className="text-2xl font-black text-emerald-700">52</div>
                  <div className="text-[11px] text-emerald-900 font-semibold mt-1">Thành Viên 6 Ban</div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-center">
                  <div className="text-2xl font-black text-indigo-700">4</div>
                  <div className="text-[11px] text-indigo-900 font-semibold mt-1">Sự Kiện Đã Tổ Chức</div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Tiếp tục: Cấu hình kỳ mới</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SETUP NEW TERM */}
          {wizardStep === 2 && (
            <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Bước 2: Thiết Lập Thông Tin Học Kỳ / Niên Khóa Mới
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn hình thức chuyển kỳ phù hợp và điền các mốc thời gian MM/yyyy:
                </p>
              </div>

              {/* Transition Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => {
                    setTransitionType('semester');
                    setNewSemesterInput('Spring 2027');
                    setNewGenInput(currentGen);
                    setNewStartMonth('02/2027');
                    setNewEndMonth('05/2027');
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    transitionType === 'semester'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs text-slate-900 mb-1 flex items-center justify-between">
                    <span>Chuyển Học Kỳ Mới (Semester)</span>
                    {transitionType === 'semester' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Giữ nguyên Niên khóa hiện tại ({currentGen}), kích hoạt học kỳ tiếp theo (VD: Spring 2027).
                  </p>
                </div>

                <div
                  onClick={() => {
                    setTransitionType('generation');
                    setNewSemesterInput('Fall 2027');
                    setNewGenInput('Gen 5 (2026 - 2027)');
                    setNewStartMonth('09/2027');
                    setNewEndMonth('01/2028');
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    transitionType === 'generation'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs text-slate-900 mb-1 flex items-center justify-between">
                    <span>Chuyển Sang Niên Khóa Mới (Gen)</span>
                    {transitionType === 'generation' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Bàn giao sang thế hệ Core Team mới (VD: Gen 5) và khởi động năm học mới.
                  </p>
                </div>
              </div>

              {/* Form Input for New Term */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Niên Khóa Mới
                  </label>
                  <input
                    type="text"
                    value={newGenInput}
                    onChange={(e) => setNewGenInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Học Kỳ Mới
                  </label>
                  <input
                    type="text"
                    value={newSemesterInput}
                    onChange={(e) => setNewSemesterInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tháng Bắt Đầu Mới (MM/yyyy)
                  </label>
                  <input
                    type="text"
                    placeholder="02/2027"
                    value={newStartMonth}
                    onChange={(e) => setNewStartMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tháng Kết Thúc Mới (MM/yyyy)
                  </label>
                  <input
                    type="text"
                    placeholder="05/2027"
                    value={newEndMonth}
                    onChange={(e) => setNewEndMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Tiếp tục: Bàn giao & Thông báo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & BROADCAST */}
          {wizardStep === 3 && (
            <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Bước 3: Xác Nhận Bàn Giao & Tự Động Gửi Thông Báo
                </h3>
                <p className="text-xs text-slate-500">
                  Kiểm tra các tùy chọn chuyển giao trước khi kích hoạt chính thức:
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carryOverTeam}
                    onChange={(e) => setCarryOverTeam(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Kế Thừa Nhân Sự Core Team & Thành Viên</div>
                    <div className="text-[11px] text-slate-500">Giữ nguyên danh sách 52 thành viên 6 ban sang kỳ mới mà không cần import lại</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendBroadcast}
                    onChange={(e) => setSendBroadcast(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tự Động Bắn Thông Báo Toàn CLB</div>
                    <div className="text-[11px] text-slate-500">Gửi thông báo broadcast tới chuông thông báo của tất cả thành viên báo chuyển kỳ thành công</div>
                  </div>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Hành động này sẽ đóng học kỳ <strong>{currentSemester}</strong> và chuyển dữ liệu sang chế độ Lưu Trữ (Read-Only). Kỳ mới <strong>{newSemesterInput} ({newStartMonth} - {newEndMonth})</strong> sẽ trở thành môi trường vận hành chính thức!
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransition}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xác Nhận Kích Hoạt Kỳ Mới Ngay</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARCHIVED SEMESTERS HISTORY */}
      {activeTab === 'archives' && (
        <div className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Lịch Sử Lưu Trữ Các Nhiệm Kỳ Trước
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tra cứu thành tích, số lượng công việc và tổng gems của các thế hệ và học kỳ tiền nhiệm:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivedSemesters.map((arch) => (
              <div
                key={arch.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase font-mono-code">
                    {arch.gen}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Đã Lưu Trữ ({arch.archivedAt})
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Học Kỳ {arch.semesterName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono-code">
                    Thời gian: {arch.startMonthYear} - {arch.endMonthYear}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <div className="text-xs font-black text-blue-700">{arch.totalTasks}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Tasks</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <div className="text-xs font-black text-amber-700">{arch.totalGems.toLocaleString()} 💎</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Gems</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <div className="text-xs font-black text-emerald-700">{arch.membersCount}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Members</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>Chapter Lead nhiệm kỳ: <strong>{arch.chapterLead}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
