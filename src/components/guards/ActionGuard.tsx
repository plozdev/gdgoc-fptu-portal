import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Tier } from '../../mocks/fixtures/users';

interface ActionGuardProps {
  requiredTier: Tier[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ActionGuard: React.FC<ActionGuardProps> = ({ requiredTier, children, fallback = null }) => {
  const { user } = useAuthStore();

  if (!user) return fallback;

  if (requiredTier.includes(user.tier)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
