import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { 
  ClipboardList, Search, MessageSquare, ShieldAlert, CheckCircle, 
  Clock, X, Send, User, MapPin, Phone, Eye, Star 
} from "lucide-react";
import { ExportButton } from "../components/ExportButton";

interface ComplaintsProps {
  complaints: any[];
  onRefresh: () => void;
}

export const Complaints: React.FC<ComplaintsProps> = ({
  complaints,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [ticketStatus, setTicketStatus] = useState<any>("Pending");
  const [updating, setUpdating] = useState(false);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: ticketStatus,
          admin_reply: replyText || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedTicket.id);

      if (error) throw error;
      
      alert("Ticket updated successfully.");
      setSelectedTicket(null);
      setReplyText("");
      onRefresh();
    } catch (err) {
      console.error("Error updating complaint:", err);
      alert("Failed to update ticket.");
    } finally {
      setUpdating(false);
    }
  };

  // Filter complaints
  const filteredTickets = complaints.filter(c => {
    const matchesSearch = 
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").includes(searchTerm) ||
      (c.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.message || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-50 text-green-700 border-green-200";
      case "In Review":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Complaints & Feedback Tickets</h2>
          <p className="text-slate-500 text-sm mt-1">Review tickets, send responses directly to farmers, and track resolution metrics.</p>
        </div>
        <ExportButton
          data={complaints}
          filename="farmalert_complaints_export"
          headers={["Ticket ID", "Name", "Phone", "Village", "Category", "Subject", "Message", "Status", "Admin Reply", "Created At"]}
          keys={["id", "name", "phone", "village", "category", "subject", "message", "status", "admin_reply", "created_at"]}
          label="Export Tickets"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, names, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-primary/80 transition-colors"
          />
        </div>

        <div className="flex gap-3 w-full lg:w-auto justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Weather Issue">Weather Issue</option>
            <option value="Translation Issue">Translation Issue</option>
            <option value="Scanner Issue">Scanner Issue</option>
            <option value="News Issue">News Issue</option>
            <option value="Profile Issue">Profile Issue</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => {
          const isPending = ticket.status === "Pending";

          return (
            <div 
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setReplyText(ticket.admin_reply || "");
                setTicketStatus(ticket.status);
              }}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover-card-trigger cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider shrink-0 ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: FA-{ticket.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{ticket.subject}</h4>
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-wider block mt-1">
                    {ticket.category}
                  </span>
                  <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">{ticket.message}</p>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700">{ticket.name}</span>
                  <div className="text-slate-400 mt-0.5">{ticket.village}, {ticket.district}</div>
                </div>
                <span className="text-slate-400 text-[10px]">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
        {filteredTickets.length === 0 && (
          <div className="py-12 text-center text-slate-400 col-span-full">
            No complaints matching the selected filters.
          </div>
        )}
      </div>

      {/* Manage Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-100 shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-950 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm">Review Support Ticket</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto">
              {/* Left Column - Details */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold text-[9px]">Ticket ID</span>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">{selectedTicket.id}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold text-[9px]">Subject</span>
                  <h4 className="font-bold text-sm text-slate-800 mt-0.5 leading-snug">{selectedTicket.subject}</h4>
                </div>

                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold text-[9px]">Advisory Description</span>
                  <p className="text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {selectedTicket.screenshot_url && (
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider font-semibold text-[9px] block mb-1.5">Farmer Screenshot</span>
                    <a 
                      href={selectedTicket.screenshot_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="aspect-video w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm block relative group"
                    >
                      <img src={selectedTicket.screenshot_url} alt="screenshot" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold">
                        <Eye className="h-5 w-5 mr-1" /> View Full Image
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column - Actions */}
              <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-4">
                {/* Farmer Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-3">
                  <span className="font-bold text-slate-900 block border-b border-slate-200/60 pb-1.5 uppercase tracking-wide text-[9px]">Farmer Details</span>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{selectedTicket.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{selectedTicket.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedTicket.village}, {selectedTicket.district}</span>
                  </div>
                </div>

                {/* Form to Reply & Update */}
                <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider font-semibold text-[9px] mb-1.5">
                      Ticket Status
                    </label>
                    <select
                      value={ticketStatus}
                      onChange={(e) => setTicketStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider font-semibold text-[9px] mb-1.5">
                      Admin Reply / Resolution Message
                    </label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply to the farmer..."
                      className="w-full px-3 py-2 border border-slate-200 focus:border-primary/80 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all-200 focus:outline-none active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {updating ? "Saving Update..." : "Submit Reply"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
