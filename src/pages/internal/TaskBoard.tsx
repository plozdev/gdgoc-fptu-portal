import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Send, 
  Check, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Sparkles,
  Award,
  Link2,
  Lock,
  ChevronDown,
  LayoutGrid,
  List,
  FolderGit2,
  UserCheck,
  Calendar,
  Layers,
  CheckCheck
} from 'lucide-react';
import { BAN_NAMES, BanId } from '../../mocks/fixtures/users';
import { DateInput } from '../../components/common/DateInput';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';
import { useMemberStore } from '../../store/useMemberStore';

export type TaskLevel = 'BCN_TO_LEAD' | 'LEAD_TO_MEMBER';

export const BAN_LEADS_MAP: Record<BanId, { name: string; position: string }> = {
  ai: { name: 'Trần Nguyên Bảo', position: 'AI Lead' },
  cloud: { name: 'Hoàng Minh Tuấn', position: 'Cloud Lead' },
  web: { name: 'Lê Hoàng Long', position: 'Web Lead' },
  research: { name: 'Phạm Quốc Anh', position: 'Research Lead' },
  media: { name: 'Vũ Thị Lan Hương', position: 'Media Lead' },
  'hr-event': { name: 'Bùi Đức Thịnh', position: 'HR-Event Lead' },
};

export interface Task {
  id: string;
  title: string;
  description: string;
  banId: BanId;
  level: TaskLevel; // BCN_TO_LEAD (Cấp 1: BCN giao Lead) hoặc LEAD_TO_MEMBER (Cấp 2: Lead giao Member)
  project: string; // Chiến dịch / Dự án / Milestone
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee: string;
  gems: number;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  submissionProof?: string;
  deadline?: string;
}

const PROJECTS_LIST = [
  'Tất Cả Dự Án',
  'Tuyển Sinh Gen 4.0',
  'AI Riser Showcase (20/09)',
  'Google I/O Extended FPTU 2026',
  'Build & Share Workshop Series',
  'Vận Hành Thường Nhật'
];

