import { Navigate, useLocation } from 'react-router-dom';
import { PollingUpdates } from '../PollingUpdates';
import { FirstPasswordChange } from '../FirstPasswordChange';
import { useAuthStore } from '../../store/useAuthStore';
import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Scroll to top on route change
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger subtle top route transition bar
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (
    user?.readOnly &&
    ['/app/hr', '/app/inventory', '/app/settings/generation', '/app/landing-cms'].includes(pathname)
  ) {
    return <Navigate to="/app/profile" replace />;
  }

  if (user?.mustChangePassword) {
    return <FirstPasswordChange mode="mandatory" />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      {/* Top Google Colors Route Progress Indicator */}
      {isNavigating && (
        <div
          role="progressbar"
          aria-label="Đang tải trang"
          className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] animate-route-progress pointer-events-none"
        />
      )}

      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
          {user?.readOnly && (
            <p className="mb-4 rounded-xl bg-slate-100 border border-slate-200/80 p-3 text-xs font-medium text-slate-600 animate-fadeIn">
              Alumni — hồ sơ, công việc, Gems và tài liệu được chia sẻ ở chế độ chỉ đọc.
            </p>
          )}
          <PollingUpdates />
          {/* Animated Page Screen Container */}
          <div key={pathname} className="page-transition min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

