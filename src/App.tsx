/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Tracks } from './components/Tracks';
import { Impact } from './components/Impact';
import { Events } from './components/Events';
import { Organizers } from './components/Organizers';
import { JoinCTA } from './components/JoinCTA';
import { Footer } from './components/Footer';
import { JoinModal } from './components/JoinModal';
import { TrackDetailModal } from './components/TrackDetailModal';
import { Department } from './types';
import { DEPARTMENTS_DATA } from './data/gdgData';
import { GdgBracketsGlyph } from './components/GdgLogo';

import { useAuthStore } from './store/useAuthStore';
import { useLandingContentStore } from './store/useLandingContentStore';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Internal Member Portal Pages
import { DashboardOverview } from './pages/internal/DashboardOverview';
import { HRManagement } from './pages/internal/HRManagement';
import { TaskBoard } from './pages/internal/TaskBoard';
import { LandingCMS } from './pages/internal/LandingCMS';
import { EventManagement } from './pages/internal/EventManagement';
import { AssetHub } from './pages/internal/AssetHub';
import { GemsLeaderboard } from './pages/internal/GemsLeaderboard';
import { GenerationSettings } from './pages/internal/GenerationSettings';
import { InventoryManagement } from './pages/internal/InventoryManagement';
import { MyProfile } from './pages/internal/MyProfile';
import { FirstPasswordChange } from './components/FirstPasswordChange';

function LandingPage() {
  const { fetchCmsData } = useLandingContentStore();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedDefaultDept, setSelectedDefaultDept] = useState<string | undefined>(undefined);
  const [activeDepartmentDetail, setActiveDepartmentDetail] = useState<Department | null>(null);

  useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  const handleOpenJoinModal = (defaultDept?: string) => {
    setSelectedDefaultDept(defaultDept);
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
    setSelectedDefaultDept(undefined);
  };

  const handleSelectDepartment = (dept: Department) => {
    setActiveDepartmentDetail(dept);
  };

  const handleOpenJdHandbook = () => {
    setActiveDepartmentDetail(DEPARTMENTS_DATA[0]);
  };

  const handleCloseDepartmentDetail = () => {
    setActiveDepartmentDetail(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1E1E1E] flex flex-col font-sans selection:bg-[#C3ECF6] selection:text-[#1E1E1E]">
      {/* Top Sticky Navigation */}
      <Navbar
        onOpenJoinModal={() => handleOpenJoinModal()}
        onOpenJdHandbook={handleOpenJdHandbook}
      />

      {/* Main Landing Page Flow */}
      <main className="flex-1">
        <Hero
          onOpenJoinModal={() => handleOpenJoinModal()}
          onOpenJdHandbook={handleOpenJdHandbook}
        />
        <About />
        <Tracks
          onSelectDepartment={handleSelectDepartment}
          onOpenJoinModal={(deptName) => handleOpenJoinModal(deptName)}
        />
        <Impact />
        <Events />
        <Organizers />
        <JoinCTA
          onOpenJoinModal={() => handleOpenJoinModal()}
          onOpenJdHandbook={handleOpenJdHandbook}
        />
      </main>

      {/* Official Footer */}
      <Footer />

      {/* Interactive Chapter Membership Application Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={handleCloseJoinModal}
        defaultDepartment={selectedDefaultDept}
      />

      {/* Interactive Department JD & Handbook Modal */}
      <TrackDetailModal
        department={activeDepartmentDetail}
        onClose={handleCloseDepartmentDetail}
        onJoinDepartment={(deptName) => handleOpenJoinModal(deptName)}
      />
    </div>
  );
}

export default function App() {
  const { user, isLoading, fetchSession } = useAuthStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFFFF] bg-dot-pattern">
        {/* Glow ambient background circles */}
        <div className="absolute w-80 h-80 bg-[#C3ECF6] rounded-full blur-3xl opacity-40 -z-10 animate-pulse pointer-events-none" />
        <div className="absolute w-60 h-60 bg-[#FFE7A5] rounded-full blur-3xl opacity-30 -z-10 pointer-events-none -translate-x-20 translate-y-16" />

        <div className="flex flex-col items-center max-w-sm px-6 text-center animate-fadeIn">
          {/* Logo with gentle floating animation */}
          <div className="relative mb-5 p-4 rounded-2xl bg-white border-2 border-[#1E1E1E] brutal-shadow animate-float">
            <GdgBracketsGlyph size={48} />
          </div>

          {/* Title and version badge */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-extrabold text-[#1E1E1E] tracking-tight">
              GDGoC FPTU OS
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono-code font-bold bg-[#FFE7A5] text-[#1E1E1E] border border-[#1E1E1E] rounded-md">
              v2.4
            </span>
          </div>

          <p className="text-xs text-[#1E1E1E]/70 font-mono-code mb-5">
            Google Developer Groups on Campus • FPT University HCMC
          </p>

          {/* Google 4-Color Animated Progress Track */}
          <div className="w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mb-3 relative">
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] rounded-full animate-shimmer" />
          </div>

          <span className="text-[11px] font-mono-code text-slate-500 font-medium">
            Đang khởi tạo hệ sinh thái GDGoC...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Guest Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Member Login Page */}
        <Route path="/login" element={user ? <Navigate to="/app" /> : <Login />} />

        {/* Member Password Recovery Routes */}
        <Route path="/forgot-password" element={user ? <Navigate to="/app" /> : <ForgotPassword />} />
        <Route path="/reset-password" element={user ? <Navigate to="/app" /> : <ResetPassword />} />

        {/* Internal Member Portal Routes (/app/*) */}
        <Route
          path="/app"
          element={
            user ? (
              <DashboardLayout>
                <DashboardOverview />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/dashboard"
          element={
            user ? (
              <DashboardLayout>
                <DashboardOverview />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/hr"
          element={
            user ? (
              <DashboardLayout>
                <HRManagement />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/settings/generation"
          element={
            user ? (
              <DashboardLayout>
                <GenerationSettings />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/tasks"
          element={
            user ? (
              <DashboardLayout>
                <TaskBoard />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/landing-cms"
          element={
            user ? (
              <DashboardLayout>
                <LandingCMS />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/events"
          element={
            user ? (
              <DashboardLayout>
                <EventManagement />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/assets"
          element={
            user ? (
              <DashboardLayout>
                <AssetHub />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/inventory"
          element={
            user ? (
              <DashboardLayout>
                <InventoryManagement />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/gems"
          element={
            user ? (
              <DashboardLayout>
                <GemsLeaderboard />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/profile"
          element={
            user ? (
              <DashboardLayout>
                <MyProfile />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/change-password"
          element={
            user ? (
              <FirstPasswordChange mode="standard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
