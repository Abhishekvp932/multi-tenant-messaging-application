import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { RootState } from "@/app/store";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'user';
}

export default function RouteGuard({ children, allowedRole }: RouteGuardProps) {
  console.log(allowedRole)
  const navigate = useNavigate();
  const location = useLocation();
  const admin = useSelector((state: RootState) => state.admin.admin);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    // Check if current path requires specific role
    const isAdminPath = location.pathname.startsWith('/admin');
    const isUserPath = location.pathname.startsWith('/user') || location.pathname === '/home';

    // If user is logged in and tries to access wrong role routes
    if (admin && isUserPath) {
      // Admin trying to access user routes - redirect to admin dashboard
      navigate('/admin/chats', { replace: true });
      return;
    }

    if (user && isAdminPath) {
      // User trying to access admin routes - redirect to user home
      navigate('/user/home', { replace: true });
      return;
    }

    // If no one is logged in and trying to access protected routes
    if (!admin && !user && (isAdminPath || isUserPath)) {
      // Redirect to login
      navigate('/', { replace: true });
      return;
    }
  }, [admin, user, location.pathname, navigate]);

  return <>{children}</>;
}
