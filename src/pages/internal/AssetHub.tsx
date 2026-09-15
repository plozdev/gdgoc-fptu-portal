import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Folder, 
  FolderLock, 
  FolderGit2, 
  Lock, 
  Unlock, 
  ExternalLink, 
  FileText, 
  Image, 
  FileCode, 
  FileArchive, 
  Search, 
  Upload, 
  ShieldCheck, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { BanId, BAN_NAMES } from '../../mocks/fixtures/users';

interface AssetFolder {
  id: string;
  name: string;
  banId: BanId | 'shared';
  description: string;
  itemCount: number;
  driveLink: string;
  files: Array<{
    name: string;
    type: 'doc' | 'image' | 'code' | 'archive';
    size: string;
    updatedAt: string;
  }>;
}

const ASSET_FOLDERS: AssetFolder[] = [
  // 1. Thư mục Chung Toàn CLB
  {
    id: 'shared-all',
    name: '00_TAI_NGUYEN_CHUNG_TOAN_CLB',
    banId: 'shared',
    description: 'Logo Google Developer Groups, Google Brand Guidelines, Master Slide Deck, Avatar Frame Gen 4.0',
    itemCount: 24,
    driveLink: 'https://drive.google.com/drive/folders/gdgoc-fptu-shared',
    files: [
      { name: 'GDGoC_Brand_Guidelines_2026.pdf', type: 'doc', size: '12.4 MB', updatedAt: '2 ngày trước' },
      { name: 'Official_Logo_Pack_Vector.zip', type: 'archive', size: '45.1 MB', updatedAt: '1 tuần trước' },
      { name: 'Pitch_Deck_Master_Template_16x9.pptx', type: 'doc', size: '8.7 MB', updatedAt: '3 ngày trước' },
      { name: 'KeyVisual_Gen4_NeoBrutalism.fig', type: 'image', size: '64.2 MB', updatedAt: 'Hôm qua' },
    ]
  },
  // 2. Ban AI
  {
    id: 'ban-ai',
    name: '01_BAN_AI_RESEARCH_NOTEBOOKS',
    banId: 'ai',
    description: 'Notebooks mẫu Gemini API, Codelabs, Vertex AI Prompt Engineering, Datasets.',
    itemCount: 18,
    driveLink: 'https://drive.google.com/drive/folders/ban-ai-internal',
    files: [
      { name: 'Gemini_2_0_Flash_Tool_Calling.ipynb', type: 'code', size: '3.1 MB', updatedAt: 'Hôm nay' },
      { name: 'RAG_Pipeline_FPTU_Campus_Handbook.py', type: 'code', size: '142 KB', updatedAt: '3 ngày trước' },
      { name: 'Dataset_AI_Riser_Vietnam_2026.parquet', type: 'archive', size: '128 MB', updatedAt: '1 tuần trước' },
    ]
  },
  // 3. Ban Cloud
  {
    id: 'ban-cloud',
    name: '02_BAN_CLOUD_INFRA_DOCKER',
    banId: 'cloud',
    description: 'Terraform scripts, Dockerfile mẫu, GCP architecture diagrams, Service Account keys.',
    itemCount: 15,
    driveLink: 'https://drive.google.com/drive/folders/ban-cloud-internal',
    files: [
      { name: 'docker-compose.production.yml', type: 'code', size: '24 KB', updatedAt: '2 ngày trước' },
      { name: 'Architecture_CloudRun_Postgres.drawio', type: 'image', size: '1.2 MB', updatedAt: '5 ngày trước' },
      { name: 'GCP_Skills_Boost_Credits_Vouchers.xlsx', type: 'doc', size: '48 KB', updatedAt: '1 tuần trước' },
    ]
  },
  // 4. Ban Web
  {
    id: 'ban-web',
    name: '03_BAN_WEB_SOURCE_COMPONENTS',
    banId: 'web',
    description: 'Frontend components, API schema, Figma inspect tokens, Swagger export.',
    itemCount: 22,
    driveLink: 'https://drive.google.com/drive/folders/ban-web-internal',
    files: [
      { name: 'GDGoC_Design_System_Tokens.json', type: 'code', size: '32 KB', updatedAt: 'Hôm nay' },
      { name: 'API_Contract_GDGoC_OS_v2.yaml', type: 'code', size: '94 KB', updatedAt: 'Hôm qua' },
      { name: 'Lighthouse_Audit_Report_Summer2026.pdf', type: 'doc', size: '4.5 MB', updatedAt: '4 ngày trước' },
    ]
  },
  // 5. Ban Research
  {
    id: 'ban-research',
    name: '04_BAN_RESEARCH_ACADEMIC_PAPERS',
    banId: 'research',
    description: 'Bản thảo bài báo khoa học LaTeX, dữ liệu thực nghiệm, tài liệu hướng dẫn viết paper.',
    itemCount: 12,
    driveLink: 'https://drive.google.com/drive/folders/ban-research-internal',
    files: [
      { name: 'IEEE_Conference_Draft_Final.tex', type: 'code', size: '58 KB', updatedAt: '3 ngày trước' },
      { name: 'Literature_Review_Multimodal_Agents.docx', type: 'doc', size: '2.8 MB', updatedAt: '1 tuần trước' },
      { name: 'Experimental_Benchmark_Results.csv', type: 'doc', size: '18 MB', updatedAt: '5 ngày trước' },
    ]
  },
  // 6. Ban Media
  {
    id: 'ban-media',
    name: '05_BAN_MEDIA_RAW_FOOTAGE_EXPORTS',
    banId: 'media',
    description: 'Footage quay sự kiện 4K, Premiere Pro Projects, Video recap, After Effects assets.',
    itemCount: 35,
    driveLink: 'https://drive.google.com/drive/folders/ban-media-internal',
    files: [
      { name: 'AI_Riser_Showcase_Trailer_4K.mp4', type: 'image', size: '1.8 GB', updatedAt: 'Hôm nay' },
      { name: 'Premiere_Project_Recap_Summer2026.prproj', type: 'archive', size: '340 MB', updatedAt: 'Hôm qua' },
      { name: 'Soundtrack_Commercial_License.wav', type: 'archive', size: '45 MB', updatedAt: '4 ngày trước' },
    ]
  },
  // 7. Ban HR-Event
  {
    id: 'ban-hr-event',
    name: '06_BAN_HR_EVENT_LOGISTICS_PLANS',
    banId: 'hr-event',
    description: 'Timeline chạy sự kiện, danh sách đại biểu khách mời, kịch bản MC, dự trù ngân sách.',
    itemCount: 19,
    driveLink: 'https://drive.google.com/drive/folders/ban-hr-internal',
    files: [
      { name: 'Master_Timeline_Showcase_Sept20.xlsx', type: 'doc', size: '82 KB', updatedAt: 'Hôm nay' },
      { name: 'Kich_Ban_MC_Song_Ngu_Official.docx', type: 'doc', size: '1.1 MB', updatedAt: 'Hôm qua' },
      { name: 'Du_Tru_Hau_Can_Teabreak_Swag.xlsx', type: 'doc', size: '64 KB', updatedAt: '3 ngày trước' },
    ]
  }
];

