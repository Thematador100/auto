import { Router } from 'express';
import { db } from '../db/index.js';
import { reports, vehicles } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

export const reportsRouter = Router();

// All routes require authentication
reportsRouter.use(authenticateToken);

const createReportSchema = z.object({
  vehicleId: z.string().uuid(),
  reportData: z.any(),
  summary: z.object({
    overallCondition: z.string(),
    keyFindings: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  vehicleHistory: z.any().optional(),
  safetyRecalls: z.any().optional(),
  theftAndSalvage: z.any().optional(),
});

// Create report
reportsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createReportSchema.parse(req.body);
    const userId = req.userId!;

    // Verify vehicle belongs to user
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, data.vehicleId), eq(vehicles.userId, userId)));

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Create report
    const [newReport] = await db
      .insert(reports)
      .values({
        userId,
        vehicleId: data.vehicleId,
        reportData: data.reportData,
        summary: data.summary,
        vehicleHistory: data.vehicleHistory,
        safetyRecalls: data.safetyRecalls,
        theftAndSalvage: data.theftAndSalvage,
      })
      .returning();

    res.status(201).json(newReport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    next(error);
  }
});

// Get all reports for user
reportsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const userReports = await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));

    res.json(userReports);
  } catch (error) {
    next(error);
  }
});

// Get single report
reportsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const reportId = req.params.id;

    const [report] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, reportId), eq(reports.userId, userId)));

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Delete report
reportsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const reportId = req.params.id;

    const [deleted] = await db
      .delete(reports)
      .where(and(eq(reports.id, reportId), eq(reports.userId, userId)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
