import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { 
  CloudSun, Bell, AlertTriangle, ShieldCheck, MapPin, 
  PlusCircle, RefreshCw, Send, CheckCircle2, X 
} from "lucide-react";

interface WeatherProps {
  weatherAlerts: any[];
  users: any[];
  onRefresh: () => void;
}

export const Weather: React.FC<WeatherProps> = ({
  weatherAlerts,
  users,
  onRefresh
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"green" | "yellow" | "orange" | "red">("yellow");
  const [district, setDistrict] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [windSpeed, setWindSpeed] = useState("");

  // Statistics
  const totalAlerts = weatherAlerts.length;
  const activeAlerts = weatherAlerts.filter(a => a.is_active).length;

  const redAlerts = weatherAlerts.filter(a => a.severity === "red").length;
  const orangeAlerts = weatherAlerts.filter(a => a.severity === "orange").length;
  const yellowAlerts = weatherAlerts.filter(a => a.severity === "yellow").length;
  const greenAlerts = weatherAlerts.filter(a => a.severity === "green").length;

  // District coverage calculation
  const totalDistricts = new Set(users.map(u => u.district).filter(Boolean)).size;
  const coveredDistricts = new Set(weatherAlerts.map(a => a.district).filter(Boolean)).size;

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("weather_alerts")
        .insert({
          title,
          description,
          severity,
          district: district || null,
          temperature: temperature || null,
          humidity: humidity || null,
          wind_speed: windSpeed || null,
          is_active: true,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 86400000 * 2).toISOString() // 2 days duration
        });

      if (error) throw error;
      
      alert("Weather Alert broadcasted successfully to all targeted farmers.");
      setShowAddModal(false);
      // reset states
      setTitle("");
      setDescription("");
      setSeverity("yellow");
      setDistrict("");
      setTemperature("");
      setHumidity("");
      setWindSpeed("");
      onRefresh();
    } catch (err) {
      console.error("Error creating weather alert:", err);
      alert("Failed to broadcast weather alert.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertState = async (id: string, currentlyActive: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentlyActive ? "deactivate" : "activate"} this alert?`)) return;

    try {
      const { error } = await supabase
        .from("weather_alerts")
        .update({ is_active: !currentlyActive })
        .eq("id", id);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error("Error deactivating alert:", err);
      alert("Failed to update alert state.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Weather Intelligence Engine</h2>
          <p className="text-slate-500 text-sm mt-1">Configure and dispatch instant weather bulletins to farming districts.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all-200 shadow-md shadow-primary/10 active:scale-95 shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Broadcast Alert
        </button>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{activeAlerts} / {totalAlerts}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CloudSun className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Red Alerts</span>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{redAlerts} Dispatch</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Districts Covered</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{coveredDistricts} / {totalDistricts || 1}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Status</span>
            <h3 className="text-sm font-bold text-green-600 mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Connected / Active
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alerts Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm xl:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Dispatched Weather Bulletins</h4>
          
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 space-y-4">
            {weatherAlerts.map((alert) => {
              const isCrit = alert.severity === "red";
              const isWarn = alert.severity === "orange" || alert.severity === "yellow";

              return (
                <div key={alert.id} className="pt-4 first:pt-0 flex gap-4 text-sm items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        isCrit 
                          ? "bg-red-50 text-red-600 border border-red-100" 
                          : isWarn 
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-green-50 text-green-600 border border-green-100"
                      }`}>
                        {alert.severity} alert
                      </span>
                      <span className="text-slate-400 text-xs">• Target: {alert.district || "All Districts"}</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm mt-1">{alert.title}</h5>
                    <p className="text-slate-600 text-xs">{alert.description}</p>
                    
                    {/* Metrics detail */}
                    <div className="flex gap-4 text-[10px] text-slate-400 mt-2 font-mono">
                      {alert.temperature && <span>Temp: {alert.temperature}°C</span>}
                      {alert.humidity && <span>Humid: {alert.humidity}%</span>}
                      {alert.wind_speed && <span>Wind: {alert.wind_speed} km/h</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-2">
                    <span className="text-[10px] text-slate-400">{new Date(alert.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => toggleAlertState(alert.id, alert.is_active)}
                      className={`px-3 py-1 rounded text-xs font-semibold border ${
                        alert.is_active 
                          ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" 
                          : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {alert.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
            {weatherAlerts.length === 0 && (
              <p className="py-12 text-center text-slate-400 italic">No alerts dispatched.</p>
            )}
          </div>
        </div>

        {/* Hazard Hotspots (Visual mock map) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Emergency Hotspots</h4>
            <p className="text-slate-400 text-xs mt-0.5">Gujarat district climate risk index mapping</p>
          </div>

          {/* Simple Mock Heatmap List */}
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-red-50/60 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-red-900">Anand</span>
              </div>
              <span className="text-red-700 font-semibold">High Temp Risk (Red alert)</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-900">Mehsana</span>
              </div>
              <span className="text-amber-700 font-semibold">Low Rainfall Warning</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-bold text-blue-900">Rajkot</span>
              </div>
              <span className="text-blue-700 font-semibold">Humidity Level Warning</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
              <span>Gandhinagar</span>
              <span className="font-medium text-green-600">Stable weather</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
              <span>Ahmedabad</span>
              <span className="font-medium text-green-600">Stable weather</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400">
            Clicking **Broadcast Alert** dispatches high-priority push notifications and WhatsApp/SMS scripts to registered users in these targeted locations.
          </div>
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-100 shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm">Disperse Climate Alert</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Alert Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extreme Heat Wave Warning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 focus:border-primary/80 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Detailed Advisory
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Advisory instructions for farmers (e.g. avoid open field work between 12 PM and 4 PM)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 focus:border-primary/80 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none"
                  >
                    <option value="green">Green (Information)</option>
                    <option value="yellow">Yellow (Advisory)</option>
                    <option value="orange">Orange (Severe Warning)</option>
                    <option value="red">Red (Critical Risk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Target District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Anand (or leave empty for all)"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 focus:border-primary/80 rounded-lg text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Humidity (%)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 70"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Wind Speed (km/h)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-all-200 focus:outline-none flex justify-center items-center gap-2 mt-4 shadow-lg shadow-primary/10"
              >
                <Send className="h-4 w-4" />
                {loading ? "Broadcasting bulletin..." : "Disperse bulletin"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