export const AssetHub: React.FC = () => {
  const { user } = useAuthStore();
  const [activeFolderId, setActiveFolderId] = useState<string>('shared-all');

  const isOrgAdmin = user?.tier === 'ORG_ADMIN';

  // Check if current user can access a folder
  const canAccessFolder = (folder: AssetFolder) => {
    if (folder.banId === 'shared') return true;
    if (isOrgAdmin) return true;
    return user?.banId === folder.banId;
  };

  const selectedFolder = ASSET_FOLDERS.find(f => f.id === activeFolderId) || ASSET_FOLDERS[0];
  const hasAccess = canAccessFolder(selectedFolder);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono-code">
              SMART GOOGLE DRIVE HUB
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Đồng bộ Google Workspace FPT Education</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Kho Tài Nguyên Số Phân Quyền Theo Ban
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thành viên chỉ được truy cập vào Thư mục Chung và Thư mục Ban chuyên môn của mình. Chapter Lead có toàn quyền quản trị tất cả các ban.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>Mở Drive Gốc</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Two-Column Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Folders List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
          <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Danh Sách Thư Mục</span>
            <span className="font-mono-code text-[11px]">{ASSET_FOLDERS.length} Folders</span>
          </div>

          <div className="space-y-1.5">
            {ASSET_FOLDERS.map(folder => {
              const accessible = canAccessFolder(folder);
              const isSelected = folder.id === activeFolderId;

              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      accessible 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {accessible ? <Folder className="w-5 h-5" /> : <FolderLock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-slate-900">{folder.name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {folder.banId === 'shared' ? 'Toàn CLB (Chung)' : BAN_NAMES[folder.banId as BanId]}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {accessible ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5" />
                        <span>Mở</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Khóa</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Files & Permission View */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          {/* Header of selected folder */}
          <div className="border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono-code">
                {selectedFolder.banId === 'shared' ? 'PUBLIC INTERNAL' : `PHẠM VI: ${selectedFolder.banId.toUpperCase()}`}
              </span>
              <a
                href={selectedFolder.driveLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                <span>Mở thư mục trên Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <h3 className="text-base font-extrabold text-slate-900">{selectedFolder.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedFolder.description}</p>
          </div>

          {/* Access Denied View if user doesn't have permission */}
          {!hasAccess ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mb-1">Thư Mục Này Được Đặt Ở Chế Độ Riêng Tư</h4>
              <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
                Tài nguyên này chỉ dành riêng cho thành viên trực thuộc <strong>{BAN_NAMES[selectedFolder.banId as BanId]}</strong>. Bạn hiện đang thuộc <span className="font-bold text-blue-600">{user?.banName || 'Ban khác'}</span>.
              </p>
              <button
                onClick={() => alert('Yêu cầu cấp quyền đã được gửi tới Chapter Lead và Trưởng Ban!')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Gửi Yêu Cầu Quyền Truy Cập
              </button>
            </div>
          ) : (
            /* Files list when access is granted */
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Tài liệu trong thư mục ({selectedFolder.files.length})</span>
                <button 
                  onClick={() => alert('Mở cửa sổ chọn file tải lên Google Drive')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải lên file mới</span>
                </button>
              </div>

              <div className="space-y-2">
                {selectedFolder.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                        {file.type === 'doc' && <FileText className="w-4 h-4 text-blue-500" />}
                        {file.type === 'image' && <Image className="w-4 h-4 text-pink-500" />}
                        {file.type === 'code' && <FileCode className="w-4 h-4 text-emerald-500" />}
                        {file.type === 'archive' && <FileArchive className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{file.size} • Cập nhật {file.updatedAt}</p>
                      </div>
                    </div>

                    <a
                      href={selectedFolder.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-300 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <span>Xem</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
