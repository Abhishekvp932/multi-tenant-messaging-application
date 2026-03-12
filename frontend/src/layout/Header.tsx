"use client";

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { Button } from '@/components/ui/button';
import { Home, User, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { logout } from "@/features/userSlice";
import { handleApiError } from "@/utils/handleApiError";
import { Logout } from "@/services/user";

// const IS_LOGGED_IN = true;
// const mockUser = { name: 'Alex Johnson', email: 'alex@example.com' };

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.user.user);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigation = useNavigate();

  useEffect(() => {
    if (!user) {
      navigation("/");
    }
  }, [user, navigation]);

  const handleLogout = async() => {
   try {
     setDropdownOpen(false);
    logout();
    await Logout();
    navigation("/");
   } catch (error) {
    handleApiError(error);
   }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground">
              PropertyHub
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/list"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Browse
            </Link>
            <Link
              to="/sell-page"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sell
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>


                  {/* Logout Option */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
