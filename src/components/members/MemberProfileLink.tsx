import React from 'react';
import { Link } from 'react-router-dom';

export function MemberProfileLink({
  id,
  mssv,
  children,
  className = '',
}: {
  id?: string;
  mssv?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const target = mssv || id;
  if (!target) return <span className={className}>{children}</span>;
  return (
    <Link
      to={`/app/members/${encodeURIComponent(target)}`}
      onClick={(event) => event.stopPropagation()}
      className={`hover:text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 ${className}`}
    >
      {children}
    </Link>
  );
}

