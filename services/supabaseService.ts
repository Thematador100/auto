import { supabase, Database } from '../supabase.config';
import { CompletedReport, User } from '../types';
import { offlineService } from './offlineService';

type DbUser = Database['public']['Tables']['users']['Row'];
type DbReport = Database['public']['Tables']['reports']['Row'];
type DbTransaction = Database['public']['Tables']['transactions']['Row'];

// Authentication Service
export const authService = {
  // Sign up new user
  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'User creation failed' };
      }

      // Fetch user profile
      const profile = await this.getUserProfile(data.user.id);

      return {
        success: true,
        user: profile || {
          id: data.user.id,
          email: data.user.email!,
          plan: 'trial'
        }
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Sign in failed' };
      }

      const profile = await this.getUserProfile(data.user.id);

      return {
        success: true,
        user: profile || {
          id: data.user.id,
          email: data.user.email!,
          plan: 'basic'
        }
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // Sign in with OAuth (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    return data.session;
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();

    if (!session) {
      return null;
    }

    const profile = await this.getUserProfile(session.user.id);

    return profile || {
      id: session.user.id,
      email: session.user.email!,
      plan: 'basic'
    };
  },

  // Get user profile from database
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      plan: data.plan as 'pro' | 'basic'
    };
  },

  // Update user plan
  async updateUserPlan(userId: string, plan: 'pro' | 'basic', subscriptionId?: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        plan,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return !error;
  },

  // Listen for auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id);
        callback(profile || {
          id: session.user.id,
          email: session.user.email!,
          plan: 'basic'
        });
      } else {
        callback(null);
      }
    });
  }
};

// Report Service
export const reportService = {
  // Save report to Supabase (with offline fallback)
  async saveReport(report: CompletedReport, userId: string): Promise<{ success: boolean; reportId: string; error?: string }> {
    try {
      // Try to save to Supabase
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: userId,
          vehicle_vin: report.vehicle.vin,
          vehicle_make: report.vehicle.make,
          vehicle_model: report.vehicle.model,
          vehicle_year: report.vehicle.year,
          vehicle_type: 'standard', // Add vehicle type to CompletedReport if needed
          odometer: '0', // Add odometer to CompletedReport if needed
          report_data: report
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase save error, falling back to offline:', error);
        // Fallback to offline storage
        offlineService.saveReport(report);
        return { success: true, reportId: report.id, error: 'Saved offline (will sync when online)' };
      }

      // Also save to offline storage for offline access
      offlineService.saveReport(report);

      return { success: true, reportId: data.id };
    } catch (err) {
      console.error('Save report error:', err);
      // Fallback to offline storage
      offlineService.saveReport(report);
      return { success: true, reportId: report.id, error: 'Saved offline' };
    }
  },

  // Get all reports for a user
  async getReports(userId: string): Promise<CompletedReport[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch reports error, using offline:', error);
        return offlineService.getReports();
      }

      // Merge with offline reports
      const onlineReports = data.map((r: DbReport) => r.report_data as CompletedReport);
      const offlineReports = offlineService.getReports();

      // Deduplicate by ID
      const reportMap = new Map<string, CompletedReport>();
      [...onlineReports, ...offlineReports].forEach(r => reportMap.set(r.id, r));

      return Array.from(reportMap.values()).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (err) {
      console.error('Get reports error:', err);
      return offlineService.getReports();
    }
  },

  // Get single report by ID
  async getReport(reportId: string, userId: string): Promise<CompletedReport | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Check offline storage
        const offlineReports = offlineService.getReports();
        return offlineReports.find(r => r.id === reportId) || null;
      }

      return data.report_data as CompletedReport;
    } catch (err) {
      console.error('Get report error:', err);
      const offlineReports = offlineService.getReports();
      return offlineReports.find(r => r.id === reportId) || null;
    }
  },

  // Delete report
  async deleteReport(reportId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.error('Delete report error:', err);
      return false;
    }
  },

  // Sync offline reports to Supabase
  async syncOfflineReports(userId: string): Promise<{ synced: number; failed: number }> {
    const offlineReports = offlineService.getReports();
    let synced = 0;
    let failed = 0;

    for (const report of offlineReports) {
      try {
        const { error } = await supabase
          .from('reports')
          .insert({
            user_id: userId,
            vehicle_vin: report.vehicle.vin,
            vehicle_make: report.vehicle.make,
            vehicle_model: report.vehicle.model,
            vehicle_year: report.vehicle.year,
            vehicle_type: 'standard',
            odometer: '0',
            report_data: report
          });

        if (!error) {
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { synced, failed };
  }
};

// Payment/Transaction Service
export const paymentService = {
  // Record transaction
  async recordTransaction(
    userId: string,
    type: 'subscription' | 'report_purchase' | 'credit_purchase',
    amount: number,
    paymentIntentId?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type,
          amount,
          stripe_payment_intent_id: paymentIntentId,
          status: 'completed',
          metadata
        });

      return !error;
    } catch (err) {
      console.error('Record transaction error:', err);
      return false;
    }
  },

  // Get user transactions
  async getTransactions(userId: string): Promise<DbTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data;
    } catch (err) {
      console.error('Get transactions error:', err);
      return [];
    }
  }
};

// Export combined service
export const supabaseService = {
  auth: authService,
  reports: reportService,
  payments: paymentService
};
