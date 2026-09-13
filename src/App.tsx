/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

export default function App() {
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
    // Open modal with the first department as default for browsing
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
