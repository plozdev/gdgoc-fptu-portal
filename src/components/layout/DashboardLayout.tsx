import { Navigate, useLocation } from 'react-router-dom';
import { LiveUpdates } from '../LiveUpdates';
import { FirstPasswordChange } from '../FirstPasswordChange';
import { useAuthStore } from '../../store/useAuthStore';
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const user = useAuthStore(s=>s.user);
  const { pathname } = useLocation();
  if (user?.readOnly && ['/app/hr','/app/inventory','/app/settings/generation','/app/landing-cms'].includes(pathname)) return <Navigate to="/app/profile" replace />;
  if (user?.mustChangePassword) return <FirstPasswordChange mode="mandatory" />;
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {user?.readOnly && <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">Alumni — hồ sơ, công việc, Gems và tài liệu được chia sẻ chỉ đọc.</p>}
          <LiveUpdates />
          {children}
        </main>
      </div>
    </div>
  );
};
