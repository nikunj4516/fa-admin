import { supabase } from "../integrations/supabase/client";

export interface ScanHistory {
  id: string;
  user_id: string;
  image_url: string;
  crop_name: string;
  disease_name: string;
  confidence_score: number;
  recommendation: string;
  created_at: string;
}

export class ScanHistoryService {
  static async getAllScans(): Promise<ScanHistory[]> {
    try {
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ScanHistory[];
    } catch (err) {
      console.warn("getAllScans error:", err);
      return [];
    }
  }
}
