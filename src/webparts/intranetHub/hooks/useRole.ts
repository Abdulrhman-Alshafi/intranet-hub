import { useState, useEffect } from 'react';
import { SPFI } from '@pnp/sp';
import { UserRole, detectUserRole } from '../utils/roleUtils';

export interface IUseRoleResult {
  role: UserRole;
  isAdmin: boolean;
  isMainAdmin: boolean;
  isLoading: boolean;
}

export function useRole(sp: SPFI | null): IUseRoleResult {
  const [role, setRole] = useState<UserRole>(UserRole.User);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sp) {
      setIsLoading(false);
      return;
    }

    detectUserRole(sp)
      .then(detectedRole => {
        setRole(detectedRole);
        setIsLoading(false);
      })
      .catch(() => {
        setRole(UserRole.User);
        setIsLoading(false);
      });
  }, [sp]);

  return {
    role,
    isAdmin: role === UserRole.Admin || role === UserRole.MainAdmin,
    isMainAdmin: role === UserRole.MainAdmin,
    isLoading,
  };
}
