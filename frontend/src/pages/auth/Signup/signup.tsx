import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Signup } from "@/services/auth";
import { handleApiError } from "@/utils/handleApiError";

// 1. Updated Interface
interface SignupData {
  phone: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user" | "admin"; // New field
  organizationName?: string; // New conditional field
}

interface ErrorData {
  phone?: string;
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  organizationName?: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "user", // Default role
    organizationName: "",
  });

  const [error, setError] = useState<ErrorData>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();

  const validation = () => {
    const newError: ErrorData = {};
    let isValidate = true;

    if (!formData.name) {
      newError.name = "Name is required";
      isValidate = false;
    }

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

    if (!formData.phone) {
      newError.phone = "Phone Number Required";
      isValidate = false;
    } else if (formData.phone.length < 10) {
      newError.phone = "Phone number must be 10 digits";
      isValidate = false;
    }

    // New: Validation for Admin organization
    if (formData.role === "admin" && !formData.organizationName) {
      newError.organizationName = "Organization name is required for admins";
      isValidate = false;
    }

    if (!formData.password) {
      newError.password = "Password is required";
      isValidate = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newError.confirmPassword = "Passwords must match";
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
      const res = await Signup(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.role, // Pass role to backend
        formData.organizationName // Pass organization to backend
      );
      toast.success(res.msg);
      setIsLoading(false);
      navigation("/");
    } catch (error) {
      toast.error(handleApiError(error));
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create account</h2>
            <p className="text-sm text-muted-foreground">Join us and start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Register as</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={formData.role === "user"}
                    onChange={() => setFormData({ ...formData, role: "user", organizationName: "" })}
                    className="accent-primary"
                  />
                  <span className="text-sm">User</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={formData.role === "admin"}
                    onChange={() => setFormData({ ...formData, role: "admin" })}
                    className="accent-primary"
                  />
                  <span className="text-sm">Admin</span>
                </label>
              </div>
            </div>

            {/* Conditional Input for Admin */}
            {formData.role === "admin" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <label htmlFor="org" className="block text-sm font-medium text-foreground">
                  Organization Name
                </label>
                <Input
                  id="org"
                  placeholder="Company or Agency Name"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="bg-input text-sm"
                />
                {error.organizationName && <p className="text-xs text-red-500">{error.organizationName}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Full name</label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input text-sm"
              />
              {error.name && <p className="text-xs text-red-500">{error.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-input text-sm"
              />
              {error.email && <p className="text-xs text-red-500">{error.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Phone</label>
              <Input
                type="tel"
                placeholder="1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-input text-sm"
              />
              {error.phone && <p className="text-xs text-red-500">{error.phone}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-input text-sm"
                />
                {error.password && <p className="text-xs text-red-500">{error.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Confirm</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-input text-sm"
                />
                {error.confirmPassword && <p className="text-xs text-red-500">{error.confirmPassword}</p>}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-md transition-colors"
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/" className="font-medium text-primary hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
      <ToastContainer autoClose={2000} />
    </main>
  );
}