const INITIAL_TASKS: Task[] = [
  // BAN AI
  {
    id: 'T-101',
    title: 'Nghiên cứu Gemini 2.0 Multimodal API & viết notebook mẫu',
    description: 'Xây dựng sample code gọi function calling và vector embeddings cho workshop.',
    banId: 'ai',
    level: 'LEAD_TO_MEMBER',
    project: 'Build & Share Workshop Series',
    status: 'in_progress',
    assignee: 'Nguyễn Thành Nam (AI Member)',
    gems: 250,
    priority: 'Cao',
    deadline: '25/09/2026',
  },
  {
    id: 'T-107',
    title: 'Chuẩn bị dataset demo RAG cho sinh viên tại AI Riser Showcase',
    description: 'Thu thập tài liệu handbook Đại học FPT và tiền xử lý chunking cho Vector DB.',
    banId: 'ai',
    level: 'LEAD_TO_MEMBER',
    project: 'AI Riser Showcase (20/09)',
    status: 'review',
    assignee: 'Nguyễn Thành Nam (AI Member)',
    gems: 300,
    priority: 'Cao',
    deadline: '18/09/2026',
    submissionProof: 'https://github.com/gdgoc-fptu/rag-campus-dataset'
  },
  {
    id: 'T-108',
    title: 'Đào tạo nội bộ Prompt Engineering cho tân thành viên AI',
    description: 'Soạn slide giáo án 3 buổi về System Instructions, Few-shot và ReAct Agents.',
    banId: 'ai',
    level: 'BCN_TO_LEAD',
    project: 'Tuyển Sinh Gen 4.0',
    status: 'todo',
    assignee: 'Trần Nguyên Bảo (AI Lead)',
    gems: 200,
    priority: 'Trung bình',
    deadline: '05/10/2026',
  },

  // BAN CLOUD
  {
    id: 'T-102',
    title: 'Deploy hạ tầng backend sự kiện lên Google Cloud Run',
    description: 'Thiết lập Dockerfile, cấu hình Cloud SQL Postgres và gắn custom domain.',
    banId: 'cloud',
    level: 'LEAD_TO_MEMBER',
    project: 'Google I/O Extended FPTU 2026',
    status: 'review',
    assignee: 'Trần Đức Toàn (Cloud Member)',
    gems: 300,
    priority: 'Cao',
    deadline: '22/09/2026',
    submissionProof: 'https://console.cloud.google.com/run/deploy/gdgoc-api',
  },
  {
    id: 'T-109',
    title: 'Cấp phát voucher Google Cloud Skills Boost cho 100 sinh viên tham dự',
    description: 'Kiểm tra mã kích hoạt, đồng bộ danh sách email sinh viên từ cổng đăng ký sự kiện.',
    banId: 'cloud',
    level: 'LEAD_TO_MEMBER',
    project: 'AI Riser Showcase (20/09)',
    status: 'in_progress',
    assignee: 'Trần Đức Toàn (Cloud Member)',
    gems: 150,
    priority: 'Trung bình',
    deadline: '19/09/2026',
  },
  {
    id: 'T-115',
    title: 'Lập dự toán chi phí GCP Cloud Credits và quota hạn mức cho kỳ Fall 2026',
    description: 'Báo cáo trực tiếp cho Ban Chủ Nhiệm về các dự án dùng tài nguyên Cloud Run và Firestore.',
    banId: 'cloud',
    level: 'BCN_TO_LEAD',
    project: 'Vận Hành Thường Nhật',
    status: 'todo',
    assignee: 'Hoàng Minh Tuấn (Cloud Lead)',
    gems: 250,
    priority: 'Cao',
    deadline: '28/09/2026',
  },

  // BAN WEB
  {
    id: 'T-103',
    title: 'Tối ưu Core Web Vitals cho Landing Page Gen 4.0',
    description: 'Nâng điểm LCP < 1.2s và CLS < 0.05 trên thiết bị di động.',
    banId: 'web',
    level: 'LEAD_TO_MEMBER',
    project: 'Tuyển Sinh Gen 4.0',
    status: 'in_progress',
    assignee: 'Đỗ Hữu Minh (Web Member)',
    gems: 200,
    priority: 'Trung bình',
    deadline: '28/09/2026',
  },
  {
    id: 'T-110',
    title: 'Tích hợp hệ thống check-in quét QR tự động tại sảnh hội trường',
    description: 'Viết module camera quét mã QR tham dự sự kiện và cập nhật trạng thái điểm danh thời gian thực.',
    banId: 'web',
    level: 'BCN_TO_LEAD',
    project: 'AI Riser Showcase (20/09)',
    status: 'done',
    assignee: 'Lê Hoàng Long (Web Lead)',
    gems: 350,
    priority: 'Cao',
    deadline: '15/09/2026',
  },

  // BAN MEDIA
  {
    id: 'T-104',
    title: 'Soạn thảo Key Visual & Visual LED sự kiện Showcase',
    description: 'Bộ ấn phẩm 16:9 cho màn hình hội trường Edison và poster social.',
    banId: 'media',
    level: 'LEAD_TO_MEMBER',
    project: 'AI Riser Showcase (20/09)',
    status: 'review',
    assignee: 'Lê Minh Tú (Media Member)',
    gems: 200,
    priority: 'Cao',
    deadline: '17/09/2026',
    submissionProof: 'https://figma.com/file/gdgoc-showcase-visual',
  },
  {
    id: 'T-111',
    title: 'Thiết kế bộ Avatar Frame và Banner tuyển sinh Gen 4.0',
    description: 'Sáng tạo theo đúng Google Brand Guidelines chuẩn màu sắc và typography.',
    banId: 'media',
    level: 'BCN_TO_LEAD',
    project: 'Tuyển Sinh Gen 4.0',
    status: 'done',
    assignee: 'Vũ Thị Lan Hương (Media Lead)',
    gems: 250,
    priority: 'Cao',
    deadline: '12/09/2026',
  },
  {
    id: 'T-112',
    title: 'Quay và dựng video recap chuỗi hoạt động kỳ Summer 2026',
    description: 'Clip ngắn 90 giây phong cách năng động cho fanpage và sự kiện.',
    banId: 'media',
    level: 'LEAD_TO_MEMBER',
    project: 'AI Riser Showcase (20/09)',
    status: 'todo',
    assignee: 'Lê Minh Tú (Media Member)',
    gems: 250,
    priority: 'Cao',
    deadline: '19/09/2026',
  },

  // BAN HR-EVENT
  {
    id: 'T-105',
    title: 'Tổng hợp danh sách check-in và chuẩn bị quà Google Swag',
    description: 'Phân loại quà áo thun, sticker và bình nước theo danh sách điểm danh sinh viên.',
    banId: 'hr-event',
    level: 'LEAD_TO_MEMBER',
    project: 'AI Riser Showcase (20/09)',
    status: 'todo',
    assignee: 'Hoàng Kim Chi (HR-Event Member)',
    gems: 150,
    priority: 'Trung bình',
    deadline: '19/09/2026',
  },
  {
    id: 'T-113',
    title: 'Chốt kịch bản MC song ngữ & điều phối teabreak đón tiếp khách mời',
    description: 'Liên hệ phòng ban nhà trường xin mượn thiết bị âm thanh hội trường Alpha.',
    banId: 'hr-event',
    level: 'BCN_TO_LEAD',
    project: 'AI Riser Showcase (20/09)',
    status: 'in_progress',
    assignee: 'Bùi Đức Thịnh (HR-Event Lead)',
    gems: 200,
    priority: 'Cao',
    deadline: '18/09/2026',
  },

  // BAN RESEARCH
  {
    id: 'T-106',
    title: 'Viết bài tổng quan nghiên cứu sinh viên cho kỷ yếu ResFes 2026',
    description: 'Phối hợp với giảng viên hướng dẫn hoàn thiện bản thảo LaTeX.',
    banId: 'research',
    level: 'LEAD_TO_MEMBER',
    project: 'Vận Hành Thường Nhật',
    status: 'done',
    assignee: 'Võ Mai Linh (Research Member)',
    gems: 350,
    priority: 'Cao',
    deadline: '10/09/2026',
  },
  {
    id: 'T-114',
    title: 'Tổng hợp tài liệu đọc hiểu paper Gemini Multimodal Reasoning',
    description: 'Dịch và tóm tắt 3 bài báo tiêu biểu từ Google DeepMind cho thành viên.',
    banId: 'research',
    level: 'BCN_TO_LEAD',
    project: 'Build & Share Workshop Series',
    status: 'in_progress',
    assignee: 'Phạm Quốc Anh (Research Lead)',
    gems: 250,
    priority: 'Trung bình',
    deadline: '01/10/2026',
  }
];

