import React from "react";
import { Bell, ShieldAlert, CheckCircle, Mail, HelpCircle, Scan, Trash2 } from "lucide-react";

export interface SystemNotification {
  id: string;
  type: "weather" | "complaint" | "feedback" | "subscription" | "scan" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsProps {
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "weather":
        return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case "complaint":
        return <HelpCircle className="h-5 w-5 text-red-500" />;
      case "feedback":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "subscription":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "scan":
        return <Scan className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Events Ticker</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time logs of farmer activations, scanner detections, and system broadcasts.</p>
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors active:scale-95 shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Activity Logs
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Notifications Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <h4 className="font-bold text-slate-800 text-sm">Live Broadcast Stream</h4>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {unreadCount} Unseen
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 space-y-3">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`pt-3 first:pt-0 flex gap-4 text-xs items-start justify-between p-3 rounded-xl border transition-colors ${
                  n.read ? "bg-white border-transparent" : "bg-slate-50/60 border-slate-100"
                }`}
              >
                <div className="flex gap-3 items-start min-w-0">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0">
                    <h5 className={`font-semibold text-slate-800 text-sm ${n.read ? "text-slate-600" : "text-slate-800"}`}>
                      {n.title}
                    </h5>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-2">
                      {n.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => onMarkAsRead(n.id)}
                    className="shrink-0 text-primary hover:text-primary-dark font-semibold text-[10px] uppercase tracking-wider bg-white border border-slate-200 hover:border-primary/40 px-2 py-1 rounded transition-colors active:scale-95"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="py-12 text-center text-slate-400 italic">
                No active notifications in this session. Go to other tabs and perform operations or check back as events occur!
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Informative Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6 self-start text-xs">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Real-time Stream Setup</h4>
            <p className="text-slate-400 text-[10px] mt-0.5">Supabase WebSocket Channels info</p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">profiles channel</span>
              <p className="text-slate-500 leading-relaxed">Listens to `INSERT` and `UPDATE` on public.profiles to monitor farmer signups and suspension events.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">complaints channel</span>
              <p className="text-slate-500 leading-relaxed">Listens to `INSERT` to trigger administrative support sounds/alerts on incoming farmer complaints.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">scan_history channel</span>
              <p className="text-slate-500 leading-relaxed">Listens to `INSERT` to trace AI crop diagnostics confidence levels across Gujarat villages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
