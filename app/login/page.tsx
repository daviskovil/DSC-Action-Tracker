"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col items-center justify-center p-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-wordmark.png" alt="DataSkate" style={{width: "200px", height: "auto", filter: "brightness(0) invert(1)", marginBottom: "2rem"}} />
        <h2 className="text-white text-2xl font-bold text-center leading-snug">
          DSC Action Tracker
        </h2>
        <p className="text-gray-400 text-sm text-center mt-3 max-w-xs leading-relaxed">
          One shared place for the DataSkate Sales Support Center team to track every action, every owner, every deadline.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-sm">
          {[
            { label: "Team Members", value: "5" },
            { label: "Action Buckets", value: "3" },
            { label: "24hr", value: "SLA" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-brand-500 text-2xl font-bold">{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-wordmark.png" alt="DataSkate" style={{width: "160px", height: "auto"}} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your DSC Tracker account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="you@dataskate.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-lg">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">
            Internal tool — DataSkate team only
          </p>
        </div>
      </div>
    </div>
  );
}
