import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Login } from "@/services/auth";
import { toast, ToastContainer } from "react-toastify";
import { handleApiError } from "@/utils/handleApiError";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/userSlice";
import { setAdmin } from "@/features/adminSlice";
import type { RootState } from "@/app/store";

interface LoginData {
  email: string;
  password: string;
}

interface ErrorData {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<ErrorData>({ email: "", password: "" });

  const user = useSelector((state: RootState) => state.user.user);
  const admin = useSelector((state: RootState) => state.admin.admin);

  const dispatch = useDispatch();
  const navigation = useNavigate();

  useEffect(() => {
    if (user) {
      navigation("/user/home");
    }
  }, [user, navigation]);

  useEffect(() => {
    if (admin) {
      navigation("/organization/dashboard");
    }
  }, [admin, navigation]);
  const validation = () => {
    const newError = { email: "", password: "" };
    let isValidate = true;

    if (!formData.email) {
      newError.email = "Email is required";
      isValidate = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        newError.email = "Email format is not correct";
        isValidate = false;
      }
    }

    if (!formData.password) {
      newError.password = "Password is required";
      isValidate = false;
    }

    setError(newError);
    return isValidate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation()) return;
    setIsLoading(true);

    try {
      const res = await Login(formData.email, formData.password);
      toast.success(res.msg);
      setIsLoading(false);
      if (res.role == "user") {
        dispatch(
          setUser({
            _id: res?._id,
            name: res?.name,
            email: res?.email,
            organizationName: res?.organizationName,
            role: res?.role,
          }),
        );
        navigation("/home");
      } else if (res.role == "admin") {
        dispatch(
          setAdmin({
            _id: res?._id,
            name: res?.name,
            email: res?.email,
            organizationName: res?.organizationName,
            role: res?.role,
          }),
        );
        navigation("/organization/dashboard");
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(handleApiError(error));
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 py-8 sm:py-12">
      <Card className="w-full max-w-sm sm:max-w-md border-0 shadow-lg">
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Form Title */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
              />
              {error.email && (
                <p style={{ color: "red" }} className="text-xs">
                  {error.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-foreground"
                >
                  Password
                </label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
              />
              {error.password && (
                <p style={{ color: "red" }} className="text-xs">
                  {error.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 sm:py-2.5 rounded-md transition-colors text-sm sm:text-base"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground font-medium">
              OR
            </span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
      <ToastContainer autoClose={200} />
    </main>
  );
}
