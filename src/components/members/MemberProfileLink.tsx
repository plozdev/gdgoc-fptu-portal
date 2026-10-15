import React from 'react';
import { Link } from 'react-router-dom';

export function MemberProfileLink({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  if (!id) return <span className={className}>{children}</span>;
  return <Link to={`/app/members/${encodeURIComponent(id)}`} onClick={event => event.stopPropagation()} className={`hover:text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 ${className}`}>{children}</Link>;
}
