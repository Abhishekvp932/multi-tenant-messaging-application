import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "@/app/store";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const location = useLocation();
  const admin = useSelector((state: RootState) => state.admin.admin);
  const user = useSelector((state: RootState) => state.user.user);

  // Check if user is authenticated based on role
  const isAuthenticated = requiredRole === 'admin' ? !!admin : !!user;
  
  // Check if user has correct role (admin always has admin role, user always has user role)
  const hasCorrectRole = true; // Since we separate by Redux slices, role is implied by which slice we're checking

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginPath = requiredRole === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If authenticated but wrong role, redirect to appropriate page
  if (!hasCorrectRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Higher-order component for admin routes
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" fallbackPath="/user/home">
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for user routes
export function UserRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="user" fallbackPath="/admin/chats">
      {children}
    </ProtectedRoute>
  );
}

// Component for any authenticated user (admin or user)
export function AuthRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const admin = useSelector((state: RootState) => state.admin.admin);
  const user = useSelector((state: RootState) => state.user.user);

  // Check if either admin or user is authenticated
  const isAuthenticated = !!admin || !!user;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
