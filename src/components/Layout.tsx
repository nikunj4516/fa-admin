import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, Users, CloudSun, Scan, ClipboardList, MessageSquare, 
  CreditCard, Bell, TrendingUp, Settings, FileText, LogOut, Menu, X, Shield,
  Layers, Cpu
} from "lucide-react";

export type SidebarTab = 
  | "dashboard"
  | "users"
  | "farms"
  | "devices"
  | "alerts"
  | "scanner"
  | "complaints"
  | "feedback"
  | "subscriptions"
  | "notifications"
  | "analytics"
  | "settings"
  | "logs";

interface LayoutProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const { user, role, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "farms", label: "Farm Management", icon: Layers },
    { id: "devices", label: "Device Management", icon: Cpu },
    { id: "alerts", label: "Alert Management", icon: CloudSun },
    { id: "scanner", label: "Disease Scanner", icon: Scan },
    { id: "complaints", label: "Complaint Management", icon: ClipboardList },
    { id: "feedback", label: "Feedback Management", icon: MessageSquare },
    { id: "subscriptions", label: "Subscription Management", icon: CreditCard },
    { id: "notifications", label: "Notification Center", icon: Bell },
    { id: "analytics", label: "Analytics Dashboard", icon: TrendingUp },
    { id: "settings", label: "Settings Module", icon: Settings },
    { id: "logs", label: "System Logs", icon: FileText }
  ] as const;

  const handleNavClick = (tabId: SidebarTab) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const getRoleBadgeColor = (roleStr: typeof role) => {
    switch (roleStr) {
      case "super_admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-sm leading-none">FarmAlert</h1>
            <span className="text-[10px] text-primary font-semibold tracking-widest uppercase">Admin Panel v3.0</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/10 font-semibold" 
                    : "hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="text-sm font-bold text-white uppercase">
                {user?.email?.[0] || "A"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
              <span className={`inline-block px-2 py-0.2 mt-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
                {role?.replace("_", " ")}
              </span>
            </div>
          </div>
          <button 
            onClick={() => void logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/60 rounded-lg text-xs font-semibold transition-all-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-lg text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">FarmAlert</h1>
            <span className="text-[8px] text-primary font-semibold tracking-wider uppercase">Admin</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-400 hover:text-white"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Mobile Sidebar Navigation */}
      <aside 
        className={`lg:hidden fixed top-16 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-md font-semibold" 
                    : "hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-xs font-bold text-white uppercase">{user?.email?.[0] || "A"}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
              <span className={`inline-block px-1.5 py-0.1 mt-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
                {role?.replace("_", " ")}
              </span>
            </div>
          </div>
          <button 
            onClick={() => void logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/60 rounded-lg text-xs font-semibold transition-all-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
