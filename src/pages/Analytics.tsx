import React from "react";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line 
} from "recharts";
import { TrendingUp, Activity, BarChart3, PieChartIcon } from "lucide-react";

interface AnalyticsProps {
  users: any[];
  subscriptions: any[];
  scans: any[];
  complaints: any[];
  feedbacks: any[];
  weatherAlerts: any[];
}

export const Analytics: React.FC<AnalyticsProps> = ({
  users,
  subscriptions,
  scans,
  complaints,
  feedbacks,
  weatherAlerts
}) => {
  // 1. User Growth (last 6 months - simulated or based on real created_at)
  const getUserGrowthData = () => {
    const months: Record<string, number> = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0 };
    users.forEach(u => {
      if (u.created_at) {
        const monthName = new Date(u.created_at).toLocaleString("en-US", { month: "short" });
        if (months[monthName] !== undefined) {
          months[monthName]++;
        }
      }
    });

    let cumulative = 0;
    return Object.entries(months).map(([month, count]) => {
      cumulative += count;
      return { name: month, Farmers: cumulative };
    });
  };

  const userGrowthData = getUserGrowthData();

  // 2. Weather alerts distribution by severity
  const getAlertSeverityData = () => {
    const severities: Record<string, number> = { green: 0, yellow: 0, orange: 0, red: 0 };
    weatherAlerts.forEach(a => {
      if (severities[a.severity] !== undefined) {
        severities[a.severity]++;
      }
    });
    return Object.entries(severities).map(([name, count]) => ({
      name: name.toUpperCase(),
      count
    }));
  };

  const alertSeverityData = getAlertSeverityData();
  const SEVERITY_COLORS = ["#10B981", "#F59E0B", "#F97316", "#EF4444"];

  // 3. Scanner disease detections breakdown
  const getDiseaseData = () => {
    const diseases: Record<string, number> = {};
    scans.forEach(s => {
      diseases[s.disease_name] = (diseases[s.disease_name] || 0) + 1;
    });
    return Object.entries(diseases)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const diseaseData = getDiseaseData();

  // 4. District Distribution of Farmers
  const getDistrictDistribution = () => {
    const dists: Record<string, number> = {};
    users.forEach(u => {
      if (u.district) {
        const key = u.district;
        dists[key] = (dists[key] || 0) + 1;
      }
    });
    return Object.entries(dists)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const districtData = getDistrictDistribution();
  const COLORS_DIST = ["#16A34A", "#2563EB", "#F59E0B", "#8B5CF6", "#EC4899"];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Enterprise Analytics</h2>
        <p className="text-slate-500 text-sm mt-1">Cross-sectional charts analyzing user acquisition, risk categories, and app usage.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-slate-800 text-sm">Cumulative User Growth</h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUserGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Farmers" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorUserGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">Top Districts Distribution</h4>
          </div>
          <div className="h-64 flex items-center justify-center">
            {districtData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={districtData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {districtData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_DIST[index % COLORS_DIST.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-xs italic">No regional metrics available.</p>
            )}
          </div>
        </div>

        {/* Disease Detections Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-sm">Most Common Crop Infections</h4>
          </div>
          <div className="h-64">
            {diseaseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseaseData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No scanning activities recorded.
              </div>
            )}
          </div>
        </div>

        {/* Weather Alerts Severity */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-amber-600" />
            <h4 className="font-bold text-slate-800 text-sm">Dispatched Alerts by Severity</h4>
          </div>
          <div className="h-64">
            {alertSeverityData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertSeverityData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {alertSeverityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No alerts logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
