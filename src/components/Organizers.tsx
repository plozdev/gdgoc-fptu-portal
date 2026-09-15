import React, { useState } from 'react';
import { Github, Linkedin, Globe, Sparkles, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { useLandingContentStore } from '../store/useLandingContentStore';
import { OrganizerMember } from '../types';

export const Organizers: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const organizers = useLandingContentStore((s) => s.organizers);

  const domains = ['ALL', 'Leads', 'Tech', 'Design & Media', 'Event Operations'];

  const filteredOrganizers =
    activeDomain === 'ALL'
      ? organizers
      : organizers.filter((org) => org.domain === activeDomain);

  return (
    <section id="organizers" className="py-20 sm:py-28 bg-[#FFFFFF] relative border-t border-[#1E1E1E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFE7A5] border-[2.5px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 05. CORE COMMUNITY LEADS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Meet the Student Organizers
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/85 max-w-2xl">
              Dedicated student developers and community leads driving technical excellence and community engagement at FPT University HCMC.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-2xl brutal-shadow-sm self-start sm:self-auto">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setActiveDomain(dom)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeDomain === dom
                    ? 'bg-[#1E1E1E] text-[#FFFFFF]'
                    : 'text-[#1E1E1E] hover:bg-[#F0F0F0]'
                }`}
              >
                {dom === 'ALL' ? 'All Leads' : dom}
              </button>
            ))}
          </div>
        </div>

        {/* Organizers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredOrganizers.map((org) => (
            <div
              key={org.id}
              className="bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[24px] p-6 brutal-shadow-sm brutal-shadow-hover flex flex-col justify-between transition-all group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Avatar with Google colored dot badge */}
                <div className="relative w-20 h-20">
                  <img
                    src={org.avatarUrl}
                    alt={org.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#1E1E1E] shadow-sm"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#1E1E1E] flex items-center justify-center font-bold text-[10px] text-[#FFFFFF] shadow-sm"
                    style={{ backgroundColor: org.dotColor }}
                    title={`Google ${org.domain} Lead`}
                  >
                    G
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono-code font-bold border border-[#1E1E1E] bg-[#F0F0F0] text-[#1E1E1E] inline-block">
                    {org.domain}
                  </span>
                  <h3 className="font-extrabold text-lg text-[#1E1E1E] leading-snug">
                    {org.name}
                  </h3>
                  <div
                    className="font-bold text-xs sm:text-sm leading-tight"
                    style={{ color: org.color }}
                  >
                    {org.role}
                  </div>
                  <p className="font-mono-code text-[11px] text-[#1E1E1E]/75 font-semibold pt-0.5">
                    {org.major} • {org.cohort}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#1E1E1E]/85 leading-relaxed font-normal pt-1 border-t border-[#1E1E1E]/10">
                  {org.bio}
                </p>
              </div>

              {/* Bottom Socials & Tag */}
              <div className="pt-4 mt-4 border-t border-[#1E1E1E]/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1E1E1E]/80">
                  {org.githubUrl && (
                    <a
                      href={org.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-[#F0F0F0] hover:text-[#4285F4] transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {org.linkedinUrl && (
                    <a
                      href={org.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-[#F0F0F0] hover:text-[#4285F4] transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {org.portfolioUrl && (
                    <a
                      href={org.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-[#F0F0F0] hover:text-[#34A853] transition-colors"
                      aria-label="Profile / Portfolio"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <span className="font-mono-code text-[10px] font-bold text-[#1E1E1E]/70 px-2 py-0.5 rounded bg-[#F0F0F0] border border-[#1E1E1E]/20">
                  FPTU
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner as in Reference Design */}
        <div className="mt-12 p-5 sm:p-6 bg-[#C3ECF6] border-[2.5px] border-[#1E1E1E] rounded-2xl brutal-shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1E1E] flex items-center justify-center text-[#4285F4] shrink-0 mx-auto sm:mx-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E]">
                Want to lead a tech domain or coordinate events?
              </h4>
              <p className="text-xs text-[#1E1E1E]/80 font-mono-code font-medium">
                GDG on Campus FPT University opens core team recruitment at the start of each academic semester.
              </p>
            </div>
          </div>

          <span className="px-4 py-2 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-xl text-xs font-mono-code font-bold text-[#1E1E1E] shrink-0 whitespace-nowrap shadow-xs">
            Open for K18 - K20
          </span>
        </div>

      </div>
    </section>
  );
};
