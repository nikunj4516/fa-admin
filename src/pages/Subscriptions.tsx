import React from "react";
import { CreditCard, DollarSign, Activity, TrendingUp, Sparkles, UserPlus } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { ExportButton } from "../components/ExportButton";

interface SubscriptionsProps {
  subscriptions: any[];
  users: any[];
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({
  subscriptions,
  users
}) => {
  const totalUsers = users.length;
  const activeSubs = subscriptions.filter(s => s.subscription_status === "active");

  const freeCount = totalUsers - activeSubs.length;
  const premiumCount = activeSubs.filter(s => s.plan_type === "PREMIUM").length;
  const proCount = activeSubs.filter(s => s.plan_type === "PRO").length;

  const conversionRate = totalUsers > 0 
    ? (((premiumCount + proCount) / totalUsers) * 100).toFixed(1)
    : "0.0";

  // Monthly Revenue estimation: PREMIUM @ 99, PRO @ 199
  const monthlyRevenue = (premiumCount * 99) + (proCount * 199);
  const annualRevenue = monthlyRevenue * 12;

  // Chart Data
  const planData = [
    { name: "Free Tier", value: freeCount < 0 ? 0 : freeCount },
    { name: "Premium Tier", value: premiumCount },
    { name: "Pro Tier", value: proCount }
  ];

  const COLORS = ["#94A3B8", "#3B82F6", "#8B5CF6"];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Subscription Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor subscription tiers, premium conversions, and estimated platform MRR.</p>
        </div>
        <ExportButton
          data={subscriptions}
          filename="farmalert_subscriptions_log"
          headers={["ID", "User ID", "Plan Type", "Status", "Updated At"]}
          keys={["id", "user_id", "plan_type", "subscription_status", "updated_at"]}
          label="Export Subscriptions"
        />
      </div>

      {/* Subscription stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MRR Estimate</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{monthlyRevenue}</h3>
            <p className="text-slate-400 text-[10px] mt-1">ARR Est: ₹{annualRevenue}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Premium conversion</span>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{conversionRate}%</h3>
            <p className="text-slate-400 text-[10px] mt-1">{premiumCount + proCount} active subscribers</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pro Tier Active</span>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{proCount} Users</h3>
            <p className="text-slate-400 text-[10px] mt-1">Full AI Scanner access</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Premium Tier Active</span>
            <h3 className="text-2xl font-bold text-orange-600 mt-1">{premiumCount} Users</h3>
            <p className="text-slate-400 text-[10px] mt-1">Smart SMS/Weather alerts</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <UserPlus className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upgrade history */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm xl:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Recent Upgrade Logs</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Plan Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Updated Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                {subscriptions.slice(0, 10).map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-800">{sub.user_id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        sub.plan_type === "PRO" 
                          ? "bg-purple-50 text-purple-700" 
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {sub.plan_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold ${
                        sub.subscription_status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${
                          sub.subscription_status === "active" ? "bg-green-500" : "bg-slate-400"
                        }`} />
                        {sub.subscription_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      {new Date(sub.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">No upgrade actions reported.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Tiers distribution chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Plan Distribution</h4>
            <p className="text-slate-400 text-xs mt-0.5">Summary of user registration subscription tiers</p>
          </div>

          <div className="h-60 flex items-center justify-center">
            {totalUsers > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs italic">No user data available.</div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
            <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 block">SaaS Advisory:</span> Pro subscribers represent your highest LTV cohort. Retaining them via targeted weather advice drives stable platform MRR.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
