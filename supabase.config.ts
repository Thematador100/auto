import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          plan: 'pro' | 'basic' | 'trial';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
          trial_ends_at: string | null;
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          plan?: 'pro' | 'basic' | 'trial';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
          trial_ends_at?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          plan?: 'pro' | 'basic' | 'trial';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
          trial_ends_at?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          vehicle_vin: string;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year: string;
          vehicle_type: string;
          odometer: string;
          report_data: any; // JSONB field containing full CompletedReport
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_vin: string;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year: string;
          vehicle_type: string;
          odometer: string;
          report_data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vehicle_vin?: string;
          vehicle_make?: string;
          vehicle_model?: string;
          vehicle_year?: string;
          vehicle_type?: string;
          odometer?: string;
          report_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'subscription' | 'report_purchase' | 'credit_purchase';
          amount: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'subscription' | 'report_purchase' | 'credit_purchase';
          amount: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'subscription' | 'report_purchase' | 'credit_purchase';
          amount?: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          metadata?: any;
          created_at?: string;
        };
      };
    };
  };
}
