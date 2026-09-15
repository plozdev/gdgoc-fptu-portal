import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface DataScopeGuardProps {
  resourceBanId: string | null; // ID của ban sở hữu dữ liệu (ví dụ data của HR)
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const DataScopeGuard: React.FC<DataScopeGuardProps> = ({ resourceBanId, children, fallback = null }) => {
  const { user } = useAuthStore();

  if (!user) return fallback;

  // Chapter Lead được xem/sửa data của mọi ban
  if (user.tier === 'ORG_ADMIN') {
    return <>{children}</>;
  }

  // Trưởng ban/Member chỉ được xem/sửa data của ban mình
  if (user.banId === resourceBanId) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
