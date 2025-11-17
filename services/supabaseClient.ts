import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompletedReport, User } from '../types';

// Database types matching Supabase schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          plan: 'pro' | 'basic';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          plan: 'pro' | 'basic';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          plan?: 'pro' | 'basic';
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          vehicle: any; // JSON
          summary: any; // JSON
          sections: any; // JSON
          vehicle_history: any; // JSON
          safety_recalls: any; // JSON
          theft_and_salvage: any; // JSON
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          date: string;
          vehicle: any;
          summary: any;
          sections: any;
          vehicle_history: any;
          safety_recalls: any;
          theft_and_salvage: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          vehicle?: any;
          summary?: any;
          sections?: any;
          vehicle_history?: any;
          safety_recalls?: any;
          theft_and_salvage?: any;
          created_at?: string;
        };
      };
    };
  };
}

// Check for required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is not set.");
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY environment variable is not set.");
}

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// DATABASE SERVICE FUNCTIONS
// ============================================

export const supabaseService = {
  /**
   * Save a report to Supabase
   */
  async saveReport(report: CompletedReport, userId: string): Promise<{ success: boolean; reportId: string }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          id: report.id,
          user_id: userId,
          date: report.date,
          vehicle: report.vehicle,
          summary: report.summary,
          sections: report.sections,
          vehicle_history: report.vehicleHistory,
          safety_recalls: report.safetyRecalls,
          theft_and_salvage: report.theftAndSalvage,
        });

      if (error) {
        console.error('[Supabase] Error saving report:', error);
        throw new Error(`Failed to save report: ${error.message}`);
      }

      console.log('[Supabase] Report saved successfully:', report.id);
      return { success: true, reportId: report.id };
    } catch (error) {
      console.error('[Supabase] Failed to save report:', error);
      throw error;
    }
  },

  /**
   * Get all reports for a user
   */
  async getReports(userId: string): Promise<CompletedReport[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase] Error fetching reports:', error);
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }

      // Transform database rows to CompletedReport format
      const reports: CompletedReport[] = (data || []).map(row => ({
        id: row.id,
        date: row.date,
        vehicle: row.vehicle,
        summary: row.summary,
        sections: row.sections,
        vehicleHistory: row.vehicle_history,
        safetyRecalls: row.safety_recalls,
        theftAndSalvage: row.theft_and_salvage,
      }));

      console.log('[Supabase] Fetched reports:', reports.length);
      return reports;
    } catch (error) {
      console.error('[Supabase] Failed to fetch reports:', error);
      throw error;
    }
  },

  /**
   * Get a single report by ID
   */
  async getReport(reportId: string, userId: string): Promise<CompletedReport | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('[Supabase] Error fetching report:', error);
        throw new Error(`Failed to fetch report: ${error.message}`);
      }

      if (!data) return null;

      return {
        id: data.id,
        date: data.date,
        vehicle: data.vehicle,
        summary: data.summary,
        sections: data.sections,
        vehicleHistory: data.vehicle_history,
        safetyRecalls: data.safety_recalls,
        theftAndSalvage: data.theft_and_salvage,
      };
    } catch (error) {
      console.error('[Supabase] Failed to fetch report:', error);
      throw error;
    }
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId);

      if (error) {
        console.error('[Supabase] Error deleting report:', error);
        throw new Error(`Failed to delete report: ${error.message}`);
      }

      console.log('[Supabase] Report deleted successfully:', reportId);
    } catch (error) {
      console.error('[Supabase] Failed to delete report:', error);
      throw error;
    }
  },

  /**
   * Get or create a user
   */
  async getOrCreateUser(email: string): Promise<User> {
    try {
      // Try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser && !fetchError) {
        return {
          id: existingUser.id,
          email: existingUser.email,
          plan: existingUser.plan,
        };
      }

      // Create new user if not found
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        plan: 'basic' as const,
      };

      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Error creating user:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      console.log('[Supabase] User created successfully:', newUser.id);
      return {
        id: data.id,
        email: data.email,
        plan: data.plan,
      };
    } catch (error) {
      console.error('[Supabase] Failed to get or create user:', error);
      throw error;
    }
  },

  /**
   * Update user plan
   */
  async updateUserPlan(userId: string, plan: 'pro' | 'basic'): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ plan })
        .eq('id', userId);

      if (error) {
        console.error('[Supabase] Error updating user plan:', error);
        throw new Error(`Failed to update user plan: ${error.message}`);
      }

      console.log('[Supabase] User plan updated successfully:', userId, plan);
    } catch (error) {
      console.error('[Supabase] Failed to update user plan:', error);
      throw error;
    }
  },

  /**
   * Test connection to Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        console.error('[Supabase] Connection test failed:', error);
        return false;
      }
      console.log('[Supabase] Connection test successful');
      return true;
    } catch (error) {
      console.error('[Supabase] Connection test failed:', error);
      return false;
    }
  }
};
