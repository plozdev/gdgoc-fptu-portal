import { eventsApi } from '../../api/events.api';
import { subscribeSync } from '../../sync/subscriptions';
import { useGenerationStore } from '../../store/useGenerationStore';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Send, 
  Check, 
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
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Calendar,
  X,
  Flame,
  FileText,
  Tag,
  MessageSquare,
  User
} from 'lucide-react';
import { BAN_NAMES, BanId } from '../../types/auth';
import { DateInput } from '../../components/common/DateInput';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';
import { useMemberStore, Member } from '../../store/useMemberStore';
import { tasksApi } from '../../api/tasks.api';

export type TaskLevel = 'BCN_TO_LEAD' | 'LEAD_TO_MEMBER';

const BAN_ID_TO_DEPT_CODE: Record<BanId, string> = {
  ai: 'TECH_AI',
  cloud: 'TECH_CLOUD',
  web: 'TECH_WEB',
  research: 'TECH_RESEARCH',
  media: 'MEDIA',
  'hr-event': 'HR_EVENT',
};

const DEPT_CODE_TO_BAN_ID: Record<string, BanId> = {
  TECH_AI: 'ai',
  TECH_CLOUD: 'cloud',
  TECH_WEB: 'web',
  TECH_RESEARCH: 'research',
  MEDIA: 'media',
  HR_EVENT: 'hr-event',
};

// Helper: lấy thông tin Trưởng Ban thực tế từ danh sách thành viên trong DB
const getBanLead = (banId: BanId, mems: Member[]): Member | undefined => {
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
  status: 'in_progress' | 'review' | 'done';
  assignee: string;
  assigneeUserIds: string[];
  creatorId: string;
  creatorName: string;
  gems: number;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  submissionProof?: string;
  feedback?: string;
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

const getTaskDeadlineDate = (deadline?: string | Date | null): Date | null => {
  if (!deadline) return null;
  if (deadline instanceof Date) return deadline;
  const str = String(deadline).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d), 23, 59, 59, 999);
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      parsed.setHours(23, 59, 59, 999);
    }
    return parsed;
  }
  return null;
};

const getTaskOverdueInfo = (task: Task) => {
  if (task.status === 'done' || !task.deadline) {
    return { isOverdue: false, daysOverdue: 0, deadlineDate: null };
  }
  const d = getTaskDeadlineDate(task.deadline);
  if (!d) return { isOverdue: false, daysOverdue: 0, deadlineDate: null };

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs > 0) {
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return { isOverdue: true, daysOverdue: days, deadlineDate: d };
  }
  return { isOverdue: false, daysOverdue: 0, deadlineDate: d };
};


const mapBackendTaskToFrontend = (item: any): Task => {
  const deptCode = item.department?.code || '';
  const banId: BanId = DEPT_CODE_TO_BAN_ID[deptCode] || 'ai';
  
  const statusMap: Record<string, 'in_progress' | 'review' | 'done'> = {
    TODO: 'in_progress',
    BACKLOG: 'in_progress',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'review',
    DONE: 'done',
    OVERDUE: 'in_progress',
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

  const creatorUser = item.creator;
  const creatorName = creatorUser ? (creatorUser.fullName || creatorUser.email) : 'Người giao việc';

  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    banId,
    level: isBcnToLead ? 'BCN_TO_LEAD' : 'LEAD_TO_MEMBER',
    project: item.event?.title || 'Vận Hành Thường Nhật',
    status: statusMap[item.status] || 'in_progress',
    assignee: assigneeName,
    assigneeUserIds: (item.assignees || []).map((a: any) => a.userId || a.user?.id).filter(Boolean),
    creatorId: item.creatorId || creatorUser?.id || '',
    creatorName,
    gems: item.gemsReward ?? 20,
    priority: priorityMap[item.priority] || 'Trung bình',
    submissionProof: item.submissionUrl || undefined,
    feedback: item.feedback || undefined,
    completedAt: item.completedAt,
    deadline: item.deadline ? item.deadline : undefined,
  };
};

