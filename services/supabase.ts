/**
 * Supabase Client Configuration
 * Real database connection - NO MOCKS
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          role: 'inspector' | 'admin' | 'manager';
          subscription_plan: 'basic' | 'pro';
          subscription_status: 'active' | 'cancelled' | 'expired';
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      vehicles: {
        Row: {
          id: string;
          customer_id: string | null;
          vin: string;
          make: string;
          model: string;
          year: string;
          color: string | null;
          license_plate: string | null;
          mileage: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>;
      };
      inspections: {
        Row: {
          id: string;
          vehicle_id: string;
          inspector_id: string;
          customer_id: string | null;
          vehicle_type: 'standard' | 'ev' | 'commercial' | 'rv' | 'classic' | 'motorcycle';
          odometer: string;
          overall_notes: string | null;
          checklist: any; // JSON
          status: 'in_progress' | 'completed' | 'reviewed' | 'sent';
          price: number | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inspections']['Row'], 'id' | 'started_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inspections']['Insert']>;
      };
      inspection_photos: {
        Row: {
          id: string;
          inspection_id: string;
          category: string;
          file_path: string;
          file_name: string;
          mime_type: string;
          file_size: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inspection_photos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['inspection_photos']['Insert']>;
      };
      inspection_audio: {
        Row: {
          id: string;
          inspection_id: string;
          checklist_item: string | null;
          file_path: string;
          file_name: string;
          mime_type: string;
          file_size: number | null;
          duration: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inspection_audio']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['inspection_audio']['Insert']>;
      };
      reports: {
        Row: {
          id: string;
          inspection_id: string;
          overall_condition: string | null;
          key_findings: string[] | null;
          recommendations: string[] | null;
          ai_summary: string | null;
          ai_provider: string | null;
          vehicle_history: any | null;
          safety_recalls: any | null;
          theft_record: any | null;
          dtc_analysis: string | null;
          pdf_path: string | null;
          pdf_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          inspection_id: string | null;
          customer_id: string | null;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method: string | null;
          transaction_id: string | null;
          metadata: any | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      dtc_codes: {
        Row: {
          id: string;
          inspection_id: string;
          code: string;
          description: string | null;
          analysis: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dtc_codes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['dtc_codes']['Insert']>;
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: any | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_log']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['activity_log']['Insert']>;
      };
    };
  };
};

// Helper functions for common operations
export const db = {
  // Get current user profile
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile
  async updateProfile(updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Log activity
  async logActivity(action: string, resourceType?: string, resourceId?: string, metadata?: any) {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('activity_log')
      .insert({
        user_id: user?.id || null,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata,
      });

    if (error) console.error('Failed to log activity:', error);
  },
};

// Export types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type Inspection = Database['public']['Tables']['inspections']['Row'];
export type InspectionPhoto = Database['public']['Tables']['inspection_photos']['Row'];
export type InspectionAudio = Database['public']['Tables']['inspection_audio']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type DTCCode = Database['public']['Tables']['dtc_codes']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
