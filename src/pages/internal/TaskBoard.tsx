import { eventsApi } from '../../api/events.api';
import { useGenerationStore } from '../../store/useGenerationStore';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Send, 
  Check, 
  Trash2, 
  Sparkles,
  Link2, 
  Lock, 
  LayoutGrid, 
  List, 
  FolderGit2, 
  UserCheck, 
  RefreshCw,
  Play,
  RotateCcw,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { BAN_NAMES, BanId } from '../../types/auth';
import { DateInput } from '../../components/common/DateInput';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';
import { useMemberStore, Member } from '../../store/useMemberStore';
import { tasksApi } from '../../api/tasks.api';

export type TaskLevel = 'BCN_TO_LEAD' | 'LEAD_TO_MEMBER';

export const BAN_ID_TO_DEPT_CODE: Record<BanId, string> = {
  ai: 'TECH_AI',
  cloud: 'TECH_CLOUD',
  web: 'TECH_WEB',
  research: 'TECH_RESEARCH',
  media: 'MEDIA',
  'hr-event': 'HR_EVENT',
};

export const DEPT_CODE_TO_BAN_ID: Record<string, BanId> = {
  TECH_AI: 'ai',
  TECH_CLOUD: 'cloud',
  TECH_WEB: 'web',
  TECH_RESEARCH: 'research',
  MEDIA: 'media',
  HR_EVENT: 'hr-event',
};

// Helper: lấy thông tin Trưởng Ban thực tế từ danh sách thành viên trong DB
export const getBanLead = (banId: BanId, mems: Member[]): Member | undefined => {
  return mems.find(
    m => m.banId === banId && m.tier === 'BAN_LEAD' && ['ACTIVE','PROBATION'].includes(m.status)
  );
};

export interface Task {
  id: string;
  title: string;
  description: string;
  banId: BanId;
  level: TaskLevel; // BCN_TO_LEAD hoặc LEAD_TO_MEMBER
  project: string; // Chiến dịch / Dự án / Milestone
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee: string;
  assigneeUserId?: string;
  gems: number;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  submissionProof?: string;
  deadline?: string;
  completedAt?: string;
}



const parseDDMMYYYYtoIso = (str: string): string => {
  if (!str) return new Date(Date.now() + 7 * 86400000).toISOString();
  if (str.includes('-')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const parts = str.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day, 23, 59, 59);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date(Date.now() + 7 * 86400000).toISOString();
};

const mapBackendTaskToFrontend = (item: any): Task => {
  const deptCode = item.department?.code || '';
  const banId: BanId = DEPT_CODE_TO_BAN_ID[deptCode] || 'ai';
  
  const statusMap: Record<string, 'todo' | 'in_progress' | 'review' | 'done'> = {
    TODO: 'todo',
    BACKLOG: 'todo',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'review',
    DONE: 'done',
    OVERDUE: 'todo',
  };

  const priorityMap: Record<string, 'Cao' | 'Trung bình' | 'Thấp'> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    URGENT: 'Cao',
  };

  const firstAssignee = item.assignees?.[0]?.user;
  const assigneeName = firstAssignee
    ? `${firstAssignee.fullName || firstAssignee.email}`
    : 'Chưa phân công';

  // Determine hierarchy level
  const isBcnToLead = item.assignees?.some((a: any) => 
    a.role === 'PRIMARY' || a.user?.role === 'LEAD' || a.user?.role === 'DEPARTMENT_LEAD'
  ) || false;

  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    banId,
    level: isBcnToLead ? 'BCN_TO_LEAD' : 'LEAD_TO_MEMBER',
    project: item.event?.title || 'Vận Hành Thường Nhật',
    status: statusMap[item.status] || 'todo',
    assignee: assigneeName,
    assigneeUserId: firstAssignee?.id,
    gems: item.gemsReward ?? 20,
    priority: priorityMap[item.priority] || 'Trung bình',
    submissionProof: item.submissionUrl || undefined,
    completedAt: item.completedAt,
    deadline: item.deadline ? item.deadline : undefined,
  };
};

