import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/app/store";

export function useRouteProtection() {
  const navigate = useNavigate();
  const admin = useSelector((state: RootState) => state.admin.admin);
  const user = useSelector((state: RootState) => state.user.user);

  const protectAdminRoute = () => {
    if (!admin) {
      navigate('/admin/login');
      return false;
    }
    return true;
  };

  const protectUserRoute = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const preventCrossRoleAccess = (currentPath: string) => {
    const isAdminPath = currentPath.startsWith('/admin');
    const isUserPath = currentPath.startsWith('/user') || currentPath === '/home';

    // Admin trying to access user routes
    if (admin && isUserPath) {
      navigate('/admin/chats');
      return false;
    }

    // User trying to access admin routes
    if (user && isAdminPath) {
      navigate('/user/home');
      return false;
    }

    return true;
  };

  return {
    protectAdminRoute,
    protectUserRoute,
    preventCrossRoleAccess,
    isAdmin: !!admin,
    isUser: !!user,
    isAuthenticated: !!admin || !!user
  };
}
