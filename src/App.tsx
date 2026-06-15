import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./integrations/supabase/client";

// Components & Layout
import { Layout, SidebarTab } from "./components/Layout";
import { Login } from "./pages/Login";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { Farmers } from "./pages/Farmers";
import { FarmerDetail } from "./pages/FarmerDetail";
import { Farms } from "./pages/Farms";
import { Devices } from "./pages/Devices";
import { Weather } from "./pages/Weather";
import { Scanner } from "./pages/Scanner";
import { Complaints } from "./pages/Complaints";
import { Feedback } from "./pages/Feedback";
import { Subscriptions } from "./pages/Subscriptions";
import { Notifications, SystemNotification } from "./pages/Notifications";
import { Analytics } from "./pages/Analytics";
import { SettingsModule } from "./pages/Settings";
import { SystemLogs } from "./pages/SystemLogs";

import { AlertTriangle } from "lucide-react";

const PortalContent = () => {
  const { user, role, loading: authLoading, isConfigured } = useAuth();
  
  // Tab Navigation & Details View
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);

  // Core Data Lists
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);

  // Farms and Devices tables states
  const [farms, setFarms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [farmsMissing, setFarmsMissing] = useState<boolean>(false);
  const [devicesMissing, setDevicesMissing] = useState<boolean>(false);
  const [farmsErrorMsg, setFarmsErrorMsg] = useState<string>("");
  const [devicesErrorMsg, setDevicesErrorMsg] = useState<string>("");
  
  // Profiles diagnostic states
  const [profilesMissing, setProfilesMissing] = useState<boolean>(false);
  const [profilesSchemaIncomplete, setProfilesSchemaIncomplete] = useState<boolean>(false);
  const [profilesErrorMsg, setProfilesErrorMsg] = useState<string>("");
  
  // Live Events Ticker
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Unified data fetch from Supabase
  const loadPortalData = async () => {
    if (!user || (role !== "admin" && role !== "super_admin")) return;
    setDataLoading(true);

    // 1. Profiles (Farmers)
    try {
      const { data: profs, error: profsError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (profsError) {
        setProfilesErrorMsg(profsError.message);
        if (profsError.code === "42703" || profsError.message.includes("role") || profsError.message.includes("suspended")) {
          setProfilesSchemaIncomplete(true);
        } else if (profsError.code === "42P01" || profsError.message.includes("does not exist")) {
          setProfilesMissing(true);
        }
      } else {
        setUsers(profs || []);
        setProfilesMissing(false);
        setProfilesSchemaIncomplete(false);
      }
    } catch (err: any) {
      console.error("Error loading profiles:", err);
      setProfilesErrorMsg(err.message || "Failed to load profiles");
    }

    // 2. Subscriptions
    try {
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("*")
        .order("updated_at", { ascending: false });
      setSubscriptions(subs || []);
    } catch (err) {
      console.error("Error loading user_subscriptions:", err);
    }

    // 3. Scan History
    try {
      const { data: scanData } = await supabase
        .from("scan_history")
        .select("*")
        .order("created_at", { ascending: false });
      setScans(scanData || []);
    } catch (err) {
      console.error("Error loading scan_history:", err);
    }

    // 4. Complaints
    try {
      const { data: comps } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      setComplaints(comps || []);
    } catch (err) {
      console.error("Error loading complaints:", err);
    }

    // 5. Feedback
    try {
      const { data: feeds } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      setFeedbacks(feeds || []);
    } catch (err) {
      console.error("Error loading feedback:", err);
    }

    // 6. Weather Alerts
    try {
      const { data: alerts } = await supabase
        .from("weather_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      setWeatherAlerts(alerts || []);
    } catch (err) {
      console.error("Error loading weather_alerts:", err);
    }

    // 7. Check Farms table existence programmatically
    try {
      const { data: farmsData, error: farmsError } = await supabase
        .from("farms")
        .select("*");
      
      if (farmsError) {
        setFarmsErrorMsg(farmsError.message);
        if (farmsError.code === "42P01" || farmsError.message.includes("does not exist")) {
          setFarmsMissing(true);
        }
      } else {
        setFarms(farmsData || []);
        setFarmsMissing(false);
      }
    } catch (err) {
      console.error("Error loading farms:", err);
    }

    // 8. Check Devices table existence programmatically
    try {
      const { data: devicesData, error: devicesError } = await supabase
        .from("devices")
        .select("*");
      
      if (devicesError) {
        setDevicesErrorMsg(devicesError.message);
        if (devicesError.code === "42P01" || devicesError.message.includes("does not exist")) {
          setDevicesMissing(true);
        }
      } else {
        setDevices(devicesData || []);
        setDevicesMissing(false);
      }
    } catch (err) {
      console.error("Error loading devices:", err);
    }

    setDataLoading(false);
  };

  // Trigger load on auth state completion
  useEffect(() => {
    if (user && (role === "admin" || role === "super_admin")) {
      void loadPortalData();
    }
  }, [user, role]);

  // Supabase Realtime Channels Event Listeners
  useEffect(() => {
    if (!user || (role !== "admin" && role !== "super_admin")) return;

    // A. Listen to complaints updates
    const complaintsChannel = supabase
      .channel("complaints-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "complaints" },
        (payload) => {
          const newTicket = payload.new;
          setComplaints(prev => [newTicket, ...prev]);
          addNotification({
            type: "complaint",
            title: "New Support Ticket",
            message: `${newTicket.name} filed a ticket: "${newTicket.subject}"`
          });
        }
      )
      .subscribe();

    // B. Listen to feedback reviews
    const feedbackChannel = supabase
      .channel("feedback-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback" },
        (payload) => {
          const newFeed = payload.new;
          setFeedbacks(prev => [newFeed, ...prev]);
          addNotification({
            type: "feedback",
            title: "New Review Received",
            message: `Rating: ${newFeed.rating} ★ - "${newFeed.feedback_message.substring(0, 40)}..."`
          });
        }
      )
      .subscribe();

    // C. Listen to scan activities
    const scanChannel = supabase
      .channel("scan-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_history" },
        (payload) => {
          const newScan = payload.new;
          setScans(prev => [newScan, ...prev]);
          addNotification({
            type: "scan",
            title: "AI Crop Health Scan",
            message: `Crop: ${newScan.crop_name} diagnosed with ${newScan.disease_name} (${newScan.confidence_score}%)`
          });
        }
      )
      .subscribe();

    // D. Listen to user signups
    const profilesChannel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          const newProfile = payload.new;
          setUsers(prev => [newProfile, ...prev]);
          addNotification({
            type: "system",
            title: "New Farmer Signup",
            message: `${newProfile.name || "A new farmer"} has registered on the platform.`
          });
        }
      )
      .subscribe();

    // E. Listen to subscriptions
    const subChannel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_subscriptions" },
        (payload) => {
          const newSub = payload.new;
          setSubscriptions(prev => [newSub, ...prev]);
          addNotification({
            type: "subscription",
            title: "User Subscription Upgrade",
            message: `User ${newSub.user_id} upgraded to plan: ${newSub.plan_type}`
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(complaintsChannel);
      void supabase.removeChannel(feedbackChannel);
      void supabase.removeChannel(scanChannel);
      void supabase.removeChannel(profilesChannel);
      void supabase.removeChannel(subChannel);
    };
  }, [user, role]);

  // Helper to add dynamic system notification logs
  const addNotification = (notif: { type: SystemNotification["type"]; title: string; message: string }) => {
    const fresh: SystemNotification = {
      id: Math.random().toString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [fresh, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Supabase Connection Required</h1>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              The application could not establish a connection to your Supabase project because the environment variables are not configured on Netlify.
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
            <span className="font-bold text-slate-300 block uppercase tracking-wider text-[9px]">How to resolve:</span>
            <p className="text-slate-400 leading-normal">
              Please go to your **Netlify Dashboard**, navigate to **Site configuration** &gt; **Environment variables**, and add the following keys with your Supabase credentials:
            </p>
            <div className="space-y-2 font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-amber-500 font-bold">VITE_SUPABASE_URL</span>
                <span className="text-slate-500 text-[10px]">https://jipmjrgsqhjknbtkjhel.supabase.co</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-amber-500 font-bold">VITE_SUPABASE_PUBLISHABLE_KEY</span>
                <span className="text-slate-400 text-[10px] truncate max-w-[200px]">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-500 font-medium">
            After adding these environment variables, trigger a new deploy on your Netlify Dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-wider text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // Redirect to Login if no active session
  if (!user || (role !== "admin" && role !== "super_admin")) {
    return <Login />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Synchronising database...</p>
      </div>
    );
  }

  const renderTab = () => {
    if (selectedFarmer) {
      return (
        <FarmerDetail 
          farmer={selectedFarmer} 
          subscriptions={subscriptions}
          onBack={() => setSelectedFarmer(null)} 
          onRefresh={loadPortalData}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            users={users} 
            subscriptions={subscriptions} 
            complaints={complaints} 
            feedbacks={feedbacks} 
            scans={scans} 
            weatherAlerts={weatherAlerts} 
            farmsMissing={farmsMissing}
            devicesMissing={devicesMissing}
            farmsCount={farms.length}
            devicesCount={devices.length}
            profilesMissing={profilesMissing}
            profilesSchemaIncomplete={profilesSchemaIncomplete}
            profilesErrorMsg={profilesErrorMsg}
          />
        );
      case "users":
        return (
          <Farmers 
            users={users} 
            subscriptions={subscriptions} 
            onSelectFarmer={setSelectedFarmer} 
            onRefresh={loadPortalData}
            profilesMissing={profilesMissing}
            profilesSchemaIncomplete={profilesSchemaIncomplete}
            profilesErrorMsg={profilesErrorMsg}
          />
        );
      case "farms":
        return (
          <Farms 
            farms={farms} 
            isMissing={farmsMissing} 
            errorMsg={farmsErrorMsg} 
          />
        );
      case "devices":
        return (
          <Devices 
            devices={devices} 
            isMissing={devicesMissing} 
            errorMsg={devicesErrorMsg} 
          />
        );
      case "alerts":
        return (
          <Weather 
            weatherAlerts={weatherAlerts} 
            users={users} 
            onRefresh={loadPortalData}
          />
        );
      case "scanner":
        return <Scanner scans={scans} />;
      case "complaints":
        return <Complaints complaints={complaints} onRefresh={loadPortalData} />;
      case "feedback":
        return <Feedback feedbacks={feedbacks} users={users} />;
      case "subscriptions":
        return <Subscriptions subscriptions={subscriptions} users={users} />;
      case "notifications":
        return (
          <Notifications 
            notifications={notifications} 
            onMarkAsRead={handleMarkAsRead} 
            onClearAll={handleClearAll} 
          />
        );
      case "analytics":
        return (
          <Analytics 
            users={users} 
            subscriptions={subscriptions} 
            scans={scans} 
            complaints={complaints} 
            feedbacks={feedbacks} 
            weatherAlerts={weatherAlerts} 
          />
        );
      case "settings":
        return <SettingsModule />;
      case "logs":
        return (
          <SystemLogs 
            users={users} 
            subscriptions={subscriptions} 
            scans={scans} 
            complaints={complaints} 
            feedbacks={feedbacks} 
            weatherAlerts={weatherAlerts} 
            onRefresh={loadPortalData}
          />
        );
      default:
        return <div className="text-slate-500">View not resolved.</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => { setSelectedFarmer(null); setActiveTab(tab); }}>
      {renderTab()}
    </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <PortalContent />
    </AuthProvider>
  );
};

export default App;
