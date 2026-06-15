import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { 
  ArrowLeft, User, Phone, MapPin, ClipboardList, MessageSquare, 
  Scan, Bell, Calendar, Compass, ShieldAlert, CheckCircle, Ban 
} from "lucide-react";

interface FarmerDetailProps {
  farmer: any;
  subscriptions: any[];
  onBack: () => void;
  onRefresh: () => void;
}

export const FarmerDetail: React.FC<FarmerDetailProps> = ({
  farmer,
  subscriptions,
  onBack,
  onRefresh
}) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch farmer history records
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // 1. Fetch user complaints
        const { data: compData } = await supabase
          .from("complaints")
          .select("*")
          .eq("user_id", farmer.user_id)
          .order("created_at", { ascending: false });
        setComplaints(compData || []);

        // 2. Fetch user feedback
        const { data: feedData } = await supabase
          .from("feedback")
          .select("*")
          .eq("user_id", farmer.user_id)
          .order("created_at", { ascending: false });
        setFeedback(feedData || []);

        // 3. Fetch user scans
        const { data: scansData } = await supabase
          .from("scan_history")
          .select("*")
          .eq("user_id", farmer.user_id)
          .order("created_at", { ascending: false });
        setScans(scansData || []);

        // 4. Fetch alert preferences
        const { data: prefData } = await supabase
          .from("user_alert_preferences")
          .select("*")
          .eq("user_id", farmer.user_id)
          .maybeSingle();
        setPreferences(prefData);

      } catch (err) {
        console.error("Error loading farmer history:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchHistory();
  }, [farmer.user_id]);

  const toggleSuspension = async () => {
    const nextSuspended = !farmer.is_suspended;
    const confirmMsg = nextSuspended 
      ? `Suspend ${farmer.name || "this user"}?`
      : `Activate ${farmer.name || "this user"}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: nextSuspended })
        .eq("id", farmer.id);

      if (error) throw error;
      alert(`User status updated.`);
      farmer.is_suspended = nextSuspended; // update local representation
      onRefresh();
    } catch (err) {
      console.error("Error updating suspension:", err);
      alert("Failed to update status.");
    }
  };

  const getPlan = () => {
    const sub = subscriptions.find(s => s.user_id === farmer.user_id);
    return sub && sub.subscription_status === "active" ? sub.plan_type : "FREE";
  };

  const plan = getPlan();
  const isSuspended = farmer.is_suspended ?? false;

  return (
    <div className="space-y-6">
      {/* Header back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors active:scale-95 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Farmer Profile details</h2>
          <p className="text-slate-500 text-xs mt-0.5">UID: {farmer.user_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6 self-start">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden mb-4 flex items-center justify-center">
              {farmer.profile_image_url ? (
                <img src={farmer.profile_image_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-slate-400" />
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-800">{farmer.name || "Incomplete Profile"}</h3>
            <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider mt-2 ${
              plan === "PRO" 
                ? "bg-purple-50 text-purple-700 border-purple-100" 
                : plan === "PREMIUM"
                ? "bg-blue-50 text-blue-700 border-blue-100"
                : "bg-slate-50 text-slate-600 border-slate-100"
            }`}>
              {plan} Plan
            </span>

            <div className="flex gap-2 w-full mt-6">
              <button
                onClick={toggleSuspension}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border transition-all-200 active:scale-95 ${
                  isSuspended 
                    ? "bg-green-50 hover:bg-green-100/80 text-green-700 border-green-200" 
                    : "bg-red-50 hover:bg-red-100/80 text-red-700 border-red-200"
                }`}
              >
                {isSuspended ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Activate Account
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5" />
                    Suspend Account
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Details</h4>
            
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-mono text-xs">{farmer.phone || "N/A"}</span>
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">{farmer.village || "N/A"}</p>
                <p className="text-xs text-slate-400">{farmer.taluka ? `${farmer.taluka}, ` : ""}{farmer.district || "N/A"}, {farmer.state || "Gujarat"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Joined: {farmer.created_at ? new Date(farmer.created_at).toLocaleDateString() : "N/A"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Compass className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-xs font-mono">
                {farmer.latitude ? `${farmer.latitude.toFixed(4)}, ${farmer.longitude.toFixed(4)}` : "No GPS logs"}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Farming Specifics</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Crop Category</span>
                <p className="font-semibold text-slate-800 mt-0.5">{farmer.crop_type || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Crop Name</span>
                <p className="font-semibold text-slate-800 mt-0.5">{farmer.crop_name || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Farming Method</span>
                <p className="font-semibold text-slate-800 mt-0.5">{farmer.farming_type || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400">Land Size</span>
                <p className="font-semibold text-slate-800 mt-0.5">{farmer.land_size ? `${farmer.land_size} Acres` : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Activities Logs Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather Alert Preferences */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-sm text-slate-800">Weather Alert Preferences</h4>
            </div>
            
            {preferences ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span>Weather Alerts</span>
                  <span className={`px-2 py-0.5 rounded-full ${preferences.weather_alerts_enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {preferences.weather_alerts_enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span>Farming Tips</span>
                  <span className={`px-2 py-0.5 rounded-full ${preferences.farming_tips_enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {preferences.farming_tips_enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span>Preferred Language</span>
                  <span className="uppercase text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                    {preferences.preferred_language || farmer.preferred_language || "gu"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No custom notification preferences configured (using defaults: GU, Enabled).</p>
            )}
          </div>

          {/* AI Scanner History */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-800">Crop Health Scanner Logs ({scans.length})</h4>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-2 text-xs">
              {scans.map((s) => (
                <div key={s.id} className="py-3 flex gap-4">
                  {s.image_url ? (
                    <img src={s.image_url} alt="disease" className="h-12 w-12 object-cover rounded-lg shrink-0 border border-slate-100" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Scan className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-800">{s.crop_name}</span>
                      <span className="text-slate-400 text-[10px]">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-red-500 font-medium mt-0.5">{s.disease_name}</p>
                    <p className="text-slate-500 text-[10px] mt-1 italic truncate">{s.recommendation}</p>
                  </div>
                  <div className="shrink-0 flex flex-col justify-between items-end">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-[9px]">
                      {s.confidence_score}% Match
                    </span>
                  </div>
                </div>
              ))}
              {scans.length === 0 && (
                <p className="py-4 text-center text-slate-400 italic">No scanner logs available for this farmer.</p>
              )}
            </div>
          </div>

          {/* Complaints History */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              <h4 className="font-bold text-sm text-slate-800">Complaint Tickets ({complaints.length})</h4>
            </div>

            <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-2 text-xs">
              {complaints.map((c) => (
                <div key={c.id} className="py-3 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{c.subject}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      c.status === "Resolved" 
                        ? "bg-green-50 text-green-700" 
                        : c.status === "Pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-500">{c.message}</p>
                  {c.admin_reply && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                      <span className="font-semibold text-slate-700 text-[10px]">Admin Reply: </span>
                      <span className="text-slate-600">{c.admin_reply}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 self-end">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
              {complaints.length === 0 && (
                <p className="py-4 text-center text-slate-400 italic">No tickets filed by this farmer.</p>
              )}
            </div>
          </div>

          {/* Feedback History */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h4 className="font-bold text-sm text-slate-800">Reviews & Feedback ({feedback.length})</h4>
            </div>

            <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-2 text-xs">
              {feedback.map((f) => (
                <div key={f.id} className="py-3 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < f.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 italic mt-1">"{f.feedback_message}"</p>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-1">Language: {f.language}</span>
                </div>
              ))}
              {feedback.length === 0 && (
                <p className="py-4 text-center text-slate-400 italic">No reviews submitted by this farmer.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
