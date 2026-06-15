import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Shield, Lock, Mail, AlertCircle, Phone, Smartphone, Check } from "lucide-react";

export const Login: React.FC = () => {
  const [loginMode, setLoginMode] = useState<"email" | "phone">("phone");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email/Password States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone OTP States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Verify role helper
  const verifyAdminRoleAndProceed = async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      if (profileError.code === "42703" || profileError.message.includes("role")) {
        throw new Error("Database Schema Incomplete: The 'role' column is missing from 'profiles' table. Please run the SQL migration script (available in /supabase/migrations) in your Supabase SQL editor to create it.");
      }
      if (profileError.code === "42P01" || profileError.message.includes("does not exist")) {
        throw new Error("Database Table Missing: The 'profiles' table was not found. Please verify your Supabase database schema.");
      }
      throw new Error(`Unable to verify user account status: ${profileError.message}`);
    }

    const role = profileData?.role;
    if (role !== "admin" && role !== "super_admin") {
      await supabase.auth.signOut();
      throw new Error("Access Denied: This account does not have administrator privileges.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data?.user) {
        await verifyAdminRoleAndProceed(data.user.id);
      }
    } catch (err: any) {
      console.error("Email login error:", err);
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Format phone number to E.164 if not already present
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      // Default to Indian country code +91
      formattedPhone = `+91${formattedPhone}`;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (error) throw error;
      setOtpSent(true);
      setSuccessMsg(`OTP verification code sent to ${formattedPhone}.`);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setErrorMsg(err.message || "Failed to dispatch verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !phoneNumber.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode.trim(),
        type: "sms"
      });

      if (error) throw error;
      if (data?.user) {
        await verifyAdminRoleAndProceed(data.user.id);
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FarmAlert Enterprise</h1>
          <p className="text-slate-400 text-sm mt-1">SaaS Administrative Dashboard</p>
        </div>

        {/* Mode Toggles */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800/80">
          <button
            onClick={() => { setLoginMode("phone"); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              loginMode === "phone" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Phone Number OTP
          </button>
          <button
            onClick={() => { setLoginMode("email"); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              loginMode === "email" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Email & Password
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-4 bg-red-950/40 border border-red-900/60 rounded-xl flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-normal">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 bg-green-950/40 border border-green-900/60 rounded-xl flex items-start gap-3 text-green-300 text-xs">
            <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            <p className="leading-normal">{successMsg}</p>
          </div>
        )}

        {/* 1. Phone OTP Form */}
        {loginMode === "phone" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-primary/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-all-200 flex justify-center items-center gap-1.5 active:scale-[0.98] shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  <Smartphone className="h-4.5 w-4.5" />
                  {loading ? "Sending SMS..." : "Request Access OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    6-Digit verification code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter verification code"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-primary/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all text-sm tracking-widest text-center font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 py-3 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 rounded-xl text-xs font-semibold transition-all"
                  >
                    Edit Phone
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-all-200 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Confirm Verification"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 2. Email & Password Form */}
        {loginMode === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@farmalert.in"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-primary/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-primary/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-all-200 focus:outline-none active:scale-[0.98] shadow-lg shadow-primary/15 disabled:opacity-50"
            >
              {loading ? "Verifying Session..." : "Secure Sign In"}
            </button>
          </form>
        )}

        {/* Sandbox Bypass */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950 px-2 text-slate-500 font-semibold tracking-wider">Developer Sandbox</span>
          </div>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            try {
              const payload = {
                exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
                sub: 'test-user-id',
                email: 'test@example.com',
                phone: '+919999999999',
                app_metadata: { provider: 'email', providers: ['email'] },
                user_metadata: { name: 'FarmAlert Super Admin', phone: '9999999999' },
                role: 'authenticated'
              };

              const header = { alg: "HS256", typ: "JWT" };
              const base64Url = (obj: any) => {
                const str = JSON.stringify(obj);
                return btoa(unescape(encodeURIComponent(str)))
                  .replace(/=/g, "")
                  .replace(/\+/g, "-")
                  .replace(/\//g, "_");
              };
              const token = `${base64Url(header)}.${base64Url(payload)}.signature`;

              const fakeSession = {
                access_token: token,
                token_type: 'bearer',
                expires_in: 3600 * 24 * 365,
                refresh_token: 'fake-refresh-dev',
                user: {
                  id: 'test-user-id',
                  email: 'test@example.com',
                  phone: '+919999999999',
                  user_metadata: { name: 'FarmAlert Super Admin', phone: '9999999999' },
                  app_metadata: { provider: 'email', providers: ['email'] },
                  aud: 'authenticated',
                  role: 'authenticated'
                },
                expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365
              };

              let ref = "jipmjrgsqhjknbtkjhel";
              try {
                const url = import.meta.env.VITE_SUPABASE_URL || "";
                const match = url.match(/https:\/\/([^.]+)\.supabase\.(co|net)/);
                if (match) ref = match[1];
              } catch (e) {
                console.warn(e);
              }

              localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(fakeSession));
              window.location.reload();
            } catch (err: any) {
              console.error(err);
              setErrorMsg("Failed to initialize bypass session.");
            } finally {
              setLoading(false);
            }
          }}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl font-semibold text-xs transition-all-200 focus:outline-none flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>⚡</span> Developer Bypass: Log in with Test Session
        </button>

        <div className="mt-8 text-center text-[10px] text-slate-600 tracking-wider uppercase">
          Authorized Access Only • Secure IPS Monitoring
        </div>
      </div>
    </div>
  );
};
