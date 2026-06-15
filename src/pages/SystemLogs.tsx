import React from "react";
import { FileText, RefreshCw, Layers, ShieldCheck, UserCheck, CreditCard, Scan, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

interface SystemLogsProps {
  users: any[];
  subscriptions: any[];
  scans: any[];
  complaints: any[];
  feedbacks: any[];
  weatherAlerts: any[];
  onRefresh: () => void;
}

export const SystemLogs: React.FC<SystemLogsProps> = ({
  users,
  subscriptions,
  scans,
  complaints,
  feedbacks,
  weatherAlerts,
  onRefresh
}) => {
  // Construct a unified log array
  const generateAuditLogs = () => {
    const logs: any[] = [];

    // 1. User Signups
    users.forEach(u => {
      if (u.created_at) {
        logs.push({
          id: `usr-reg-${u.id}`,
          type: "USER_SIGNUP",
          message: `Farmer registration created: ${u.name || "Unknown"} (Phone: ${u.phone || "N/A"})`,
          timestamp: new Date(u.created_at),
          severity: "info",
          icon: UserCheck,
          iconColor: "text-green-600",
          bgColor: "bg-green-50"
        });
      }
    });

    // 2. Subscription Changes
    subscriptions.forEach(s => {
      if (s.updated_at) {
        logs.push({
          id: `sub-chg-${s.id}`,
          type: "SUBSCRIPTION_CHANGE",
          message: `Subscription plan updated: User ${s.user_id} upgraded to ${s.plan_type} (${s.subscription_status})`,
          timestamp: new Date(s.updated_at),
          severity: "success",
          icon: CreditCard,
          iconColor: "text-purple-600",
          bgColor: "bg-purple-50"
        });
      }
    });

    // 3. Scanner Usage
    scans.forEach(sc => {
      if (sc.created_at) {
        logs.push({
          id: `scan-evt-${sc.id}`,
          type: "SCANNER_USAGE",
          message: `AI Disease scan completed: Crop ${sc.crop_name} diagnosed with ${sc.disease_name} (Confidence: ${sc.confidence_score}%)`,
          timestamp: new Date(sc.created_at),
          severity: "info",
          icon: Scan,
          iconColor: "text-indigo-600",
          bgColor: "bg-indigo-50"
        });
      }
    });

    // 4. Complaints Dispatch
    complaints.forEach(c => {
      if (c.created_at) {
        logs.push({
          id: `comp-new-${c.id}`,
          type: "COMPLAINT_SUBMIT",
          message: `Support ticket filed by ${c.name}: Subject: "${c.subject}" (${c.category})`,
          timestamp: new Date(c.created_at),
          severity: "warning",
          icon: HelpCircle,
          iconColor: "text-amber-600",
          bgColor: "bg-amber-50"
        });
      }
      if (c.updated_at && c.updated_at !== c.created_at) {
        logs.push({
          id: `comp-upd-${c.id}`,
          type: "COMPLAINT_RESOLVE",
          message: `Support ticket FA-${c.id.substring(0,8).toUpperCase()} updated: status set to ${c.status}`,
          timestamp: new Date(c.updated_at),
          severity: "info",
          icon: ShieldCheck,
          iconColor: "text-blue-600",
          bgColor: "bg-blue-50"
        });
      }
    });

    // 5. Weather alerts dispatched
    weatherAlerts.forEach(a => {
      if (a.created_at) {
        logs.push({
          id: `wth-dis-${a.id}`,
          type: "WEATHER_BROADCAST",
          message: `Weather bulletin dispersed: "${a.title}" severity ${a.severity} targeted at ${a.district || "All districts"}`,
          timestamp: new Date(a.created_at),
          severity: a.severity === "red" ? "danger" : "warning",
          icon: AlertTriangle,
          iconColor: a.severity === "red" ? "text-red-600" : "text-amber-600",
          bgColor: a.severity === "red" ? "bg-red-50" : "bg-amber-50"
        });
      }
    });

    // Sort by timestamp descending
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
  };

  const auditLogs = generateAuditLogs();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Trails & System Logs</h2>
          <p className="text-slate-500 text-sm mt-1">Audit log tracking farmer logins, diagnostics events, broadcasts, and support responses.</p>
        </div>
        
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors active:scale-95 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Audit
        </button>
      </div>

      {/* Audit Logs Table/Timeline */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
          <Layers className="h-5 w-5 text-slate-500" />
          <h4 className="font-bold text-slate-800 text-sm">Chronological Audit Timeline</h4>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:bg-slate-100 max-h-[600px] overflow-y-auto pr-2">
          {auditLogs.map((log) => {
            const Icon = log.icon;
            
            return (
              <div key={log.id} className="flex gap-4 relative items-start text-xs">
                <div className={`h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center shrink-0 z-10 ${log.bgColor}`}>
                  <Icon className={`h-4.5 w-4.5 ${log.iconColor}`} />
                </div>

                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px]">{log.type.replace("_", " ")}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp.toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm mt-1">{log.message}</p>
                </div>
              </div>
            );
          })}
          {auditLogs.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic">No events tracked in this audit run.</div>
          )}
        </div>
      </div>
    </div>
  );
};
