/**
 * Real Backend Service using Supabase
 * NO MOCKS - Real database operations
 */

import { supabase, db } from './supabase';
import { CompletedReport } from '../types';

export const backendService = {
  /**
   * Save a completed inspection report
   */
  async saveReport(report: CompletedReport): Promise<{ success: boolean; reportId: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Get or create customer
      let customerId: string | null = null;
      if (report.customerInfo) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', report.customerInfo.email)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              name: report.customerInfo.name,
              email: report.customerInfo.email,
              phone: report.customerInfo.phone || null,
              created_by: user.id,
            })
            .select()
            .single();

          if (customerError) throw customerError;
          customerId = newCustomer.id;
        }
      }

      // 2. Get or create vehicle
      const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('vin', report.vehicle.vin)
        .single();

      let vehicleId: string;
      if (existingVehicle) {
        vehicleId = existingVehicle.id;
      } else {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            customer_id: customerId,
            vin: report.vehicle.vin,
            make: report.vehicle.make,
            model: report.vehicle.model,
            year: report.vehicle.year,
            mileage: parseInt(report.odometer) || null,
          })
          .select()
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = newVehicle.id;
      }

      // 3. Create inspection
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          vehicle_id: vehicleId,
          inspector_id: user.id,
          customer_id: customerId,
          vehicle_type: report.vehicleType,
          odometer: report.odometer,
          overall_notes: report.overallNotes || null,
          checklist: report.checklist,
          status: 'completed',
          price: report.price || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // 4. Upload photos to storage and save metadata
      if (report.photos && report.photos.length > 0) {
        for (const photo of report.photos) {
          // Convert base64 to blob
          const base64Data = photo.base64.split(',')[1] || photo.base64;
          const blob = await fetch(`data:${photo.mimeType};base64,${base64Data}`).then((res) =>
            res.blob()
          );

          // Upload to Supabase Storage
          const fileName = `${inspection.id}/${photo.id}.${photo.mimeType.split('/')[1]}`;
          const { error: uploadError } = await supabase.storage
            .from('inspection-photos')
            .upload(fileName, blob, {
              contentType: photo.mimeType,
              cacheControl: '3600',
            });

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            continue;
          }

          // Save photo metadata
          await supabase.from('inspection_photos').insert({
            inspection_id: inspection.id,
            category: photo.category,
            file_path: fileName,
            file_name: `${photo.id}.${photo.mimeType.split('/')[1]}`,
            mime_type: photo.mimeType,
            file_size: blob.size,
            notes: photo.notes || null,
          });
        }
      }

      // 5. Save DTC codes if any
      if (report.dtcCodes && report.dtcCodes.length > 0) {
        const dtcInserts = report.dtcCodes.map((code) => ({
          inspection_id: inspection.id,
          code: code.code,
          description: code.description,
        }));

        await supabase.from('dtc_codes').insert(dtcInserts);
      }

      // 6. Create report record
      const { error: reportError } = await supabase.from('reports').insert({
        inspection_id: inspection.id,
        overall_condition: report.summary?.overallCondition || null,
        key_findings: report.summary?.keyFindings || null,
        recommendations: report.summary?.recommendations || null,
        ai_summary: report.aiSummary || null,
        vehicle_history: report.vehicleHistory || null,
        safety_recalls: report.safetyRecalls || null,
        theft_record: report.theftRecord || null,
        dtc_analysis: report.dtcAnalysis || null,
      });

      if (reportError) throw reportError;

      // Log activity
      await db.logActivity('report_saved', 'inspection', inspection.id);

      return { success: true, reportId: inspection.id };
    } catch (error: any) {
      console.error('Error saving report:', error);
      throw new Error(`Failed to save report: ${error.message}`);
    }
  },

  /**
   * Get all reports for the current user
   */
  async getReports(): Promise<CompletedReport[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch inspections with all related data
      const { data: inspections, error } = await supabase
        .from('inspections')
        .select(
          `
          *,
          vehicle:vehicles(*),
          customer:customers(*),
          report:reports(*),
          photos:inspection_photos(*),
          dtc_codes(*)
        `
        )
        .eq('inspector_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!inspections) return [];

      // Transform database records to CompletedReport format
      const reports: CompletedReport[] = await Promise.all(
        inspections.map(async (inspection: any) => {
          // Fetch photo URLs
          const photos = await Promise.all(
            (inspection.photos || []).map(async (photo: any) => {
              const { data } = supabase.storage
                .from('inspection-photos')
                .getPublicUrl(photo.file_path);

              return {
                id: photo.id,
                category: photo.category,
                base64: data.publicUrl, // Use URL instead of base64
                mimeType: photo.mime_type,
                notes: photo.notes,
              };
            })
          );

          return {
            id: inspection.id,
            date: inspection.created_at,
            vehicle: {
              vin: inspection.vehicle.vin,
              make: inspection.vehicle.make,
              model: inspection.vehicle.model,
              year: inspection.vehicle.year,
            },
            vehicleType: inspection.vehicle_type,
            odometer: inspection.odometer,
            overallNotes: inspection.overall_notes,
            checklist: inspection.checklist,
            photos,
            summary: {
              overallCondition: inspection.report?.overall_condition || '',
              keyFindings: inspection.report?.key_findings || [],
              recommendations: inspection.report?.recommendations || [],
            },
            aiSummary: inspection.report?.ai_summary,
            vehicleHistory: inspection.report?.vehicle_history,
            safetyRecalls: inspection.report?.safety_recalls,
            theftRecord: inspection.report?.theft_record,
            dtcCodes: inspection.dtc_codes || [],
            dtcAnalysis: inspection.report?.dtc_analysis,
            customerInfo: inspection.customer
              ? {
                  name: inspection.customer.name,
                  email: inspection.customer.email,
                  phone: inspection.customer.phone,
                }
              : undefined,
            price: inspection.price,
          };
        })
      );

      return reports;
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }
  },

  /**
   * Get a single report by ID
   */
  async getReport(reportId: string): Promise<CompletedReport | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: inspection, error } = await supabase
        .from('inspections')
        .select(
          `
          *,
          vehicle:vehicles(*),
          customer:customers(*),
          report:reports(*),
          photos:inspection_photos(*),
          dtc_codes(*)
        `
        )
        .eq('id', reportId)
        .eq('inspector_id', user.id)
        .single();

      if (error) throw error;
      if (!inspection) return null;

      // Fetch photo URLs
      const photos = await Promise.all(
        (inspection.photos || []).map(async (photo: any) => {
          const { data } = supabase.storage
            .from('inspection-photos')
            .getPublicUrl(photo.file_path);

          return {
            id: photo.id,
            category: photo.category,
            base64: data.publicUrl,
            mimeType: photo.mime_type,
            notes: photo.notes,
          };
        })
      );

      return {
        id: inspection.id,
        date: inspection.created_at,
        vehicle: {
          vin: inspection.vehicle.vin,
          make: inspection.vehicle.make,
          model: inspection.vehicle.model,
          year: inspection.vehicle.year,
        },
        vehicleType: inspection.vehicle_type,
        odometer: inspection.odometer,
        overallNotes: inspection.overall_notes,
        checklist: inspection.checklist,
        photos,
        summary: {
          overallCondition: inspection.report?.overall_condition || '',
          keyFindings: inspection.report?.key_findings || [],
          recommendations: inspection.report?.recommendations || [],
        },
        aiSummary: inspection.report?.ai_summary,
        vehicleHistory: inspection.report?.vehicle_history,
        safetyRecalls: inspection.report?.safety_recalls,
        theftRecord: inspection.report?.theft_record,
        dtcCodes: inspection.dtc_codes || [],
        dtcAnalysis: inspection.report?.dtc_analysis,
        customerInfo: inspection.customer
          ? {
              name: inspection.customer.name,
              email: inspection.customer.email,
              phone: inspection.customer.phone,
            }
          : undefined,
        price: inspection.price,
      };
    } catch (error: any) {
      console.error('Error fetching report:', error);
      return null;
    }
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<{ success: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete inspection (cascade will handle related records)
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', reportId)
        .eq('inspector_id', user.id);

      if (error) throw error;

      // Delete photos from storage
      const { data: photos } = await supabase
        .from('inspection_photos')
        .select('file_path')
        .eq('inspection_id', reportId);

      if (photos && photos.length > 0) {
        const filePaths = photos.map((p) => p.file_path);
        await supabase.storage.from('inspection-photos').remove(filePaths);
      }

      await db.logActivity('report_deleted', 'inspection', reportId);

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting report:', error);
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  },
};
