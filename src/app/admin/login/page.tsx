"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@shopbd.com");
  const [password, setPassword] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdminStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = adminLogin(email, password);
    if (ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <span className="text-3xl font-bold text-[#ef4444]">SHOP</span>
            <span className="text-3xl font-bold text-white">.BD</span>
          </div>
          <p className="text-sm text-slate-400">Admin Panel — Sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome Back</h2>
          <p className="text-sm text-slate-400 mb-6">Enter your credentials to access the admin panel.</p>

          {/* Demo hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 flex gap-2">
            <AlertCircle className="size-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-600">
              <p className="font-semibold mb-0.5">Demo credentials</p>
              <p>Email: admin@shopbd.com</p>
              <p>Password: admin123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#ef4444] focus:ring-2 focus:ring-red-100 transition"
                  placeholder="admin@shopbd.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#ef4444] focus:ring-2 focus:ring-red-100 transition"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="size-3.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0f172a] hover:bg-slate-700 text-white font-semibold rounded-xl transition text-sm disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
