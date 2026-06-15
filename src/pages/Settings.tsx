import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Settings, Shield, Globe, ShieldAlert, Cpu, CreditCard, PlusCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const SettingsModule: React.FC = () => {
  const { role } = useAuth();

  // App Configurations States (Saved locally or simulated)
  const [weatherApiUrl, setWeatherApiUrl] = useState("https://api.openweathermap.org/data/2.5");
  const [minConfidence, setMinConfidence] = useState(70);
  const [tempTrigger, setTempTrigger] = useState(40);
  const [humidityTrigger, setHumidityTrigger] = useState(85);

  // Admin list state
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">("admin");
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["admin", "super_admin"])
        .order("role", { ascending: false });

      if (error) throw error;
      setAdminsList(data || []);
    } catch (err) {
      console.error("Error fetching admins list:", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    void fetchAdmins();
  }, []);

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPhone.trim()) return;

    if (role !== "super_admin") {
      alert("Only super admins can promote other accounts to administrator roles.");
      return;
    }

    try {
      // Look up user by phone number
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", newAdminPhone.trim())
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        alert("No user profile found with that phone number.");
        return;
      }

      // Update role
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: newAdminRole })
        .eq("id", data.id);

      if (updateError) throw updateError;

      alert(`Successfully promoted ${data.name || "user"} to ${newAdminRole}.`);
      setNewAdminPhone("");
      void fetchAdmins();
    } catch (err) {
      console.error("Error promoting admin:", err);
      alert("Failed to update user role.");
    }
  };

  const handleSaveConfigs = () => {
    alert("Application configuration settings updated successfully.");
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure threshold indices, integrations APIs, and manage administration permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurations Box */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather API settings */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-sm text-slate-800">Weather API Integration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Weather API Base URL</label>
                <input
                  type="text"
                  value={weatherApiUrl}
                  onChange={(e) => setWeatherApiUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Weather Auth Key / Token</label>
                <input
                  type="password"
                  value="••••••••••••••••••••••••••••"
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-400 bg-slate-50 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Trigger Thresholds */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-800">Alert Dispatch Thresholds</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Temperature Trigger (°C)</label>
                <input
                  type="number"
                  value={tempTrigger}
                  onChange={(e) => setTempTrigger(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Humidity Trigger (%)</label>
                <input
                  type="number"
                  value={humidityTrigger}
                  onChange={(e) => setHumidityTrigger(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Diagnostic scanner configurations */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Cpu className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">AI Scanner Confidence Cutoff</h3>
            </div>

            <div className="text-xs">
              <label className="block text-slate-500 font-semibold mb-1">Minimum Confidence Level ({minConfidence}%)</label>
              <input
                type="range"
                min="50"
                max="95"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] text-slate-400 mt-2 block">Matches with ratings below this percentage will be flagged for secondary admin check.</span>
            </div>
          </div>

          <button
            onClick={handleSaveConfigs}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm transition-all-200 active:scale-95"
          >
            Save Configuration
          </button>
        </div>

        {/* Admin Management Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6 self-start">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Shield className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-800">Administrators Registry</h3>
          </div>

          {/* List Admins */}
          <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto pr-2 space-y-2 text-xs">
            {adminsList.map((adm) => (
              <div key={adm.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">{adm.name || "Unnamed Admin"}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{adm.phone}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  adm.role === "super_admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {adm.role.replace("_", " ")}
                </span>
              </div>
            ))}
            {loadingAdmins && (
              <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading admins...
              </div>
            )}
          </div>

          {/* Add Admin Form */}
          {role === "super_admin" && (
            <form onSubmit={handlePromoteAdmin} className="border-t border-slate-100 pt-5 space-y-4 text-xs">
              <span className="font-bold text-slate-900 block uppercase tracking-wide text-[9px]">Add New Admin</span>
              
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Registered Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Administrative Level</label>
                <select
                  value={newAdminRole}
                  onChange={(e: any) => setNewAdminRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Admin
              </button>
            </form>
          )}

          {role !== "super_admin" && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-400 leading-relaxed italic">
              Note: Promoting farmers to administrative privileges requires Super Admin rights. Your account level: {role}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
