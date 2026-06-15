import { supabase } from "../integrations/supabase/client";

export interface Complaint {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  village: string;
  taluka: string;
  district: string;
  category: string;
  subject: string;
  message: string;
  screenshot_url?: string | null;
  status: "Pending" | "In Review" | "Resolved" | "Rejected";
  admin_reply?: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  feedback_message: string;
  language: string;
  created_at: string;
}

export class ComplaintService {
  static async getAllComplaints(): Promise<Complaint[]> {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Complaint[];
    } catch (err) {
      console.warn("getAllComplaints error:", err);
      return [];
    }
  }

  static async getAllFeedbacks(): Promise<Feedback[]> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Feedback[];
    } catch (err) {
      console.warn("getAllFeedbacks error:", err);
      return [];
    }
  }

  static async updateComplaintStatus(
    id: string,
    status: Complaint["status"],
    adminReply: string | null
  ): Promise<Complaint | null> {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .update({
          status,
          admin_reply: adminReply,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Complaint;
    } catch (err) {
      console.error("updateComplaintStatus error:", err);
      throw err;
    }
  }
}
