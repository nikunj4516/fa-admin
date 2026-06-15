import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Search, ShieldAlert, CheckCircle, Eye, Download, Users, Ban, ArrowUpDown } from "lucide-react";
import { ExportButton } from "../components/ExportButton";

interface FarmersProps {
  users: any[];
  subscriptions: any[];
  onSelectFarmer: (farmer: any) => void;
  onRefresh: () => void;
  profilesMissing?: boolean;
  profilesSchemaIncomplete?: boolean;
  profilesErrorMsg?: string;
}

export const Farmers: React.FC<FarmersProps> = ({
  users,
  subscriptions,
  onSelectFarmer,
  onRefresh,
  profilesMissing = false,
  profilesSchemaIncomplete = false,
  profilesErrorMsg = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");

  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toggle user suspension
  const toggleSuspension = async (farmer: any) => {
    const nextSuspended = !farmer.is_suspended;
    const confirmMsg = nextSuspended 
      ? `Are you sure you want to suspend ${farmer.name || "this user"}?`
      : `Are you sure you want to activate ${farmer.name || "this user"}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: nextSuspended })
        .eq("id", farmer.id);

      if (error) throw error;
      alert(`User status updated successfully.`);
      onRefresh();
    } catch (err) {
      console.error("Error toggling suspension:", err);
      alert("Failed to update suspension status.");
    }
  };

  // Get User Plan details
  const getPlan = (userId: string) => {
    const sub = subscriptions.find(s => s.user_id === userId);
    return sub && sub.subscription_status === "active" ? sub.plan_type : "FREE";
  };

  // Sorting Handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter & Search Logic
  const filteredUsers = users.filter(user => {
    const plan = getPlan(user.user_id);
    const isSuspended = user.is_suspended ?? false;
    const district = user.district || "";

    const matchesSearch = 
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").includes(searchTerm) ||
      (user.village || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.taluka || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === "All" || plan === planFilter;
    const matchesStatus = 
      statusFilter === "All" || 
      (statusFilter === "Suspended" && isSuspended) || 
      (statusFilter === "Active" && !isSuspended);
    
    const matchesDistrict = districtFilter === "All" || district.toLowerCase() === districtFilter.toLowerCase();

    return matchesSearch && matchesPlan && matchesStatus && matchesDistrict;
  });

  // Sort Logic
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortField] || "";
    let valB = b[sortField] || "";

    if (sortField === "plan") {
      valA = getPlan(a.user_id);
      valB = getPlan(b.user_id);
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const getDistrictOptions = () => {
    const dists = new Set(users.map(u => u.district).filter(Boolean));
    return Array.from(dists);
  };

  // Prep Data for Export
  const exportData = sortedUsers.map(u => ({
    ...u,
    plan: getPlan(u.user_id),
    status: u.is_suspended ? "Suspended" : "Active"
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Farmers Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage farmer profiles, subscription tiers, and account permissions.</p>
        </div>
        <ExportButton
          data={exportData}
          filename="farmalert_farmers_directory"
          headers={["ID", "Name", "Phone", "Village", "Taluka", "District", "State", "Plan", "Status", "Joined At"]}
          keys={["user_id", "name", "phone", "village", "taluka", "district", "state", "plan", "status", "created_at"]}
          label="Export Directory"
        />
      </div>

      {/* profiles schema warning banner */}
      {(profilesMissing || profilesSchemaIncomplete) && (
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm space-y-4 max-w-4xl text-xs">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
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

          <div className="border-t border-slate-100 pt-4 space-y-3">
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

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, village..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-primary/80 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none"
          >
            <option value="All">All Plans</option>
            <option value="FREE">Free Tier</option>
            <option value="PREMIUM">Premium Tier</option>
            <option value="PRO">Pro Tier</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Suspended">Suspended Accounts</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none"
          >
            <option value="All">All Districts</option>
            {getDistrictOptions().map((dist: any) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Profile</th>
                <th className="py-4 px-6 cursor-pointer hover:text-slate-600" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6 cursor-pointer hover:text-slate-600" onClick={() => handleSort("plan")}>
                  <div className="flex items-center gap-1">
                    Subscription <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 cursor-pointer hover:text-slate-600 text-right" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-1 justify-end">
                    Joined <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
              {currentItems.map((user) => {
                const plan = getPlan(user.user_id);
                const isSuspended = user.is_suspended ?? false;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {user.profile_image_url ? (
                          <img src={user.profile_image_url} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-bold text-slate-400 text-sm uppercase">{user.name?.[0] || "F"}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {user.name || "Incomplete Profile"}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">{user.phone || "N/A"}</td>
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <span className="font-medium text-slate-800">{user.village || "-"}</span>
                        <div className="text-slate-400 mt-0.5">{user.taluka ? `${user.taluka}, ` : ""}{user.district || "-"}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                        plan === "PRO" 
                          ? "bg-purple-50 text-purple-700 border-purple-100" 
                          : plan === "PREMIUM"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-slate-50 text-slate-600 border-slate-100"
                      }`}>
                        {plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isSuspended 
                          ? "bg-red-50 text-red-600" 
                          : "bg-green-50 text-green-600"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isSuspended ? "bg-red-500" : "bg-green-500"}`} />
                        {isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-mono">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => onSelectFarmer(user)}
                          title="View Profile Details"
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors active:scale-90"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleSuspension(user)}
                          title={isSuspended ? "Activate User" : "Suspend User"}
                          className={`p-1.5 rounded-lg transition-colors active:scale-90 ${
                            isSuspended 
                              ? "hover:bg-green-50 text-slate-400 hover:text-green-600" 
                              : "hover:bg-red-50 text-slate-400 hover:text-red-500"
                          }`}
                        >
                          {isSuspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching farmer records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="py-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} records
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