export const TaskBoard: React.FC = () => {
  const { user } = useAuthStore();
  const { members } = useMemberStore();

  const currentSemester = useGenerationStore(s=>s.currentSemester);
  const currentSemesterId = useGenerationStore(s=>s.currentSemesterId);
  const semesters = useGenerationStore(s => s.semesters);
  const [eventOptions,setEventOptions] = useState<any[]>([]);
  useEffect(()=>{void eventsApi.getEvents().then((events:any)=>setEventOptions(Array.isArray(events)?events:[])).catch(()=>{});},[]);
  const [doneDays, setDoneDays] = useState(14);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageRef = useRef(page);
  pageRef.current = page;
  const taskRequest = useRef(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const historyView = !!selectedSemesterId && selectedSemesterId !== currentSemesterId;
  const boardReadOnly = !!user?.readOnly || historyView;
  const PROJECTS_LIST = ['Tất Cả Dự Án',...new Set(tasks.map(t=>t.project))];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);
  const [submitModalError, setSubmitModalError] = useState<string | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  }, []);

  // Fetch real tasks from backend API
  const loadTasksFromApi = useCallback(async (nextPage = 1, background = false) => {
    const version = ++taskRequest.current;
    try {
      if (!background) setIsLoading(true);
      // Refresh every already loaded page without resetting the board's pagination.
      const pages = background ? Array.from({ length: nextPage }, (_, i) => i + 1) : [nextPage];
      const results: any[] = await Promise.all(pages.map(page => tasksApi.getTasks({ limit: 100, page, doneDays: historyView ? 0 : doneDays, semesterId: selectedSemesterId || (user?.readOnly ? 'all' : currentSemesterId || undefined) })));
      if (version !== taskRequest.current) return false;
      const mappedTasks = results.flatMap(res => (Array.isArray(res) ? res : res?.data || []).map(mapBackendTaskToFrontend));
      setTasks(prev => background || nextPage === 1 ? mappedTasks : [...prev, ...mappedTasks]);
      setPage(nextPage);setTotal(results[0].total ?? mappedTasks.length);
      return true;
    } catch (err: any) {
      if (version === taskRequest.current && !background) showToast(err?.message || 'Không thể tải công việc', 'error');
      return false;
    } finally {
      if (version === taskRequest.current) setIsLoading(false);
    }
  }, [doneDays, currentSemesterId, selectedSemesterId, historyView, user?.readOnly, showToast]);

  useEffect(() => {
    const unsubscribe = subscribeSync(['tasks', 'semesters', 'scope'], () => loadTasksFromApi(pageRef.current, true));
    return () => { unsubscribe(); taskRequest.current++; };
  }, [loadTasksFromApi]);
  // RBAC checks
  const isOrgAdmin = !user?.readOnly && user?.tier === 'ORG_ADMIN';
  const isLead = !boardReadOnly && (user?.tier === 'BAN_LEAD' || isOrgAdmin);
  const isMember = !user?.readOnly && user?.tier === 'BAN_MEMBER';
  const reviewBlockedReason = (task: Task) => {
    if (task.assigneeUserIds.includes(user?.id || '')) {
      return 'Không thể tự duyệt hoặc yêu cầu sửa công việc của mình.';
    }
    const isCreator = Boolean(task.creatorId && task.creatorId === user?.id);
    if (!isCreator && !isOrgAdmin) {
      return 'Chỉ người giao việc (hoặc Ban Chủ Nhiệm) mới có quyền phê duyệt/yêu cầu sửa.';
    }
    if (!task.submissionProof) return 'Công việc chưa có minh chứng.';
    return '';
  };

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'review' | 'done' | 'overdue'>('all');
  const [selectedProject, setSelectedProject] = useState<string>('Tất Cả Dự Án');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);

  // Modals
  const [detailModalTask, setDetailModalTask] = useState<Task | null>(null);
  const [submitModalTask, setSubmitModalTask] = useState<Task | null>(null);
  const [reviewModal, setReviewModal] = useState<{ task: Task; type: 'approve' | 'reject' } | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);

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
      // 1. Status Filter
      const overdue = getTaskOverdueInfo(t);
      const matchesStatus = statusFilter === 'all'
        ? true
        : statusFilter === 'overdue'
        ? overdue.isOverdue
        : t.status === statusFilter;

      // 2. Ban Scope
      const matchesBan = activeBanScope === 'all' || t.banId === activeBanScope;
      // 3. Project
      const matchesProject = selectedProject === 'Tất Cả Dự Án' || t.project === selectedProject;
      // 4. Priority
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      // 5. Search
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
      // 6. My Tasks
      const matchesMyTask = !myTasksOnly || t.assigneeUserIds.includes(user?.id || '') || (t.creatorId === user?.id);

      return matchesStatus && matchesBan && matchesProject && matchesPriority && matchesSearch && matchesMyTask;
    });
  }, [tasks, isMember, statusFilter, activeBanScope, selectedProject, priorityFilter, searchQuery, myTasksOnly, user?.id]);

  const totalTasksCount = tasks.length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'in_progress').length;
  const reviewTasksCount = tasks.filter(t => t.status === 'review').length;
  const doneTasksCount = tasks.filter(t => t.status === 'done').length;
  const overdueTasksCount = tasks.filter(t => getTaskOverdueInfo(t).isOverdue).length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

  // Open Review note modal
  const handleOpenReviewModal = (task: Task, type: 'approve' | 'reject') => {
    setReviewModal({ task, type });
    setReviewFeedback(type === 'approve' ? (task.feedback || 'Đã hoàn thành xuất sắc nhiệm vụ!') : '');
    setReviewError(null);
  };

  // Review action: Approve or Reject task with note/feedback
  const handleConfirmReview = async () => {
    if (!reviewModal) return;
    const { task, type } = reviewModal;
    if (type === 'reject' && !reviewFeedback.trim()) {
      setReviewError('Vui lòng nhập lý do hoặc nội dung cần chỉnh sửa bổ sung.');
      return;
    }

    try {
      setIsActionLoading(true);
      setReviewError(null);
      if (type === 'approve') {
        await tasksApi.approveTask(task.id, { feedback: reviewFeedback.trim() || 'Đã hoàn thành xuất sắc nhiệm vụ!' });
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done', feedback: reviewFeedback.trim() || 'Đã hoàn thành xuất sắc nhiệm vụ!' } : t));
        showToast('Phê duyệt công việc thành công!', 'success');
      } else {
        await tasksApi.rejectTask(task.id, { feedback: reviewFeedback.trim() });
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'in_progress', feedback: reviewFeedback.trim() } : t));
        showToast('Đã yêu cầu thành viên chỉnh sửa và bổ sung thêm minh chứng.', 'success');
      }

      setReviewModal(null);
      setReviewFeedback('');
      setReviewError(null);
      loadTasksFromApi();

      if (detailModalTask?.id === task.id) {
        setDetailModalTask(prev => prev ? {
          ...prev,
          status: type === 'approve' ? 'done' : 'in_progress',
          feedback: reviewFeedback.trim()
        } : null);
      }
    } catch (err: any) {
      console.error('Lỗi khi review task:', err);
      setReviewError(err?.message || 'Lỗi khi xử lý phê duyệt/từ chối task');
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
    setCreateTaskError(null);
    if (!newTitle.trim()) {
      setCreateTaskError('Vui lòng nhập tiêu đề công việc.');
      return;
    }

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
      setCreateTaskError('Hãy chọn người nhận hợp lệ; không tự giao cho tài khoản khác hoặc bản thân.');
      return;
    }

    const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(newDeadline);
    const chosenDate = parts ? new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])) : null;
    if (!parts || !chosenDate || chosenDate.getDate() !== Number(parts[1]) || chosenDate.getMonth() !== Number(parts[2]) - 1) {
      setCreateTaskError('Hãy chọn hạn chót hợp lệ theo dd/MM/yyyy.');
      return;
    }
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
        setCreateTaskError(null);
        setNewTitle('');
        setNewDesc('');
        await loadTasksFromApi();
      } else {
        throw new Error('Server không phản hồi mã task hợp lệ.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tạo task qua API:', err);
      setCreateTaskError(`Lỗi lưu task vào cơ sở dữ liệu: ${err?.message || 'Không thể kết nối Backend'}`);
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

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {isOrgAdmin && <label>Xem kỳ: <select aria-label="Xem kỳ công việc" value={selectedSemesterId} onChange={e => { pageRef.current = 1; setPage(1); setSelectedSemesterId(e.target.value); }} className="border rounded-lg p-2">
          <option value="">{currentSemester || 'Kỳ hiện tại'} · Hiện tại</option>
          {semesters.filter(s => s.isClosed).map(s => <option key={s.id} value={s.id}>{s.name} · Đã lưu trữ</option>)}
        </select></label>}
        <label>Task Done: <select disabled={historyView} value={historyView ? 0 : doneDays} onChange={e=>setDoneDays(Number(e.target.value))} className="border rounded-lg p-2"><option value={14}>14 ngày gần nhất</option><option value={30}>30 ngày gần nhất</option><option value={0}>Toàn bộ lịch sử</option></select></label><span className="text-slate-500">Đã tải {tasks.length}/{total} công việc</span>{tasks.length<total&&<button disabled={isLoading} className="text-blue-600" onClick={()=>void loadTasksFromApi(page+1)}>Tải thêm 100 công việc</button>}
      </div>
      {historyView && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Kỳ đã lưu trữ — chỉ xem. Task và trạng thái được giữ nguyên; không chuyển sang kỳ mới hoặc cộng thêm Gems.</p>}
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
            <span className="text-xs font-semibold text-slate-500">{semesters.find(s => s.id === selectedSemesterId)?.name || currentSemester}</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Quản Lý Công Việc & Tiến Độ</span>
            {!isOrgAdmin && (
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-blue-600 border border-slate-200">
                {user?.banName || 'Ban Chuyên Môn'}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOrgAdmin
              ? 'Giám sát tiến độ toàn bộ công việc và giao việc trực tiếp cho các Trưởng Ban.'
              : isLead
              ? 'Quản lý tiến độ công việc và phân bổ nhiệm vụ cho các thành viên trong ban.'
              : 'Theo dõi nhiệm vụ được giao, chủ động thực hiện và nộp báo cáo minh chứng.'}
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
                setCreateTaskError(null);
                setShowCreateModal(true);
              }}
              className={`px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isOrgAdmin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isOrgAdmin ? 'Giao Việc Cho Trưởng Ban' : `Giao Việc Cho Thành Viên (${user?.banId?.toUpperCase()})`}</span>
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

          </div>
        </div>
      </div>

      {/* 4. STATUS FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Tất Cả</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-code ${
            statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>{totalTasksCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
            statusFilter === 'in_progress'
              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Đang Làm</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-code ${
            statusFilter === 'in_progress' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
          }`}>{inProgressTasksCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('review')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
            statusFilter === 'review'
              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
              : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Chờ Duyệt</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-code ${
            statusFilter === 'review' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>{reviewTasksCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('done')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
            statusFilter === 'done'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <Check className="w-3 h-3" />
          <span>Hoàn Thành</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-code ${
            statusFilter === 'done' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>{doneTasksCount}</span>
        </button>

        {overdueTasksCount > 0 && (
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse text-rose-500" />
            <span>Quá Hạn</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-code font-bold ${
              statusFilter === 'overdue' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>{overdueTasksCount}</span>
          </button>
        )}
      </div>

      {/* 5. TABLE LIST VIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-600 min-w-[720px]">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Công Việc</th>
                <th className="px-4 py-3.5">Người Nhận</th>
                <th className="px-4 py-3.5">Người Giao</th>
                <th className="px-4 py-3.5">Hạn Chót</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderGit2 className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-semibold">Chưa có công việc nào phù hợp với bộ lọc</span>
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
                  const overdue = getTaskOverdueInfo(task);
                  const isAssignee = task.assigneeUserIds.includes(user?.id || '');
                  const canSubmit = !boardReadOnly && isAssignee && task.status === 'in_progress';
                  const isCreator = Boolean(task.creatorId && task.creatorId === user?.id);
                  const canReview = !boardReadOnly && task.status === 'review' && (isCreator || isOrgAdmin) && !isAssignee;

                  const statusConfig = {
                    in_progress: { label: 'Đang Làm', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                    review: { label: 'Chờ Duyệt', bg: 'bg-amber-50 text-amber-800 border-amber-200 font-bold' },
                    done: { label: 'Hoàn Thành', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  }[task.status];

                  return (
                    <tr 
                      key={task.id} 
                      onClick={() => setDetailModalTask(task)}
                      className={`transition-colors cursor-pointer select-none group ${
                        overdue.isOverdue ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* 1. Công Việc (Tiêu đề + Tags Dự án & Ban + Mô tả ngắn) */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {task.title}
                          </span>
                          {task.priority === 'Cao' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                              🔥 Cao
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs flex-wrap">
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md truncate max-w-[160px]" title={task.project}>
                            {task.project}
                          </span>
                          <span className="font-mono-code font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {task.banId}
                          </span>
                          {task.description && (
                            <span className="text-[11px] text-slate-400 truncate max-w-sm hidden md:inline">
                              • {task.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Người Nhận */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 min-w-0" title={`Người nhận: ${task.assignee}`}>
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                            {task.assignee ? task.assignee.trim()[0] : '?'}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs truncate max-w-[130px]">
                            {task.assignee}
                          </span>
                        </div>
                      </td>

                      {/* 3. Người Giao */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 min-w-0" title={`Người giao: ${task.creatorName}`}>
                          <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                            {task.creatorName ? task.creatorName.trim()[0] : '?'}
                          </div>
                          <span className="text-slate-600 text-xs font-medium truncate max-w-[130px]">
                            {task.creatorName}
                          </span>
                        </div>
                      </td>

                      {/* 4. Hạn Chót */}
                      <td className="px-4 py-3.5 font-mono-code">
                        {overdue.isOverdue ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-rose-700 font-bold flex items-center gap-1 text-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />
                              {formatDateToDDMMYYYY(task.deadline)}
                            </span>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md w-fit">
                              Quá hạn {overdue.daysOverdue} ngày
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateToDDMMYYYY(task.deadline)}
                          </span>
                        )}
                      </td>

                      {/* 5. Trạng Thái */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${statusConfig.bg}`}>
                          {task.status === 'in_progress' && <Play className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />}
                          {task.status === 'review' && <Clock className="w-3 h-3 text-amber-600" />}
                          {task.status === 'done' && <Check className="w-3 h-3 text-emerald-600" />}
                          <span>{statusConfig.label}</span>
                        </span>
                      </td>

                      {/* 6. Thao Tác (Không có con mắt, chỉ có nút Submit/Review) */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Member only: Submit button */}
                          {canSubmit && (
                            <button
                              onClick={() => setSubmitModalTask(task)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 transition-transform active:scale-95"
                              title="Nộp báo cáo hoàn thành"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                          )}

                          {/* Assigner only: Approve and Reject buttons */}
                          {canReview && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenReviewModal(task, 'reject')}
                                disabled={isActionLoading || !!reviewBlockedReason(task)}
                                title={reviewBlockedReason(task) || 'Yêu cầu sửa lại'}
                                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5 text-amber-700" />
                                <span>Sửa</span>
                              </button>
                              <button
                                onClick={() => handleOpenReviewModal(task, 'approve')}
                                disabled={isActionLoading || !!reviewBlockedReason(task)}
                                title={reviewBlockedReason(task) || 'Duyệt kết quả'}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt</span>
                              </button>
                            </div>
                          )}

                          {/* Member awaiting review chip */}
                          {isAssignee && task.status === 'review' && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                              Chờ duyệt
                            </span>
                          )}

                          {/* Completed chip */}
                          {task.status === 'done' && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                              Đã duyệt
                            </span>
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

      {/* Review Modal (Approve / Reject with feedback note) */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  reviewModal.type === 'approve' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {reviewModal.type === 'approve' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {reviewModal.type === 'approve' ? 'Phê Duyệt Hoàn Thành Nhiệm Vụ' : 'Yêu Cầu Chỉnh Sửa Nhiệm Vụ'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-sm">
                    Task: <strong className="text-slate-800">{reviewModal.task.title}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewModal(null);
                  setReviewFeedback('');
                  setReviewError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission preview if available */}
            {reviewModal.task.submissionProof && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Link2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-600 truncate">{reviewModal.task.submissionProof}</span>
                </div>
                <a
                  href={reviewModal.task.submissionProof}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-bold shrink-0 text-[11px] underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Xem bài nộp
                </a>
              </div>
            )}

            {/* Error in review modal */}
            {reviewError && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-300 rounded-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {reviewModal.type === 'approve' 
                  ? 'Ghi chú / Nhận xét động viên thành viên (Tùy chọn)' 
                  : 'Nội dung phản hồi / Điểm cần sửa đổi bổ sung *'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  reviewModal.type === 'approve'
                    ? 'VD: Làm rất tốt, tiến độ nhanh và chất lượng bài nộp đạt chuẩn!'
                    : 'VD: Thiếu slide thuyết trình mục 3, vui lòng cập nhật lại trước 18h hôm nay...'
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
              />
              <p className="text-[11px] text-slate-400">
                {reviewModal.type === 'approve' 
                  ? 'Nhiệm vụ sẽ được đánh dấu Hoàn Thành và lưu vào lịch sử công việc.' 
                  : 'Task sẽ được chuyển lại trạng thái "Đang làm" để thành viên tiếp tục cập nhật và nộp lại.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setReviewModal(null);
                  setReviewFeedback('');
                  setReviewError(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={isActionLoading || (reviewModal.type === 'reject' && !reviewFeedback.trim())}
                className={`px-5 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                  reviewModal.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isActionLoading ? (
                  'Đang xử lý...'
                ) : reviewModal.type === 'approve' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Xác Nhận Phê Duyệt</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Gửi Yêu Cầu Sửa Lại</span>
                  </>
                )}
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

            {/* Error Announcement Inside Modal */}
            {createTaskError && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-300 rounded-xl flex items-center justify-between gap-2 text-xs font-bold animate-fadeIn">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{createTaskError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateTaskError(null)}
                  className="text-red-400 hover:text-red-700 font-bold p-1 cursor-pointer"
                  title="Đóng thông báo lỗi"
                >
                  ✕
                </button>
              </div>
            )}

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Độ Ưu Tiên</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Cao">🔥 Cao</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Thấp">Thấp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hạn Chót (dd/MM/yyyy)</label>
                <DateInput
                  value={newDeadline}
                  onChange={setNewDeadline}
                  placeholder="dd/MM/yyyy"
                />
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
                onClick={() => {
                  setCreateTaskError(null);
                  setShowCreateModal(false);
                }}
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
      {/* 4D. TASK DETAIL MODAL */}
      {detailModalTask && (() => {
        const detailOverdue = getTaskOverdueInfo(detailModalTask);
        const statusConfig = {
          in_progress: { label: 'Đang Làm (In Progress)', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
          review: { label: 'Chờ Duyệt (In Review)', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
          done: { label: 'Hoàn Thành (Done)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        }[detailModalTask.status] || { label: 'Đang Làm', bg: 'bg-blue-100 text-blue-800 border-blue-200' };

        const banFullName = BAN_NAMES[detailModalTask.banId] || detailModalTask.banId.toUpperCase();
        const isAssignee = Boolean(user?.id && detailModalTask.assigneeUserIds.includes(user.id));
        const isCreator = Boolean(user?.id && (detailModalTask.creatorId === user.id || detailModalTask.assignedBy === user.name));
        const canSubmit = !boardReadOnly && isAssignee && detailModalTask.status === 'in_progress';
        const canReview = !boardReadOnly && detailModalTask.status === 'review' && (isCreator || isOrgAdmin) && !isAssignee;

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setDetailModalTask(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-xl w-full border-2 border-slate-900 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Overdue accent bar or normal bar */}
              <div className={`h-1.5 w-full ${
                detailOverdue.isOverdue 
                  ? 'bg-gradient-to-r from-rose-500 to-red-500' 
                  : detailModalTask.status === 'done' 
                  ? 'bg-emerald-500' 
                  : detailModalTask.status === 'in_progress'
                  ? 'bg-blue-500'
                  : 'bg-slate-400'
              }`} />

              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-slate-200/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono-code uppercase">
                      {detailModalTask.banId}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <button
                    onClick={() => setDetailModalTask(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Đóng modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2.5 leading-snug">
                  {detailModalTask.title}
                </h3>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-mono-code">
                  <span>Mã task: #{detailModalTask.id.slice(0, 8)}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(detailModalTask.id);
                      showToast('Đã sao chép mã Task ID!', 'success');
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-sans text-[11px] font-semibold"
                    title="Sao chép toàn bộ Task ID"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Sao chép ID</span>
                  </button>
                </div>
              </div>

              {/* Overdue Alert Banner if overdue */}
              {detailOverdue.isOverdue && (
                <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-rose-900">
                      Nhiệm vụ này đã quá hạn {detailOverdue.daysOverdue} ngày!
                    </p>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Hạn chót ban đầu: <strong className="font-mono-code">{formatDateToDDMMYYYY(detailModalTask.deadline)}</strong>. 
                      Vui lòng khẩn trương hoàn thành nộp bài báo cáo hoặc liên hệ Trưởng Ban để được hỗ trợ/gia hạn.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Body: Scrollable Details */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-xs">
                {/* Info Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* Campaign */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FolderGit2 className="w-3 h-3 text-blue-500" />
                      Chiến Dịch / Dự Án
                    </span>
                    <p className="font-bold text-slate-900 truncate" title={detailModalTask.project}>
                      {detailModalTask.project}
                    </p>
                  </div>

                  {/* Department */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-purple-500" />
                      Ban Phụ Trách
                    </span>
                    <p className="font-bold text-slate-900 truncate" title={banFullName}>
                      {banFullName}
                    </p>
                  </div>

                  {/* Assigner / Creator */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-purple-500" />
                      Người Giao Việc
                    </span>
                    <p className="font-bold text-slate-900 truncate" title={detailModalTask.creatorName || detailModalTask.assignedBy}>
                      {detailModalTask.creatorName || detailModalTask.assignedBy || 'Ban Quản Trị'}
                    </p>
                  </div>

                  {/* Assignee */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                      Người Thực Hiện
                    </span>
                    <p className="font-bold text-slate-900 truncate" title={detailModalTask.assignee}>
                      {detailModalTask.assignee}
                    </p>
                  </div>

                  {/* Priority */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-500" />
                      Độ Ưu Tiên
                    </span>
                    <p className={`font-bold ${
                      detailModalTask.priority === 'Cao' ? 'text-rose-600' : 'text-slate-800'
                    }`}>
                      {detailModalTask.priority}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div className={`p-3 border rounded-xl space-y-1 ${
                    detailOverdue.isOverdue 
                      ? 'bg-rose-50 border-rose-200' 
                      : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      detailOverdue.isOverdue ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      <Clock className="w-3 h-3" />
                      Hạn Chót
                    </span>
                    <p className={`font-bold font-mono-code ${
                      detailOverdue.isOverdue ? 'text-rose-700' : 'text-slate-900'
                    }`}>
                      {formatDateToDDMMYYYY(detailModalTask.deadline)}
                    </p>
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Yêu Cầu & Mô Tả Chi Tiết:</span>
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                    {detailModalTask.description ? (
                      detailModalTask.description
                    ) : (
                      <span className="text-slate-400 italic">Nhiệm vụ này không có mô tả bổ sung.</span>
                    )}
                  </div>
                </div>

                {/* Submission Proof Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Minh Chứng / Báo Cáo Nộp Bài:</span>
                  </h4>
                  {detailModalTask.submissionProof ? (
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <a 
                          href={detailModalTask.submissionProof} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-700 hover:text-blue-900 font-bold truncate underline text-xs"
                        >
                          {detailModalTask.submissionProof}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(detailModalTask.submissionProof || '');
                            showToast('Đã sao chép liên kết minh chứng!', 'success');
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </button>
                        <a
                          href={detailModalTask.submissionProof}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Mở link</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 italic text-[11px] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Chưa có báo cáo minh chứng nào được nộp cho công việc này.</span>
                    </div>
                  )}
                </div>

                {/* Assigner Feedback / Note */}
                {detailModalTask.feedback && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ghi Chú / Phản Hồi Từ Người Giao:</span>
                    </h4>
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 leading-relaxed text-xs">
                      {detailModalTask.feedback}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDetailModalTask(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Đóng
                </button>

                <div className="flex items-center gap-2">
                  {/* Assignee only: Submit Button */}
                  {canSubmit && (
                    <button
                      onClick={() => {
                        const target = detailModalTask;
                        setDetailModalTask(null);
                        setSubmitModalTask(target);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Nộp Báo Cáo</span>
                    </button>
                  )}

                  {/* Assigner / BCN only: Reject & Approve Buttons */}
                  {canReview && (
                    <>
                      <button
                        onClick={() => {
                          handleOpenReviewModal(detailModalTask, 'reject');
                        }}
                        disabled={isActionLoading || !!reviewBlockedReason(detailModalTask)}
                        className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={reviewBlockedReason(detailModalTask) || 'Yêu cầu sửa lại'}
                      >
                        <XCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Yêu Cầu Sửa Lại</span>
                      </button>
                      <button
                        onClick={() => {
                          handleOpenReviewModal(detailModalTask, 'approve');
                        }}
                        disabled={isActionLoading || !!reviewBlockedReason(detailModalTask)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={reviewBlockedReason(detailModalTask) || 'Phê duyệt hoàn thành'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Phê Duyệt Hoàn Thành</span>
                      </button>
                    </>
                  )}

                  {/* Assignee awaiting review notice */}
                  {isAssignee && detailModalTask.status === 'review' && (
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
                      Đang chờ người giao phê duyệt...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

