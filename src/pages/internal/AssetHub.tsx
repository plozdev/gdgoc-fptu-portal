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
    itemCount: 0,
    driveLink: 'https://drive.google.com/drive/folders/gdgoc-fptu-shared',
    files: []
  },
  // 2. Ban AI
  {
    id: 'ban-ai',
    name: '01_BAN_AI_RESEARCH_NOTEBOOKS',
    banId: 'ai',
    description: 'Notebooks mẫu Gemini API, Codelabs, Vertex AI Prompt Engineering, Datasets.',
    itemCount: 0,
    driveLink: 'https://drive.google.com/drive/folders/ban-ai-internal',
    files: []
  },
  // 3. Ban Cloud
  {
    id: 'ban-cloud',
    name: '02_BAN_CLOUD_INFRA_DOCKER',
    banId: 'cloud',
    description: 'Terraform scripts, Dockerfile mẫu, GCP architecture diagrams, Service Account keys.',
    itemCount: 0,
    driveLink: 'https://drive.google.com/drive/folders/ban-cloud-internal',
    files: []
  },
  // 4. Ban Web
  {
    id: 'ban-web',
    name: '03_BAN_WEB_SOURCE_COMPONENTS',
    banId: 'web',
    description: 'Frontend components, API schema, Figma inspect tokens, Swagger export.',
    itemCount: 0,
    driveLink: 'https://drive.google.com/drive/folders/ban-web-internal',
    files: []
  },
  // 5. Ban Research
  {
    id: 'ban-research',
    name: '04_BAN_RESEARCH_ACADEMIC_PAPERS',
    banId: 'research',
    description: 'Bản thảo bài báo khoa học LaTeX, dữ liệu thực nghiệm, tài liệu hướng dẫn viết paper.',
    itemCount: 0,
    driveLink: 'https://drive.google.com/drive/folders/ban-research-internal',
    files: []
  },
  // 6. Ban Media
  {
    id: 'ban-media',
    name: '05_BAN_MEDIA_RAW_FOOTAGE_EXPORTS',
    banId: 'media',
    description: 'Footage quay sự kiện 4K, Premiere Pro Projects, Video recap, After Effects assets.',
    itemCount: 0,
    driveLink: 'https://drive.google.com/drive/folders/ban-media-internal',
    files: []
  },
  // 7. Ban HR-Event
  {
    id: 'ban-hr-event',
    name: '06_BAN_HR_EVENT_LOGISTICS_PLANS',
    banId: 'hr-event',
    description: 'Timeline chạy sự kiện, danh sách đại biểu khách mời, kịch bản MC, dự trù ngân sách.',
    itemCount: 0,
    driveLink: 'https://drive.google.com/drive/folders/ban-hr-internal',
    files: []
  }
];

export const AssetHub: React.FC = () => {
  const { user } = useAuthStore();
  const [activeFolderId, setActiveFolderId] = useState<string>('shared-all');
  const [requestSent, setRequestSent] = useState(false);

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
              {requestSent ? (
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 inline-block">
                  ✓ Đã gửi yêu cầu cấp quyền đến Chapter Lead và Trưởng Ban!
                </span>
              ) : (
                <button
                  onClick={() => setRequestSent(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Gửi Yêu Cầu Quyền Truy Cập
                </button>
              )}
            </div>
          ) : (
            /* Files list when access is granted */
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Tài liệu trong thư mục ({selectedFolder.files.length})</span>
                <a 
                  href={selectedFolder.driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải lên tệp qua Google Drive</span>
                </a>
              </div>

              {selectedFolder.files.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 min-h-[220px]">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-3 shadow-xs">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-1">Thư Mục Hiện Đang Trống</h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                    Chưa có tệp tài nguyên nào được tải lên cho thư mục này trong kỳ Fall 2026.
                  </p>
                  <a
                    href={selectedFolder.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Mở Google Drive & Tải Tệp Lên</span>
                  </a>
                </div>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
