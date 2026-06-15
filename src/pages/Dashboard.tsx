import React from "react";
import { StatCard } from "../components/StatCard";
import { 
  Users, AlertCircle, MessageSquare, CreditCard, Scan, CloudSun, DollarSign,
  TrendingUp, Star, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Layers, Cpu, FileText
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";

interface DashboardProps {
  users: any[];
  subscriptions: any[];
  complaints: any[];
  feedbacks: any[];
  scans: any[];
  weatherAlerts: any[];
  farmsMissing: boolean;
  devicesMissing: boolean;
  farmsCount: number;
  devicesCount: number;
  profilesMissing?: boolean;
  profilesSchemaIncomplete?: boolean;
  profilesErrorMsg?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  users,
  subscriptions,
  complaints,
  feedbacks,
  scans,
  weatherAlerts,
  farmsMissing,
  devicesMissing,
  farmsCount,
  devicesCount,
  profilesMissing = false,
  profilesSchemaIncomplete = false,
  profilesErrorMsg = ""
}) => {
  // Real calculations from Supabase tables
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.onboarding_completed || u.profile_completed).length;
  const totalAlerts = weatherAlerts.length;
  const totalReports = complaints.length + feedbacks.length + scans.length + weatherAlerts.length;

  // Recent Activity construction from actual live records (sorted chronologically)
  const getRecentActivities = () => {
    const items: any[] = [];

    users.slice(0, 5).forEach(u => {
      if (u.created_at) {
        items.push({
          id: `usr-${u.id}`,
          message: `Farmer "${u.name || "Anonymous"}" signed up from ${u.village || "unknown village"}, ${u.district || "unknown district"}.`,
          timestamp: new Date(u.created_at),
          type: "user"
        });
      }
    });

    complaints.slice(0, 5).forEach(c => {
      if (c.created_at) {
        items.push({
          id: `comp-${c.id}`,
          message: `Complaint ticket filed by ${c.name}: "${c.subject}" (${c.status})`,
          timestamp: new Date(c.created_at),
          type: "complaint"
        });
      }
    });

    feedbacks.slice(0, 5).forEach(f => {
      if (f.created_at) {
        items.push({
          id: `feed-${f.id}`,
          message: `Review submitted: ${f.rating} ★ - "${f.feedback_message.substring(0, 50)}..."`,
          timestamp: new Date(f.created_at),
          type: "feedback"
        });
      }
    });

    scans.slice(0, 5).forEach(s => {
      if (s.created_at) {
        items.push({
          id: `scan-${s.id}`,
          message: `Crop Disease scanner detection: ${s.crop_name} diagnosed with ${s.disease_name} (${s.confidence_score}% Match)`,
          timestamp: new Date(s.created_at),
          type: "scan"
        });
      }
    });

    weatherAlerts.slice(0, 5).forEach(a => {
      if (a.created_at) {
        items.push({
          id: `wth-${a.id}`,
          message: `Weather broadcast sent: "${a.title}" severity ${a.severity} targeted at ${a.district || "all districts"}.`,
          timestamp: new Date(a.created_at),
          type: "weather"
        });
      }
    });

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
  };

  const recentActivities = getRecentActivities();

  // Registration chart - generated solely from real user dates
  const getChartData = () => {
    const groups: Record<string, number> = {};
    users.forEach(u => {
      if (u.created_at) {
        const dStr = new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        groups[dStr] = (groups[dStr] || 0) + 1;
      }
    });

    return Object.entries(groups)
      .map(([date, count]) => ({ date, count }))
      .slice(-7); // last 7 unique registration dates
  };

  const chartData = getChartData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time agriculture operations monitor and metrics summary.</p>
      </div>

      {/* profiles schema warning banner */}
      {(profilesMissing || profilesSchemaIncomplete) && (
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm space-y-4 max-w-4xl">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">
                Profiles Database Incomplete / Not Connected
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                The database table <code className="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-[10px]">public.profiles</code> is missing critical columns (<code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">role</code> and <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">is_suspended</code>) or the table does not exist in your Supabase schema. This blocks administrator role verification and profile listings.
              </p>
              {profilesErrorMsg && (
                <p className="text-slate-400 font-mono text-[10px] mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                  DB Error: {profilesErrorMsg}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">How to resolve:</span>
            <p className="text-slate-500 leading-normal">
              Go to the **SQL Editor** in your **Supabase Dashboard** and run the following query to add the missing columns, create the RLS security helper function, and configure admin policies:
            </p>
            
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner">
{`-- 1. Add role and is_suspended columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- 2. Create security definer function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Create RLS policies for admins on profiles table
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Grant admin rights to your user profile (e.g. phone: 9023829347)
UPDATE public.profiles
SET role = 'super_admin'
WHERE phone = '9023829347';`}
            </pre>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={ShieldCheck}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Total Farms"
          value={farmsMissing ? "Table Missing" : farmsCount}
          icon={Layers}
          iconColor={farmsMissing ? "text-red-500" : "text-purple-600"}
          bgColor={farmsMissing ? "bg-red-50 animate-pulse-soft" : "bg-purple-50"}
        />
        <StatCard
          title="Total Alerts"
          value={totalAlerts}
          icon={CloudSun}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Total Devices"
          value={devicesMissing ? "Table Missing" : devicesCount}
          icon={Cpu}
          iconColor={devicesMissing ? "text-red-500" : "text-indigo-600"}
          bgColor={devicesMissing ? "bg-red-50 animate-pulse-soft" : "bg-indigo-50"}
        />
        <StatCard
          title="Total Reports"
          value={totalReports}
          icon={FileText}
          iconColor="text-teal-600"
          bgColor="bg-teal-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User signups growth chart (from actual db dates only) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm xl:col-span-2">
          <div className="mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">User Registration Frequency</h4>
            <p className="text-slate-400 text-xs mt-0.5">Calculated dynamically from profiles table records</p>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                No user growth dates found.
              </div>
            )}
          </div>
        </div>

        {/* Real-time system activity logs */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Recent System Activity</h4>
            <p className="text-slate-400 text-xs mt-0.5">Live events logged across Supabase database tables</p>
          </div>

          <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-2 text-xs">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex justify-between items-start gap-4 p-2 bg-slate-50 rounded-lg border border-slate-100/60">
                <p className="text-slate-600 leading-normal">{act.message}</p>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {act.timestamp.toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="py-8 text-center text-slate-400 italic">No activity logged in database yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