export const TaskBoard: React.FC = () => {
  const { user } = useAuthStore();
  const { members, fetchMembers } = useMemberStore();

  const currentSemester = useGenerationStore(s=>s.currentSemester);
  const currentSemesterId = useGenerationStore(s=>s.currentSemesterId);
  const [eventOptions,setEventOptions] = useState<any[]>([]);
  useEffect(()=>{void eventsApi.getEvents().then((events:any)=>setEventOptions(Array.isArray(events)?events:[])).catch(()=>{});},[]);
  const [doneDays, setDoneDays] = useState(14);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const PROJECTS_LIST = ['Tất Cả Dự Án',...new Set(tasks.map(t=>t.project))];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  }, []);

  // Fetch real tasks from backend API
  const loadTasksFromApi = useCallback(async (nextPage = 1) => {
    try {
      setIsLoading(true);
      const res: any = await tasksApi.getTasks({ limit: 100, page: nextPage, doneDays, semesterId: user?.readOnly ? 'all' : currentSemesterId || undefined });
      const rawList = Array.isArray(res) ? res : res?.data || [];
      const mappedTasks = rawList.map(mapBackendTaskToFrontend);
      setTasks(prev=>nextPage===1?mappedTasks:[...prev,...mappedTasks]);
      setPage(nextPage);setTotal(res.total ?? mappedTasks.length);
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải công việc', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasksFromApi();
    fetchMembers();
  }, [loadTasksFromApi, fetchMembers]);

  useEffect(()=>{const refresh=()=>void loadTasksFromApi();window.addEventListener('gdgoc:refresh',refresh);return()=>window.removeEventListener('gdgoc:refresh',refresh);},[loadTasksFromApi]);
  // RBAC checks
  const isOrgAdmin = !user?.readOnly && user?.tier === 'ORG_ADMIN';
  const isLead = !user?.readOnly && (user?.tier === 'BAN_LEAD' || isOrgAdmin);
  const isMember = !user?.readOnly && user?.tier === 'BAN_MEMBER';

  // Trưởng Ban chỉ xem được Ban của mình!
  const [selectedBan, setSelectedBan] = useState<string>(isOrgAdmin ? 'all' : (user?.banId || 'ai'));

  useEffect(() => {
    if (isOrgAdmin) {
      setSelectedBan('all');
    } else if (user?.banId) {
      setSelectedBan(user.banId);
    }
  }, [user?.id, user?.tier, user?.banId, isOrgAdmin]);

  // Filters
  const [selectedProject, setSelectedProject] = useState<string>('Tất Cả Dự Án');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'BCN_TO_LEAD' | 'LEAD_TO_MEMBER'>('all');
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Modals
  const [submitModalTask, setSubmitModalTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newGems, setNewGems] = useState(50);
  const [newPriority, setNewPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Cao');
  const [newDeadline, setNewDeadline] = useState('');
  const [selectedCreateBan, setSelectedCreateBan] = useState<BanId>('ai');
  const [selectedMemberAssigneeId, setSelectedMemberAssigneeId] = useState<string>('');

  const activeBanScope = user?.readOnly ? 'all' : isOrgAdmin ? selectedBan : (user?.banId || 'ai');

  // Khi thay đổi ban trong modal tạo task, tự động chọn Trưởng Ban thực tế của ban đó
  const handleBanChange = (ban: BanId) => {
    setSelectedCreateBan(ban);
    const lead = getBanLead(ban, members);
    if (lead) {
      setSelectedMemberAssigneeId(lead.id);
    } else {
      const banMems = members.filter(m => m.banId === ban && ['ACTIVE', 'PROBATION'].includes(m.status));
      setSelectedMemberAssigneeId(banMems[0]?.id || '');
    }
  };

  // Filter pipeline
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // 0. Member KHÔNG ĐƯỢC THẤY công việc BCN_TO_LEAD
      if (isMember && t.level === 'BCN_TO_LEAD') {
        return false;
      }
      // 1. Level Filter
      const matchesLevel = levelFilter === 'all' || t.level === levelFilter;
      // 2. Ban Scope
      const matchesBan = activeBanScope === 'all' || t.banId === activeBanScope;
      // 3. Project
      const matchesProject = selectedProject === 'Tất Cả Dự Án' || t.project === selectedProject;
      // 4. Priority
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      // 5. Search
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      // 6. My Tasks
      const matchesMyTask = !myTasksOnly || (user?.name && t.assignee.toLowerCase().includes(user.name.toLowerCase()));

      return matchesLevel && matchesBan && matchesProject && matchesPriority && matchesSearch && matchesMyTask;
    });
  }, [tasks, isMember, levelFilter, activeBanScope, selectedProject, priorityFilter, searchQuery, myTasksOnly, user?.name]);

  const totalTasksCount = filteredTasks.length;
  const doneTasksCount = filteredTasks.filter(t => t.status === 'done').length;
  const reviewTasksCount = filteredTasks.filter(t => t.status === 'review').length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

  const columns = [
    { id: 'todo', title: 'Cần Làm (To Do)', color: 'border-slate-300 bg-slate-50/50', badge: 'bg-slate-200 text-slate-700' },
    { id: 'in_progress', title: 'Đang Làm (In Progress)', color: 'border-blue-400 bg-blue-50/30', badge: 'bg-blue-100 text-blue-800' },
    { id: 'review', title: 'Chờ Duyệt (In Review)', color: 'border-amber-400 bg-amber-50/30', badge: 'bg-amber-100 text-amber-800' },
    { id: 'done', title: 'Hoàn Thành (Done)', color: 'border-emerald-400 bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-800' },
  ];

  // Lead action: Approve task -> calls backend approveTask (awards Gems in DB)
  const handleApproveTask = async (taskId: string) => {
    try {
      setIsActionLoading(true);
      await tasksApi.approveTask(taskId, { feedback: 'Đã hoàn thành xuất sắc nhiệm vụ!' });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
      showToast('Phê duyệt công việc thành công! Gems thưởng đã được cộng tự động vào PostgreSQL.', 'success');
      loadTasksFromApi();
    } catch (err: any) {
      console.error('Lỗi khi duyệt task:', err);
      showToast(`Không thể duyệt task: ${err?.message || 'Lỗi kết nối Backend'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Lead action: Reject task -> moves back to in_progress with feedback
  const handleRejectTask = async (taskId: string) => {
    try {
      setIsActionLoading(true);
      await tasksApi.rejectTask(taskId, { feedback: 'Vui lòng bổ sung thêm tài liệu minh chứng.' });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'in_progress' } : t));
      showToast('Đã yêu cầu thành viên chỉnh sửa và bổ sung thêm minh chứng.', 'success');
      loadTasksFromApi();
    } catch (err: any) {
      console.error('Lỗi khi từ chối task:', err);
      showToast(`Không thể từ chối task: ${err?.message || 'Lỗi kết nối Backend'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Change status
  const handleChangeStatus = async (taskId: string, targetStatus: 'todo' | 'in_progress') => {
    try {
      setIsActionLoading(true);
      const apiStatus = targetStatus === 'in_progress' ? 'IN_PROGRESS' : 'TODO';
      await tasksApi.updateStatus(taskId, { status: apiStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
      showToast(`Đã chuyển công việc sang "${targetStatus === 'in_progress' ? 'Đang Làm' : 'Cần Làm'}".`, 'success');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      showToast(`Không thể chuyển trạng thái: ${err?.message || 'Lỗi Backend'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Lead action: Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa task này khỏi kế hoạch?')) return;
    try {
      setIsActionLoading(true);
      await tasksApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast('Đã xóa công việc khỏi cơ sở dữ liệu PostgreSQL.', 'success');
    } catch (err: any) {
      console.error('Lỗi khi xóa task:', err);
      showToast(`Không thể xóa task: ${err?.message || 'Lỗi Backend'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Member action: Submit task report
  const handleConfirmSubmit = async () => {
    if (!submitModalTask || !submissionLink.trim()) return;
    try {
      setIsActionLoading(true);
      await tasksApi.submitTask(submitModalTask.id, { submissionUrl: submissionLink.trim() });
      setTasks(prev => prev.map(t => 
        t.id === submitModalTask.id 
          ? { ...t, status: 'review', submissionProof: submissionLink.trim() } 
          : t
      ));
      showToast('Nộp báo cáo thành công! Đang chờ Trưởng Ban phê duyệt.', 'success');
      loadTasksFromApi();
      setSubmitModalTask(null);
      setSubmissionLink('');
    } catch (err: any) {
      console.error('Lỗi khi nộp bài:', err);
      showToast(`Lỗi khi nộp bài: ${err?.message || 'Không thể kết nối Backend'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Lead / BCN action: Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetBan: BanId = isOrgAdmin 
      ? selectedCreateBan 
      : (user?.banId || 'ai');

    const chosenMember = members.find(m => m.id === selectedMemberAssigneeId);
    let chosenAssigneeName = '';
    let assigneeUserIds: string[] = [];

    if (chosenMember) {
      chosenAssigneeName = `${chosenMember.name} (${chosenMember.position})`;
      assigneeUserIds = [chosenMember.id];
    } else {
      showToast('Hãy chọn người nhận hợp lệ; không tự giao cho tài khoản khác hoặc bản thân.', 'error');return;
    }

    const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(newDeadline);
    const chosenDate = parts ? new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])) : null;
    if (!parts || !chosenDate || chosenDate.getDate() !== Number(parts[1]) || chosenDate.getMonth() !== Number(parts[2]) - 1) { showToast('Hãy chọn hạn chót hợp lệ theo dd/MM/yyyy.', 'error'); return; }
    const isoDeadline = parseDDMMYYYYtoIso(newDeadline);
    const deptCode = BAN_ID_TO_DEPT_CODE[targetBan] || 'TECH_AI';

    try {
      setIsActionLoading(true);
      const res: any = await tasksApi.createTask({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        eventId: newProject || undefined,
        deadline: isoDeadline,
        gemsReward: newGems,
        priority: newPriority === 'Cao' ? 'HIGH' : newPriority === 'Trung bình' ? 'MEDIUM' : 'LOW',
        departmentCode: deptCode,
        assigneeIds: assigneeUserIds.length > 0 ? assigneeUserIds : undefined,
      });

      const taskObj = (res && res.id) ? res : (res?.data || res);
      if (taskObj && taskObj.id) {
        const createdFrontendTask = mapBackendTaskToFrontend(taskObj);
        setTasks(prev => [createdFrontendTask, ...prev]);
        showToast('Đã lưu nhiệm vụ mới thành công vào cơ sở dữ liệu PostgreSQL!', 'success');
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        await loadTasksFromApi();
      } else {
        throw new Error('Server không phản hồi mã task hợp lệ.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tạo task qua API:', err);
      showToast(`Lỗi lưu task vào cơ sở dữ liệu: ${err?.message || 'Không thể kết nối Backend'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto select-none">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold transition-all ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : 'bg-red-50 text-red-900 border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm"><label>Task Done: <select value={doneDays} onChange={e=>setDoneDays(Number(e.target.value))} className="border rounded-lg p-2"><option value={14}>14 ngày gần nhất</option><option value={30}>30 ngày gần nhất</option><option value={0}>Toàn bộ lịch sử</option></select></label><span className="text-slate-500">Đã tải {tasks.length}/{total} công việc</span>{tasks.length<total&&<button disabled={isLoading} className="text-blue-600" onClick={()=>void loadTasksFromApi(page+1)}>Tải thêm 100 công việc</button>}</div>
      {/* 1. TOP HEADER & PERMISSION BADGE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isOrgAdmin 
                ? 'bg-red-50 text-red-700 border-red-200'
                : isLead 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isOrgAdmin 
                ? '👑 BAN CHỦ NHIỆM (XEM VÀ QUẢN TRỊ TẤT CẢ CÁC BAN)' 
                : isLead 
                ? `⚡ TRƯỞNG BAN ${user?.banId?.toUpperCase()} (QUẢN TRỊ RIÊNG BAN MÌNH)` 
                : `👁️ THÀNH VIÊN BAN ${user?.banId?.toUpperCase()} (XEM & SUBMIT)`}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">{currentSemester}</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Quản Lý Công Việc & Tiến Độ (Kanban Board)</span>
            {!isOrgAdmin && (
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-blue-600 border border-slate-200">
                {user?.banName || 'Ban Chuyên Môn'}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOrgAdmin
              ? 'Phân cấp BCN: Giám sát toàn bộ tiến độ, giao việc trực tiếp cho các Trưởng Ban (BCN → Lead). Đồng bộ thực tế với cơ sở dữ liệu.'
              : isLead
              ? 'Phân cấp Lead: Tiếp nhận chỉ đạo từ BCN và phân bổ, giao việc cho các Thành viên trong Ban (Lead → Member).'
              : 'Thành viên theo dõi nhiệm vụ do Trưởng Ban giao, chủ động bắt đầu làm và nộp báo cáo minh chứng để nhận Gems.'
            }
          </p>
        </div>

        {/* Action Button: Create Task (Leads & Admins) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadTasksFromApi()}
            disabled={isLoading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Làm mới danh sách task từ server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Đồng bộ</span>
          </button>

          {isLead && (
            <button
              onClick={() => {
                const targetBan = isOrgAdmin 
                  ? (selectedBan !== 'all' ? selectedBan as BanId : 'ai') 
                  : (user?.banId || 'ai');
                setSelectedCreateBan(targetBan);

                const banMems = members.filter(
                  m => m.banId === targetBan && ['ACTIVE', 'PROBATION'].includes(m.status)
                );

                if (isOrgAdmin) {
                  const lead = getBanLead(targetBan, members);
                  setSelectedMemberAssigneeId(lead ? lead.id : (banMems[0]?.id || ''));
                } else {
                  const regularMem = banMems.find(m => m.tier === 'BAN_MEMBER');
                  setSelectedMemberAssigneeId(regularMem ? regularMem.id : (banMems[0]?.id || ''));
                }
                setShowCreateModal(true);
              }}
              className={`px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isOrgAdmin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isOrgAdmin ? 'Giao Việc Cho Trưởng Ban (BCN → Lead)' : `Giao Việc Cho Member (${user?.banId?.toUpperCase()})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TASK PROGRESS & STATS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Tiến độ hoàn thành:</span>
            <span className="text-sm font-black text-slate-900 font-mono-code">{completionPercentage}%</span>
          </div>
          <div className="flex-1 max-w-md h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="text-xs text-slate-500 font-mono-code">
            <strong>{doneTasksCount}</strong>/{totalTasksCount} tasks
          </span>
        </div>

        {reviewTasksCount > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Có {reviewTasksCount} task đang chờ Trưởng Ban phê duyệt!</span>
          </div>
        )}
      </div>

      {/* 3. SCALABILITY CONTROL BAR: FILTERS, PROJECTS, SEARCH & VIEW SWITCHER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ban Scope Selector */}
          {isOrgAdmin ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Phạm Vi Ban:</span>
              <select
                value={selectedBan}
                onChange={(e) => setSelectedBan(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="all">Tất Cả 6 Ban (Toàn CLB)</option>
                <option value="ai">Ban AI (Trí Tuệ Nhân Tạo)</option>
                <option value="cloud">Ban Cloud (Điện Toán Đám Mây)</option>
                <option value="web">Ban Web (Phát Triển Web)</option>
                <option value="research">Ban Research (Nghiên Cứu)</option>
                <option value="media">Ban Media (Truyền Thông)</option>
                <option value="hr-event">Ban HR-Event (Nhân Sự & Sự Kiện)</option>
              </select>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 whitespace-nowrap shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Phạm Vi Ban: <strong>{user?.banName}</strong></span>
            </div>
          )}

          {/* Project / Milestone Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Dự Án:</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {PROJECTS_LIST.map((proj) => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Ưu tiên:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="all">Tất Cả</option>
              <option value="Cao">Cao</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Thấp">Thấp</option>
            </select>
          </div>

          {/* Hierarchy Level Filter (Only for BCN & Lead) */}
          {!isMember && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Phân cấp:</span>
              <select
                value={levelFilter}
                onChange={(e: any) => setLevelFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="all">Tất Cả Cấp Bậc</option>
                <option value="BCN_TO_LEAD">👑 BCN → Lead</option>
                <option value="LEAD_TO_MEMBER">⚡ Lead → Member</option>
              </select>
            </div>
          )}
        </div>

        {/* Row 2: Search, My Tasks Toggle & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề task, mã công việc, người nhận..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium transition-all shadow-2xs"
            />
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* My Tasks Toggle Button - KHÔNG BAO GIỜ BỊ TRÀN CHỮ */}
            <button
              onClick={() => setMyTasksOnly(!myTasksOnly)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer border whitespace-nowrap shrink-0 shadow-2xs ${
                myTasksOnly 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Việc Của Tôi</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'board' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng Bảng Kanban (Board View)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng Danh Sách Gọn (List View)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4A. VIEW MODE: BOARD VIEW */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className={`rounded-2xl border ${col.color} p-3.5 flex flex-col shadow-xs bg-white/70`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{col.title}</span>
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono-code ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Tasks Container */}
                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
                  {colTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-2.5 group"
                    >
                      {/* Project Tag, Hierarchy Badge & Priority */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <div className="flex items-center gap-1 min-w-0">
                          {task.level === 'BCN_TO_LEAD' ? (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                              👑 BCN → LEAD
                            </span>
                          ) : (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                              ⚡ LEAD → MEMBER
                            </span>
                          )}
                          <span className="font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[110px]" title={task.project}>
                            {task.project}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-bold px-1.5 py-0.2 rounded ${
                            task.priority === 'Cao' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 flex items-center gap-0.5">
                            💎 {task.gems}
                          </span>
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h4>
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>

                      {/* Deadline & Ban badge */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        {isOrgAdmin && (
                          <span className="font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase font-mono-code">
                            {task.banId}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="flex items-center gap-1 font-mono-code">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Hạn: {formatDateToDDMMYYYY(task.deadline)}</span>
                          </span>
                        )}
                      </div>

                      {/* Submission Link Preview if any */}
                      {task.submissionProof && (
                        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-blue-600 truncate flex items-center gap-1">
                          <Link2 className="w-3 h-3 shrink-0 text-slate-400" />
                          <a href={task.submissionProof} target="_blank" rel="noreferrer" className="truncate hover:underline">
                            {task.submissionProof}
                          </a>
                        </div>
                      )}

                      {/* Assignee & Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-500 truncate max-w-[110px] font-medium" title={task.assignee}>
                          👤 {task.assignee}
                        </span>

                        {/* ACTIONS BASED ON ROLE & STATUS */}
                        <div className="flex items-center gap-1">
                          {/* Todo: Button to start task */}
                          {!user?.readOnly && task.status === 'todo' && (
                            <button
                              onClick={() => handleChangeStatus(task.id, 'in_progress')}
                              disabled={isActionLoading}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-0.5"
                              title="Bắt đầu thực hiện task"
                            >
                              <Play className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                              <span>Bắt đầu</span>
                            </button>
                          )}

                          {/* In Progress: Move back to Todo */}
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleChangeStatus(task.id, 'todo')}
                              disabled={isActionLoading}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Chuyển lại về To Do"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          )}

                          {/* Member Action: Submit Button */}
                          {!user?.readOnly && (task.status === 'in_progress' || task.status === 'todo') && (
                            <button
                              onClick={() => setSubmitModalTask(task)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-md shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Submit</span>
                            </button>
                          )}

                          {/* Lead Action: Reject / Request Fix */}
                          {isLead && task.status === 'review' && (
                            <button
                              onClick={() => handleRejectTask(task.id)}
                              disabled={isActionLoading}
                              className="px-1.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px] rounded-md shadow-xs flex items-center gap-0.5 transition-colors cursor-pointer"
                              title="Yêu cầu sửa lại"
                            >
                              <XCircle className="w-3 h-3 text-amber-700" />
                              <span>Sửa lại</span>
                            </button>
                          )}

                          {/* Lead Action: Approve Button */}
                          {isLead && task.status === 'review' && (
                            <button
                              onClick={() => handleApproveTask(task.id)}
                              disabled={isActionLoading}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-md shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Duyệt kết quả và cấp Gems trực tiếp"
                            >
                              <Check className="w-3 h-3" />
                              <span>Duyệt</span>
                            </button>
                          )}

                          {/* Lead Action: Delete Button */}
                          {isLead && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={isActionLoading}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Xóa task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                      Không có task nào
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4B. VIEW MODE: TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mã & Tiêu Đề Công Việc</th>
                  <th className="px-4 py-3">Dự Án / Chiến Dịch</th>
                  <th className="px-4 py-3">Ban</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                  <th className="px-4 py-3">Ưu Tiên</th>
                  <th className="px-4 py-3">Người Phụ Trách</th>
                  <th className="px-4 py-3">Hạn Chót</th>
                  <th className="px-4 py-3">Gems</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderGit2 className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-semibold">Chưa có công việc nào trong danh sách</span>
                        {isLead && (
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            + Giao Công Việc Mới
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const statusMap = {
                      todo: { label: 'Cần Làm', bg: 'bg-slate-100 text-slate-700' },
                      in_progress: { label: 'Đang Làm', bg: 'bg-blue-100 text-blue-800' },
                      review: { label: 'Chờ Duyệt', bg: 'bg-amber-100 text-amber-800 font-bold' },
                      done: { label: 'Hoàn Thành', bg: 'bg-emerald-100 text-emerald-800' },
                    };
                    const st = statusMap[task.status];

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono-code font-bold text-slate-400 text-[10px]">
                              {task.id.length > 8 ? `${task.id.slice(0, 8)}...` : task.id}
                            </span>
                            {task.level === 'BCN_TO_LEAD' ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                👑 BCN → LEAD
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                                ⚡ LEAD → MEMBER
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900">{task.title}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            {task.project}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono-code font-bold uppercase text-slate-700">
                          {task.banId}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${st.bg}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${task.priority === 'Cao' ? 'text-red-600' : 'text-slate-600'}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium truncate max-w-[130px]">
                          {task.assignee}
                        </td>
                        <td className="px-4 py-3 font-mono-code text-slate-500">
                          {formatDateToDDMMYYYY(task.deadline)}
                        </td>
                        <td className="px-4 py-3 font-bold text-amber-700 font-mono-code">
                          💎 {task.gems}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!user?.readOnly && task.status === 'todo' && (
                              <button
                                onClick={() => handleChangeStatus(task.id, 'in_progress')}
                                className="px-2 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded hover:bg-blue-100 cursor-pointer"
                              >
                                Bắt đầu
                              </button>
                            )}
                            {!user?.readOnly && (task.status === 'in_progress' || task.status === 'todo') && (
                              <button
                                onClick={() => setSubmitModalTask(task)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                              >
                                Submit
                              </button>
                            )}
                            {isLead && task.status === 'review' && (
                              <>
                                <button
                                  onClick={() => handleRejectTask(task.id)}
                                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] rounded-lg cursor-pointer"
                                >
                                  Sửa lại
                                </button>
                                <button
                                  onClick={() => handleApproveTask(task.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                                >
                                  Duyệt
                                </button>
                              </>
                            )}
                            {isLead && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Submit Modal */}
      {submitModalTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-slate-900 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Nộp Báo Cáo Hoàn Thành Công Việc
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Task: <strong className="text-slate-800">{submitModalTask.title}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường dẫn minh chứng (Github PR / Google Drive / Figma / Slide) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/... hoặc https://drive.google.com/..."
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setSubmitModalTask(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={!submissionLink.trim() || isActionLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isActionLoading ? 'Đang gửi...' : 'Gửi Báo Cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateTask} className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isOrgAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {isOrgAdmin ? '👑 PHÂN CẤP 1: BCN → TRƯỞNG BAN' : '⚡ PHÂN CẤP 2: TRƯỞNG BAN → THÀNH VIÊN'}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>{isOrgAdmin ? 'Giao Nhiệm Vụ Cho Trưởng Ban' : `Giao Nhiệm Vụ Cho Thành Viên (${user?.banName})`}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOrgAdmin
                  ? 'BCN giao việc cho các Trưởng Ban. Dữ liệu thành viên được lấy trực tiếp từ database PostgreSQL.'
                  : 'Trưởng Ban giao việc trực tiếp cho thành viên trong Ban để thực hiện và nộp báo cáo.'}
              </p>
            </div>

            {/* Ban and Assignee Selection */}
            {isOrgAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Chọn Ban Nhận Việc *</label>
                  <select
                    value={selectedCreateBan}
                    onChange={(e) => handleBanChange(e.target.value as BanId)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ai">Ban AI (Trí Tuệ Nhân Tạo)</option>
                    <option value="cloud">Ban Cloud (Điện Toán Đám Mây)</option>
                    <option value="web">Ban Web (Phát Triển Web)</option>
                    <option value="media">Ban Media (Truyền Thông)</option>
                    <option value="hr-event">Ban HR-Event (Nhân Sự & Sự Kiện)</option>
                    <option value="research">Ban Research (Nghiên Cứu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    Trưởng Ban Nhận Việc *
                  </label>
                  <select
                    value={selectedMemberAssigneeId}
                    onChange={(e) => setSelectedMemberAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    {members
                      .filter(m => m.banId === selectedCreateBan && m.tier === 'BAN_LEAD' && ['ACTIVE', 'PROBATION'].includes(m.status))
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {m.studentId} ({m.position})
                        </option>
                      ))}
                    {members.filter(m => m.banId === selectedCreateBan).length === 0 && (
                      <option value="">Chưa có dữ liệu thành viên trong ban này</option>
                    )}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-900">Thành Viên Trong Ban Nhận Việc *</label>
                  <span className="text-[10px] text-blue-600 font-bold">{user?.banName}</span>
                </div>
                {members.filter(m => m.banId === user?.banId && ['ACTIVE', 'PROBATION'].includes(m.status)).length > 0 ? (
                  <select
                    value={selectedMemberAssigneeId}
                    onChange={(e) => setSelectedMemberAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Chọn thành viên phụ trách --</option>
                    {members
                      .filter(m => m.banId === user?.banId && ['ACTIVE', 'PROBATION'].includes(m.status))
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {m.studentId} ({m.position || (m.tier === 'BAN_LEAD' ? 'Trưởng Ban' : 'Thành Viên')})
                          {m.id === user?.id ? ' (Chính bạn)' : ''}
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Chưa có thành viên nào trong ban</span>
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Ban của bạn hiện chưa có thành viên hoạt động. Vui lòng vào mục <strong>Nhân Sự</strong> để thêm thành viên trước khi giao việc.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề công việc *</label>
              <input
                type="text"
                required
                placeholder={isOrgAdmin ? "VD: Lập kế hoạch tổ chức Workshop và phân bổ nhân sự" : "VD: Viết module API đăng ký và kết nối cơ sở dữ liệu"}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết yêu cầu</label>
              <textarea
                rows={3}
                placeholder="Yêu cầu kết quả đầu ra, tài liệu tham khảo..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chiến Dịch / Dự Án</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {PROJECTS_LIST.filter(p => p !== 'Tất Cả Dự Án').map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hạn Chót (Deadline: dd/MM/yyyy)</label>
                <DateInput
                  value={newDeadline}
                  onChange={setNewDeadline}
                  placeholder="dd/MM/yyyy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gems thưởng khi hoàn thành</label>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={newGems}
                  onChange={(e) => setNewGems(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Độ ưu tiên</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Cao">Cao</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Thấp">Thấp</option>
                </select>
              </div>
            </div>

            {/* Warning if no assignee is selected */}
            {!selectedMemberAssigneeId && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Vui lòng chọn thành viên nhận việc để hoàn tất giao nhiệm vụ.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!selectedMemberAssigneeId || !newTitle.trim() || isActionLoading}
                className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all ${
                  !selectedMemberAssigneeId || !newTitle.trim() || isActionLoading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : isOrgAdmin
                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                {isActionLoading ? 'Đang tạo...' : isOrgAdmin ? 'Giao Việc Cho Trưởng Ban' : 'Giao Việc Cho Thành Viên'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
