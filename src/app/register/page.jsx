"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Star, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import api from "../../lib/api";

export default function SignUp() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/user/register", form);
      router.push("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#F5F3FF] via-[#F8F7FF] to-white p-16 flex-col justify-between">

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#6366F1] rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-2xl">Vidsage</span>
        </div>

        <div>
          <h1 className="text-6xl font-extrabold leading-[1.1]">
            Learn Smarter, <br />
            <span className="text-[#6366F1]">Together.</span>
          </h1>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl max-w-md">
          <div className="flex text-yellow-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>
          <p className="text-sm text-slate-600">
            Join 500k+ students learning together.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md space-y-5 sm:space-y-8">

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">
              Create an account
            </h2>
            <p className="text-slate-500">
              Start your collaborative learning journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full transition-colors"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-[#6366F1] text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#6366F1] font-bold hover:underline"
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
