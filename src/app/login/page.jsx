"use client";

import { useState } from "react";
import { Sparkles, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/api"; // make sure this exists

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/user/login", {
        email,
        password,
      });

      router.push("/");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6">
      <div className="w-full max-w-[500px] bg-white p-12 rounded-[40px] shadow-2xl shadow-indigo-100">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-[#6366F1] rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white w-7 h-7" />
            </div>
            <span className="font-bold text-3xl">Vidsage</span>
          </div>

          <h2 className="text-3xl font-extrabold mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-10">
            Continue your learning journey
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <label className="text-sm font-bold ml-1">Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold ml-1">Password</label>
              <div className="relative mt-2">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Eye
                  size={18}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-[#6366F1] text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-10 text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#6366F1] font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
