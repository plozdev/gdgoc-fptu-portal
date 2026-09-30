import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useMemberStore } from '../../store/useMemberStore';
import { useGenerationStore } from '../../store/useGenerationStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const fetchMembers = useMemberStore((s) => s.fetchMembers);
  const fetchConfig = useGenerationStore((s) => s.fetchConfig);

  useEffect(() => {
    fetchMembers();
    fetchConfig();
  }, [fetchMembers, fetchConfig]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
