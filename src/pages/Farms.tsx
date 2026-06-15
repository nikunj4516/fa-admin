import React from "react";
import { Layers, AlertTriangle, Play, HelpCircle } from "lucide-react";

interface FarmsProps {
  farms: any[];
  isMissing: boolean;
  errorMsg?: string;
}

export const Farms: React.FC<FarmsProps> = ({ farms, isMissing, errorMsg }) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Farm Management</h2>
        <p className="text-slate-500 text-sm mt-1">Review farm boundaries, owner associations, and cultivation reports.</p>
      </div>

      {isMissing ? (
        <div className="bg-white p-8 rounded-xl border border-red-100 shadow-sm max-w-3xl space-y-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Database Table Missing</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                The database table <code className="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-[10px]">public.farms</code> was not detected in your Supabase project schema.
              </p>
              {errorMsg && (
                <p className="text-slate-400 font-mono text-[10px] mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                  DB Diagnostics: {errorMsg}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4 text-xs">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">How to resolve:</span>
            <p className="text-slate-500 leading-normal">
              To activate Farm Management, open the **SQL Editor** in your **Supabase Dashboard** and run the following query to initialize the table and link its foreign keys:
            </p>
            
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner">
{`-- Create farms table linking users
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  area_acres NUMERIC,
  primary_crop TEXT,
  soil_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and insert admin policies
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all farms" ON public.farms FOR ALL TO authenticated USING (public.is_admin());`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center text-slate-500 text-sm">
          {farms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Farm Name</th>
                    <th className="py-3 px-4">Owner ID</th>
                    <th className="py-3 px-4">Area (Acres)</th>
                    <th className="py-3 px-4">Primary Crop</th>
                    <th className="py-3 px-4">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {farms.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{f.farm_name}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{f.user_id}</td>
                      <td className="py-3 px-4">{f.area_acres}</td>
                      <td className="py-3 px-4 font-semibold">{f.primary_crop}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {new Date(f.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 italic">No farms cataloged in the database.</p>
          )}
        </div>
      )}
    </div>
  );
};
