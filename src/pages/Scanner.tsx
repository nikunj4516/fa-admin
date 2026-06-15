import React, { useState } from "react";
import { Scan, Eye, Heart, BarChart, X, ShieldAlert, Award } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { ExportButton } from "../components/ExportButton";

interface ScannerProps {
  scans: any[];
}

export const Scanner: React.FC<ScannerProps> = ({ scans }) => {
  const [selectedScan, setSelectedScan] = useState<any | null>(null);

  // Statistics
  const totalScans = scans.length;
  const avgConfidence = totalScans > 0
    ? (scans.reduce((acc, s) => acc + s.confidence_score, 0) / totalScans).toFixed(1)
    : "N/A";

  const getDiseaseRankings = () => {
    const ranks: Record<string, number> = {};
    scans.forEach(s => {
      ranks[s.disease_name] = (ranks[s.disease_name] || 0) + 1;
    });
    return Object.entries(ranks)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const diseaseRankings = getDiseaseRankings();
  const mostCommonDisease = diseaseRankings[0]?.name || "N/A";

  // Affected Villages list
  const getAffectedLocations = () => {
    const locations = new Set(scans.map(s => s.crop_name).filter(Boolean)); // can be mapped to village if we join profiles, but since scan_history has user_id, we look up or estimate. For now, list distinct crop types
    return Array.from(locations);
  };

  const cropTypes = getAffectedLocations();

  // Chart Data
  const chartData = diseaseRankings.slice(0, 5);
  const COLORS = ["#EF4444", "#F59E0B", "#2563EB", "#16A34A", "#8B5CF6"];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Crop Disease Diagnostics</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor crop scanning activities, disease breakouts, and AI confidence levels.</p>
        </div>
        <ExportButton
          data={scans}
          filename="farmalert_disease_scans_log"
          headers={["ID", "User ID", "Crop Name", "Disease", "Confidence", "Recommendation", "Created At"]}
          keys={["id", "user_id", "crop_name", "disease_name", "confidence_score", "recommendation", "created_at"]}
          label="Export Scans Log"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total AI Scans</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalScans}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Scan className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Confidence Match</span>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{avgConfidence}%</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Diagnosed Threat</span>
            <h3 className="text-sm font-bold text-red-600 mt-2 truncate w-44">{mostCommonDisease}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Crops Under Scanning</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{cropTypes.length} Classes</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Scans List Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm xl:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Real-time Diagnostics Feed</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Diagnosed Condition</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                {scans.slice(0, 15).map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      {scan.image_url ? (
                        <img src={scan.image_url} alt="disease crop" className="h-9 w-9 object-cover rounded-lg border border-slate-100" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Scan className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{scan.crop_name}</td>
                    <td className="py-3 px-4">
                      <span className="text-red-600 font-semibold">{scan.disease_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        scan.confidence_score > 85 
                          ? "bg-green-50 text-green-700" 
                          : scan.confidence_score > 60
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {scan.confidence_score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {scans.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">No diagnostic events tracked.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Top Diseases Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Breakout Risk Rankings</h4>
            <p className="text-slate-400 text-xs mt-0.5">Most common diagnoses across Gujarat villages</p>
          </div>

          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart layout="vertical" data={chartData}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={80} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No diagnostic charts available.
              </div>
            )}
          </div>

          {/* Critical advice */}
          <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs text-red-800">
            <span className="font-bold">Agronomist Advisory Trigger:</span> If confidence rating drops below 60% repeatedly, manual review is advised via agricultural extension agents.
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-950 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm">Diagnostic Details</h3>
              <button onClick={() => setSelectedScan(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {selectedScan.image_url ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                  <img src={selectedScan.image_url} alt="breakout crop" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
                  <Scan className="h-12 w-12 text-slate-300" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Crop Type</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedScan.crop_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">AI Diagnosis</span>
                  <p className="text-sm font-bold text-red-600 mt-0.5">{selectedScan.disease_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Confidence</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedScan.confidence_score}% Match</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Recorded Date</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{new Date(selectedScan.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-1">
                <span className="font-bold text-indigo-900 uppercase tracking-wide text-[9px]">AI Recommendation</span>
                <p className="text-indigo-800 leading-relaxed">{selectedScan.recommendation || "No immediate action prescribed."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