export const TaskBoard: React.FC = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // RBAC checks
  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isLead = user?.tier === 'BAN_LEAD' || isOrgAdmin;
  const isMember = user?.tier === 'BAN_MEMBER';

  // 🚨 CRITICAL RULE 2: Trưởng Ban chỉ xem được Ban của mình!
  // Chỉ có Chapter Lead / Co-Chapter Lead (ORG_ADMIN) mới có quyền xem và chọn các ban khác!
  const [selectedBan, setSelectedBan] = useState<string>(isOrgAdmin ? 'all' : (user?.banId || 'ai'));

  // Sync selectedBan whenever logged in user changes
  useEffect(() => {
    if (isOrgAdmin) {
      setSelectedBan('all');
    } else if (user?.banId) {
      setSelectedBan(user.banId);
    }
  }, [user?.id, user?.tier, user?.banId, isOrgAdmin]);

  const { members } = useMemberStore();

  // Scalability Filters
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
  const [newProject, setNewProject] = useState(PROJECTS_LIST[1]);
  const [newGems, setNewGems] = useState(200);
  const [newPriority, setNewPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Cao');
  const [newDeadline, setNewDeadline] = useState('15/10/2026');
  const [selectedCreateBan, setSelectedCreateBan] = useState<BanId>('ai');
  const [selectedMemberAssignee, setSelectedMemberAssignee] = useState<string>('');

  // Enforce strict Data Scope: If user is not ORG_ADMIN, forced to their ban
  const activeBanScope = isOrgAdmin ? selectedBan : (user?.banId || 'ai');

  // Filter pipeline
  const filteredTasks = tasks.filter(t => {
    // 0. HIERARCHY RULE: Member KHÔNG ĐƯỢC THẤY công việc của LEAD (BCN_TO_LEAD)
    if (isMember && t.level === 'BCN_TO_LEAD') {
      return false;
    }
    // 1. Phân cấp Level Filter (cho BCN và Lead)
    const matchesLevel = levelFilter === 'all' || t.level === levelFilter;
    // 2. Ban Scope
    const matchesBan = activeBanScope === 'all' || t.banId === activeBanScope;
    // 3. Project / Campaign
    const matchesProject = selectedProject === 'Tất Cả Dự Án' || t.project === selectedProject;
    // 4. Priority
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    // 5. Search Query
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    // 6. My Tasks filter
    const matchesMyTask = !myTasksOnly || (user?.name && t.assignee.toLowerCase().includes(user.name.toLowerCase()));

    return matchesLevel && matchesBan && matchesProject && matchesPriority && matchesSearch && matchesMyTask;
  });

  // Calculate metrics
  const totalTasksCount = filteredTasks.length;
  const doneTasksCount = filteredTasks.filter(t => t.status === 'done').length;
  const reviewTasksCount = filteredTasks.filter(t => t.status === 'review').length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

  // Kanban Column definitions
  const columns = [
    { id: 'todo', title: 'Cần Làm (To Do)', color: 'border-slate-300 bg-slate-50/50', badge: 'bg-slate-200 text-slate-700' },
    { id: 'in_progress', title: 'Đang Làm (In Progress)', color: 'border-blue-400 bg-blue-50/30', badge: 'bg-blue-100 text-blue-800' },
    { id: 'review', title: 'Chờ Duyệt (In Review)', color: 'border-amber-400 bg-amber-50/30', badge: 'bg-amber-100 text-amber-800' },
    { id: 'done', title: 'Hoàn Thành (Done)', color: 'border-emerald-400 bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-800' },
  ];

  // Lead actions: Approve task
  const handleApproveTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
  };

  // Lead actions: Delete task
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa task này khỏi kế hoạch?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  // Member action: Submit task report
  const handleConfirmSubmit = () => {
    if (!submitModalTask) return;
    setTasks(prev => prev.map(t => 
      t.id === submitModalTask.id 
        ? { ...t, status: 'review', submissionProof: submissionLink } 
        : t
    ));
    setSubmitModalTask(null);
    setSubmissionLink('');
  };

  // Lead / BCN action: Create task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Target Ban: If Lead, forced to their ban. If ORG_ADMIN, selected create ban.
    const targetBan: BanId = isOrgAdmin 
      ? selectedCreateBan
      : (user?.banId || 'ai');

    // Hierarchy Level & Assignee Enforcement:
    // - BCN (ORG_ADMIN) giao việc cho LEAD -> level = 'BCN_TO_LEAD'
    // - LEAD giao việc cho MEMBER -> level = 'LEAD_TO_MEMBER'
    const taskLevel: TaskLevel = isOrgAdmin ? 'BCN_TO_LEAD' : 'LEAD_TO_MEMBER';

    let chosenAssignee = '';
    if (isOrgAdmin) {
      const lead = BAN_LEADS_MAP[targetBan];
      chosenAssignee = `${lead.name} (${lead.position})`;
    } else {
      chosenAssignee = selectedMemberAssignee || (user?.name ? `${user.name} (Tự phụ trách)` : 'Thành viên Ban');
    }

    const newTask: Task = {
      id: `T-${Math.floor(200 + Math.random() * 800)}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      banId: targetBan,
      level: taskLevel,
      project: newProject,
      status: 'todo',
      assignee: chosenAssignee,
      gems: newGems,
      priority: newPriority,
      deadline: newDeadline,
    };

    setTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto select-none">
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
            <span className="text-xs font-semibold text-slate-500">Kỳ Fall 2026</span>
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
              ? 'Phân cấp BCN: Giám sát toàn bộ tiến độ, giao việc trực tiếp cho các Trưởng Ban (BCN → Lead). Không giao việc trực tiếp cho Member.'
              : isLead
              ? 'Phân cấp Lead: Tiếp nhận chỉ đạo từ BCN và phân bổ, giao việc cho các Thành viên trong Ban (Lead → Member).'
              : 'Thành viên theo dõi nhiệm vụ do Trưởng Ban giao (Lead → Member), hoàn thành và nộp báo cáo minh chứng.'
            }
          </p>
        </div>

        {/* Action Button: Create Task (Leads & Admins) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isLead && (
            <button
              onClick={() => {
                if (isOrgAdmin) {
                  setSelectedCreateBan(selectedBan !== 'all' ? selectedBan as BanId : 'ai');
                } else if (user?.banId) {
                  setSelectedCreateBan(user.banId);
                  const banMems = members.filter(m => m.banId === user.banId && m.tier === 'BAN_MEMBER');
                  if (banMems.length > 0) {
                    setSelectedMemberAssignee(`${banMems[0].name} (${banMems[0].position})`);
                  }
                }
                setShowCreateModal(true);
              }}
              className={`px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isOrgAdmin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isOrgAdmin ? 'Giao Việc Cho Lead (BCN → Lead)' : `Giao Việc Cho Member (${user?.banId?.toUpperCase()})`}</span>
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Ban Scope Selector (ONLY for ORG_ADMIN) */}
          <div className="flex flex-wrap items-center gap-2">
            {isOrgAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Phạm Vi Ban:</span>
                <select
                  value={selectedBan}
                  onChange={(e) => setSelectedBan(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-900">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Phạm Vi Ban: <strong>{user?.banName}</strong></span>
              </div>
            )}

            {/* Project / Milestone Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Dự Án:</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {PROJECTS_LIST.map((proj) => (
                  <option key={proj} value={proj}>{proj}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Ưu tiên:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
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
                <span className="text-xs font-bold text-slate-600">Phân cấp:</span>
                <select
                  value={levelFilter}
                  onChange={(e: any) => setLevelFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Tất Cả Cấp Bậc</option>
                  <option value="BCN_TO_LEAD">👑 BCN → Lead</option>
                  <option value="LEAD_TO_MEMBER">⚡ Lead → Member</option>
                </select>
              </div>
            )}
          </div>

          {/* Right: Search, My Tasks Toggle & View Mode Switcher */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Quick My Tasks Toggle */}
            <button
              onClick={() => setMyTasksOnly(!myTasksOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                myTasksOnly 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Việc Của Tôi</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm task / mã ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-48 font-medium"
              />
            </div>

            {/* View Mode Toggle: Board vs List */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
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
                title="Dạng Danh Sách Gọn (List View - Xử lý nhiều task)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4A. VIEW MODE: BOARD VIEW (KANBAN WITH INDEPENDENT COLUMN SCROLL) */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className={`rounded-2xl border ${col.color} p-3.5 flex flex-col shadow-xs bg-white/70`}
              >
                {/* Column Header (Sticky top feel) */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{col.title}</span>
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono-code ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Independent Scrollable Column Container (Solves "Many Tasks" overflow!) */}
                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
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
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                      </div>

                      {/* Deadline & Ban badge if in Admin view */}
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
                        <span className="text-slate-500 truncate max-w-[120px] font-medium" title={task.assignee}>
                          👤 {task.assignee}
                        </span>

                        {/* ACTIONS BASED ON ROLE */}
                        <div className="flex items-center gap-1">
                          {/* Member Action: Submit Button (available on todo & in_progress) */}
                          {isMember && (task.status === 'in_progress' || task.status === 'todo') && (
                            <button
                              onClick={() => setSubmitModalTask(task)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-md shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Submit</span>
                            </button>
                          )}

                          {/* Lead Action: Approve Button (available on review column) */}
                          {isLead && task.status === 'review' && (
                            <button
                              onClick={() => handleApproveTask(task.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-md shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Duyệt kết quả và cấp Gems"
                            >
                              <Check className="w-3 h-3" />
                              <span>Duyệt Task</span>
                            </button>
                          )}

                          {/* Lead Action: Delete Button */}
                          {isLead && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
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
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                      Không có task phù hợp
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4B. VIEW MODE: TABLE LIST VIEW (EXCELLENT FOR SCALING 100+ TASKS) */
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
                {filteredTasks.map(task => {
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
                          <span className="font-mono-code font-bold text-slate-400">{task.id}</span>
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
                          {isMember && (task.status === 'in_progress' || task.status === 'todo') && (
                            <button
                              onClick={() => setSubmitModalTask(task)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                            >
                              Submit
                            </button>
                          )}
                          {isLead && task.status === 'review' && (
                            <button
                              onClick={() => handleApproveTask(task.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                            >
                              Duyệt
                            </button>
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
                })}
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
                  Đường dẫn minh chứng (Github / Google Drive / Figma / PR)
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
                disabled={!submissionLink.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                Gửi Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal (Strict Hierarchy) */}
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
                  ? 'BCN chỉ giao việc trực tiếp cho các Trưởng Ban. Trưởng Ban sẽ chịu trách nhiệm phân bổ chi tiết cho thành viên ban mình.'
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
                    onChange={(e) => setSelectedCreateBan(e.target.value as BanId)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ai">Ban AI</option>
                    <option value="cloud">Ban Cloud</option>
                    <option value="web">Ban Web</option>
                    <option value="media">Ban Media</option>
                    <option value="hr-event">Ban HR-Event</option>
                    <option value="research">Ban Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Trưởng Ban Phụ Trách (Cố định)</label>
                  <div className="px-3 py-2 bg-purple-100/70 border border-purple-300 rounded-xl text-xs font-bold text-purple-900 truncate">
                    👤 {BAN_LEADS_MAP[selectedCreateBan]?.name} ({BAN_LEADS_MAP[selectedCreateBan]?.position})
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-900">Thành Viên Trong Ban Nhận Việc *</label>
                  <span className="text-[10px] text-blue-600 font-bold">{user?.banName}</span>
                </div>
                {members.filter(m => m.banId === user?.banId && m.tier === 'BAN_MEMBER').length > 0 ? (
                  <select
                    value={selectedMemberAssignee}
                    onChange={(e) => setSelectedMemberAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {members
                      .filter(m => m.banId === user?.banId && m.tier === 'BAN_MEMBER')
                      .map(m => (
                        <option key={m.id} value={`${m.name} (${m.position})`}>
                          {m.name} - {m.studentId} ({m.position})
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Tên thành viên ban phụ trách..."
                    value={selectedMemberAssignee}
                    onChange={(e) => setSelectedMemberAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-medium text-slate-900"
                  />
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Gems thưởng (Điểm)</label>
                <input
                  type="number"
                  min={50}
                  step={50}
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
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer ${
                  isOrgAdmin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isOrgAdmin ? 'Giao Việc Cho Trưởng Ban' : 'Giao Việc Cho Thành Viên'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
