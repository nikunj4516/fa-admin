import React from "react";
import { Cpu, AlertTriangle } from "lucide-react";

interface DevicesProps {
  devices: any[];
  isMissing: boolean;
  errorMsg?: string;
}

export const Devices: React.FC<DevicesProps> = ({ devices, isMissing, errorMsg }) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Device Management</h2>
        <p className="text-slate-500 text-sm mt-1">Monitor connected agricultural IoT sensors, gateway telemetry, and transmission health.</p>
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
                The database table <code className="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-[10px]">public.devices</code> was not detected in your Supabase project schema.
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
              To activate Device Management, open the **SQL Editor** in your **Supabase Dashboard** and run the following query to initialize the table:
            </p>
            
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner">
{`-- Create devices table
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_uid TEXT UNIQUE NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  device_type TEXT CHECK (device_type IN ('soil_moisture', 'weather_station', 'irrigation_valve')),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  last_communication TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and insert admin policies
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all devices" ON public.devices FOR ALL TO authenticated USING (public.is_admin());`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center text-slate-500 text-sm">
          {devices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Device UID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Battery</th>
                    <th className="py-3 px-4">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {devices.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{d.device_uid}</td>
                      <td className="py-3 px-4 uppercase text-[10px]">{d.device_type?.replace("_", " ")}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === "online" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{d.battery_level}%</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {new Date(d.last_communication).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 italic">No IoT devices registered in the database.</p>
          )}
        </div>
      )}
    </div>
  );
};
