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
import { EventModal } from './components/EventModal';
import { TrackDetailModal } from './components/TrackDetailModal';
import { Department, EventItem } from './types';
import { DEPARTMENTS_DATA } from './data/gdgData';

import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DevUserSwitcher } from './components/dev/DevUserSwitcher';

// Internal Member Portal Pages
import { DashboardOverview } from './pages/internal/DashboardOverview';
import { HRManagement } from './pages/internal/HRManagement';
import { TaskBoard } from './pages/internal/TaskBoard';
import { LandingCMS } from './pages/internal/LandingCMS';
import { EventAttendance } from './pages/internal/EventAttendance';
import { AssetHub } from './pages/internal/AssetHub';
import { GemsLeaderboard } from './pages/internal/GemsLeaderboard';
import { GenerationSettings } from './pages/internal/GenerationSettings';
import { InventoryManagement } from './pages/internal/InventoryManagement';
import { MyProfile } from './pages/internal/MyProfile';

function LandingPage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedDefaultDept, setSelectedDefaultDept] = useState<string | undefined>(undefined);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [activeDepartmentDetail, setActiveDepartmentDetail] = useState<Department | null>(null);

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

  const handleSelectEvent = (event: EventItem) => {
    setActiveEvent(event);
  };

  const handleCloseEvent = () => {
    setActiveEvent(null);
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
        <About onOpenJoinModal={() => handleOpenJoinModal()} />
        <Tracks
          onSelectDepartment={handleSelectDepartment}
          onOpenJoinModal={(deptName) => handleOpenJoinModal(deptName)}
        />
        <Impact />
        <Events onSelectEvent={handleSelectEvent} />
        <Organizers />
        <JoinCTA
          onOpenJoinModal={() => handleOpenJoinModal()}
          onOpenJdHandbook={handleOpenJdHandbook}
        />
      </main>

      {/* Official Footer */}
      <Footer
        onOpenJoinModal={() => handleOpenJoinModal()}
        onOpenJdHandbook={handleOpenJdHandbook}
      />

      {/* Interactive Chapter Membership Application Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={handleCloseJoinModal}
        defaultDepartment={selectedDefaultDept}
      />

      {/* Interactive Event Details & RSVP Modal */}
      <EventModal
        event={activeEvent}
        onClose={handleCloseEvent}
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
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600 font-bold text-sm bg-slate-50 gap-2">
        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        <span>Đang khởi tạo hệ thống GDGoC-OS...</span>
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
                <EventAttendance />
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

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Floating Dev User Switcher for RBAC testing */}
      <DevUserSwitcher />
    </Router>
  );
}
